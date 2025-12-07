/**
 * Script to generate summaries for threats that don't have one yet
 * Run with: tsx src/scripts/generate-summaries.ts
 */

import { prisma } from "../prisma.js"
import { summarizeThreat } from "../llm.js"

async function generateSummaries() {
  console.log("📝 Generating summaries for threats without summaries...")

  // Get all threats without summaries
  const threats = await prisma.threat.findMany({
    where: {
      OR: [
        { summary: null },
        { summary: "" },
      ],
    },
  })

  console.log(`📋 Found ${threats.length} threats without summaries`)

  if (threats.length === 0) {
    console.log("✅ All threats already have summaries!")
    return
  }

  let processed = 0
  let errors = 0

  for (const threat of threats) {
    try {
      console.log(`\n📝 Processing threat ${threat.id}: ${threat.title.substring(0, 60)}...`)

      // Get description from rawData
      const rawData = threat.rawData as any
      const description = rawData?.description || ""

      if (!description) {
        console.log(`  ⚠️  No description found, skipping`)
        errors++
        continue
      }

      // Generate summary
      const summary = await summarizeThreat(threat.title, description, threat.tags)

      // Update threat with summary
      await prisma.threat.update({
        where: { id: threat.id },
        data: { summary },
      })

      console.log(`  ✅ Generated summary (${summary.length} characters)`)
      processed++

      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000))
    } catch (error) {
      console.error(`  ❌ Error processing threat ${threat.id}:`, error)
      errors++
    }
  }

  console.log(`\n✅ Summary generation completed:`)
  console.log(`  - Processed: ${processed}`)
  console.log(`  - Errors: ${errors}`)
}

generateSummaries()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

