/**
 * Script to delete all threats and re-ingest the first 20
 * Run with: tsx src/scripts/reset-and-ingest.ts
 */

import { prisma } from "../prisma.js"
import { fetchRSSFeeds, extractCVSS, extractTags } from "../ingest/rss.js"
import { mapThreatToControls } from "../mapping-rules.js"
import { isRelevantForKMU, mapThreatToControlsLLM, summarizeThreat } from "../llm.js"

async function resetAndIngest() {
  console.log("🗑️  Deleting all threats...")

  // Delete all threat control mappings first (foreign key constraint)
  const deletedMappings = await prisma.threatControlMap.deleteMany({})
  console.log(`  ✅ Deleted ${deletedMappings.count} threat control mappings`)

  // Delete all threats
  const deletedThreats = await prisma.threat.deleteMany({})
  console.log(`  ✅ Deleted ${deletedThreats.count} threats`)

  console.log("\n📡 Fetching RSS feeds...")
  const rssFeeds = await fetchRSSFeeds()

  let processedCount = 0
  let filteredCount = 0
  const MAX_THREATS = 20

  for (const feed of rssFeeds) {
    if (processedCount >= MAX_THREATS) {
      console.log(`\n⏹️  Reached limit of ${MAX_THREATS} threats, stopping`)
      break
    }

    console.log(`\n📰 Processing ${feed.items.length} items from ${feed.source}...`)

    for (const item of feed.items) {
      if (processedCount >= MAX_THREATS) {
        console.log(`\n⏹️  Reached limit of ${MAX_THREATS} threats, stopping`)
        break
      }

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

  console.log(`\n✅ Ingest completed: ${processedCount} processed, ${filteredCount} filtered out`)
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

  // Generate summary directly (instead of queueing)
  try {
    console.log(`  📝 Generating summary...`)
    const summary = await summarizeThreat(data.title, data.description, data.tags)
    
    await prisma.threat.update({
      where: { id: threat.id },
      data: { summary },
    })
    
    console.log(`  ✅ Generated summary (${summary.length} characters)`)
  } catch (error) {
    console.error(`  ⚠️  Failed to generate summary:`, error)
  }

  console.log(`  ✅ Created threat ${threat.id} with ${createdMappings}/${controlMappings.length} control mappings`)
}

resetAndIngest()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

