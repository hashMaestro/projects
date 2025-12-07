/**
 * Script to remap existing threats to the new production controls
 * Run with: tsx src/scripts/remap-threats.ts
 */

import { prisma } from "../prisma.js"
import { mapThreatToControls } from "../mapping-rules.js"
import { mapThreatToControlsLLM } from "../llm.js"

async function remapThreats() {
  console.log("🔄 Starting threat remapping...")

  // Get all threats without control mappings or with old mappings
  const threats = await prisma.threat.findMany({
    include: {
      controlMappings: true,
    },
  })

  console.log(`📋 Found ${threats.length} threats to process`)

  let remapped = 0
  let skipped = 0
  let errors = 0

  for (const threat of threats) {
    try {
      // Skip if already has mappings (optional - remove this if you want to remap all)
      if (threat.controlMappings.length > 0) {
        console.log(`⏭️  Skipping ${threat.id} - already has ${threat.controlMappings.length} mappings`)
        skipped++
        continue
      }

      // Get threat data
      const rawData = threat.rawData as any
      const description = rawData?.description || ""

      // Map to controls using LLM (primary) and rule-based (fallback)
      let controlMappings = await mapThreatToControlsLLM(threat.title, description, threat.tags)

      // Fallback to rule-based if LLM returns nothing
      if (controlMappings.length === 0) {
        console.log(`  📋 Using rule-based mapping for ${threat.ref}`)
        controlMappings = mapThreatToControls(threat.tags)
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
        errors++
        continue
      }

      // Delete existing mappings (if any)
      if (threat.controlMappings.length > 0) {
        await prisma.threatControlMap.deleteMany({
          where: { threatId: threat.id },
        })
      }

      // Create new control mappings
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
        }
      }

      console.log(`  ✅ Remapped threat ${threat.id} with ${createdMappings}/${controlMappings.length} control mappings`)
      remapped++
    } catch (error) {
      console.error(`  ❌ Error remapping threat ${threat.id}:`, error)
      errors++
    }
  }

  console.log(`\n✅ Remapping completed:`)
  console.log(`  - Remapped: ${remapped}`)
  console.log(`  - Skipped: ${skipped}`)
  console.log(`  - Errors: ${errors}`)
}

remapThreats()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

