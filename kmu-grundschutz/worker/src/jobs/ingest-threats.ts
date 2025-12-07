import { Job } from "bullmq"
import { prisma } from "../prisma.js"
import { fetchBSIThreats } from "../ingest/bsi.js"
import { fetchNVDThreats } from "../ingest/nvd.js"
import { fetchRSSFeeds, extractCVSS, extractTags } from "../ingest/rss.js"
import { mapThreatToControls } from "../mapping-rules.js"
import { isRelevantForKMU, mapThreatToControlsLLM } from "../llm.js"
import { summarizeThreat } from "../llm.js"
import { threatProcessQueue } from "../queue.js"

export async function ingestThreatsJob(job: Job) {
  console.log("Starting threat ingest job...")

  let processedCount = 0
  let filteredCount = 0

  // Fetch from RSS feeds
  console.log("📡 Fetching RSS feeds...")
  const rssFeeds = await fetchRSSFeeds()
  
  for (const feed of rssFeeds) {
    console.log(`\n📰 Processing ${feed.items.length} items from ${feed.source}...`)
    
    for (const item of feed.items) {
      try {
        // Check if relevant for KMU using LLM
        const isRelevant = await isRelevantForKMU(item.title, item.description)
        
        if (!isRelevant) {
          console.log(`  ⏭️  Filtered out (not relevant for KMU): ${item.title.substring(0, 60)}...`)
          filteredCount++
          continue
        }

        // Extract metadata
        const cvss = extractCVSS(item.description)
        const tags = extractTags(item.title, item.description)
        
        // Generate unique ref from guid or link, but make it more readable
        let ref = item.guid || item.link || `${feed.source}-${item.pubDate.getTime()}`
        
        // Clean up URN-style identifiers (e.g., "urn:bid:4976852" -> "BID-4976852")
        if (ref.startsWith("urn:")) {
          const parts = ref.split(":")
          if (parts.length >= 3) {
            const prefix = parts[1].toUpperCase()
            const id = parts.slice(2).join(":")
            ref = `${prefix}-${id}`
          }
        }
        
        // Extract ID from URLs if possible
        if (ref.includes("/") && !ref.startsWith("http")) {
          const urlParts = ref.split("/")
          const lastPart = urlParts[urlParts.length - 1]
          if (lastPart && lastPart.length < 50) {
            ref = lastPart
          }
        }

        await processThreat({
          source: feed.source,
          title: item.title,
          ref,
          description: item.description,
          publishedAt: item.pubDate,
          tags,
          cvss,
          link: item.link,
        })
        
        processedCount++
      } catch (error) {
        console.error(`  ❌ Error processing RSS item:`, error)
      }
    }
  }

  // Fetch from BSI (legacy stub)
  const bsiThreats = await fetchBSIThreats()
  console.log(`\n📥 Fetched ${bsiThreats.length} threats from BSI (stub)`)
  for (const threat of bsiThreats) {
    await processThreat({
      source: "BSI",
      title: threat.title,
      ref: threat.ref,
      description: threat.description,
      publishedAt: threat.publishedAt,
      tags: threat.tags,
      cvss: threat.cvss,
    })
    processedCount++
  }

  // Fetch from NVD (legacy stub)
  const nvdThreats = await fetchNVDThreats()
  console.log(`\n📥 Fetched ${nvdThreats.length} threats from NVD (stub)`)
  for (const threat of nvdThreats) {
    await processThreat({
      source: "NVD",
      title: threat.title,
      ref: threat.cveId,
      description: threat.description,
      publishedAt: threat.publishedAt,
      tags: threat.tags,
      cvss: threat.cvss,
    })
    processedCount++
  }

  console.log(`\n✅ Threat ingest completed: ${processedCount} processed, ${filteredCount} filtered out`)
}

async function processThreat(data: {
  source: string
  title: string
  ref: string
  description: string
  publishedAt: Date
  tags: string[]
  cvss?: number
  link?: string
}) {
  // Check if threat already exists
  const existing = await prisma.threat.findFirst({
    where: {
      source: data.source,
      ref: data.ref,
    },
  })

  if (existing) {
    console.log(`  ⏭️  Threat ${data.ref} already exists, skipping`)
    return
  }

  // Map to controls using LLM (primary) and rule-based (fallback)
  let controlMappings = await mapThreatToControlsLLM(data.title, data.description, data.tags)
  
  // Fallback to rule-based if LLM returns nothing
  if (controlMappings.length === 0) {
    console.log(`  📋 Using rule-based mapping for ${data.ref}`)
    controlMappings = mapThreatToControls(data.tags)
  } else {
    console.log(`  🤖 LLM mapped to ${controlMappings.length} controls`)
  }

  console.log(`  📊 Found ${controlMappings.length} control mappings: ${controlMappings.map(m => `${m.controlKey}(${m.weight})`).join(", ")}`)

  // Get control IDs
  const controlIds = new Map<string, string>()
  const missingControls: string[] = []
  for (const mapping of controlMappings) {
    const control = await prisma.control.findUnique({
      where: { key: mapping.controlKey },
    })
    if (control) {
      controlIds.set(mapping.controlKey, control.id)
    } else {
      missingControls.push(mapping.controlKey)
      console.log(`  ⚠️  Control ${mapping.controlKey} not found in database`)
    }
  }

  if (missingControls.length > 0) {
    console.log(`  ⚠️  Missing controls: ${missingControls.join(", ")} - Please run: cd apps/web && npm run db:seed`)
  }

  // Create threat
  const threat = await prisma.threat.create({
    data: {
      source: data.source,
      title: data.title,
      ref: data.ref,
      cvss: data.cvss,
      tags: data.tags,
      publishedAt: data.publishedAt,
      rawData: {
        description: data.description,
        link: data.link,
      },
    },
  })

  // Create control mappings
  let createdMappings = 0
  for (const mapping of controlMappings) {
    const controlId = controlIds.get(mapping.controlKey)
    if (controlId) {
      await prisma.threatControlMap.create({
        data: {
          threatId: threat.id,
          controlId,
          weight: mapping.weight,
        },
      })
      createdMappings++
    } else {
      console.log(`  ⚠️  Skipping mapping for ${mapping.controlKey} - control not found`)
    }
  }

  // Queue for LLM processing (summarization)
  await threatProcessQueue.add("process-threat", {
    threatId: threat.id,
    title: data.title,
    description: data.description,
    tags: data.tags,
  })

  console.log(`  ✅ Created threat ${threat.id} with ${createdMappings}/${controlMappings.length} control mappings`)
}

