import { Job } from "bullmq"
import { prisma } from "../prisma.js"
import { checkHIBP } from "../ingest/hibp.js"
import { sendExposureNotification } from "../mailer.js"

interface LeakCheckJobData {
  orgId: string
  domainId?: string // Optional: check specific domain, otherwise check all
}

export async function leakCheckJob(job: Job<LeakCheckJobData>) {
  const { orgId, domainId } = job.data

  console.log(`🔍 Starting leak check for org ${orgId}${domainId ? `, domain ${domainId}` : ""}`)

  // Get domains to check
  const domains = domainId
    ? await prisma.orgDomain.findMany({
        where: { id: domainId, orgId },
      })
    : await prisma.orgDomain.findMany({
        where: { orgId },
      })

  if (domains.length === 0) {
    console.log(`⚠️  No domains found for org ${orgId}`)
    return
  }

  let newExposuresCount = 0

  for (const domain of domains) {
    console.log(`  Checking domain: ${domain.domain}`)

    try {
      // Call HIBP mock API
      const result = await checkHIBP(domain.domain)

      // Process each breach
      for (const breach of result.breaches) {
        // Check if this exposure already exists
        const existing = await prisma.exposure.findUnique({
          where: {
            orgId_domain_source: {
              orgId: domain.orgId,
              domain: domain.domain,
              source: `HIBP:${breach.name}`,
            },
          },
        })

        if (!existing) {
          // New exposure found - create it
          const exposure = await prisma.exposure.create({
            data: {
              orgId: domain.orgId,
              domainId: domain.id,
              domain: domain.domain,
              source: `HIBP:${breach.name}`,
              firstSeenAt: new Date(breach.breachDate),
            },
          })

          console.log(`  ⚠️  New exposure found: ${breach.name} for ${domain.domain}`)
          newExposuresCount++

          // Send notification
          await sendExposureNotification(domain.orgId, domain.domain, breach.name)
        } else {
          console.log(`  ✓ Exposure already known: ${breach.name}`)
        }
      }
    } catch (error) {
      console.error(`  ❌ Error checking domain ${domain.domain}:`, error)
      throw error
    }
  }

  console.log(`✅ Leak check completed. Found ${newExposuresCount} new exposure(s)`)
  return { newExposuresCount }
}

