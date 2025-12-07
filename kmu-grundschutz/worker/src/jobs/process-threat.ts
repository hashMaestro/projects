import { Job } from "bullmq"
import { prisma } from "../prisma.js"
import { summarizeThreat } from "../llm.js"

export async function processThreatJob(job: Job<{ threatId: string; title: string; description: string; tags: string[] }>) {
  const { threatId, title, description, tags } = job.data

  console.log(`Processing threat ${threatId} for LLM summarization...`)

  // Generate summary
  const summary = await summarizeThreat(title, description, tags)

  // Update threat with summary
  await prisma.threat.update({
    where: { id: threatId },
    data: { summary },
  })

  console.log(`Updated threat ${threatId} with summary`)
}

