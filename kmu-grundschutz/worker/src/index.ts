import { createWorker } from "./queue.js"
import { threatIngestQueue, leakCheckQueue } from "./queue.js"
import { ingestThreatsJob } from "./jobs/ingest-threats.js"
import { processThreatJob } from "./jobs/process-threat.js"
import { leakCheckJob } from "./jobs/leak-check.js"

console.log("🚀 Starting threat worker...")

// Create workers
const ingestWorker = createWorker("threat-ingest", ingestThreatsJob)
const processWorker = createWorker("threat-process", processThreatJob)
const leakCheckWorker = createWorker("leak-check", leakCheckJob)

ingestWorker.on("completed", (job) => {
  console.log(`✅ Job ${job.id} completed`)
})

ingestWorker.on("failed", (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err)
})

processWorker.on("completed", (job) => {
  console.log(`✅ Job ${job.id} completed`)
})

processWorker.on("failed", (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err)
})

leakCheckWorker.on("completed", (job) => {
  console.log(`✅ Leak check job ${job.id} completed`)
})

leakCheckWorker.on("failed", (job, err) => {
  console.error(`❌ Leak check job ${job?.id} failed:`, err)
})

// Schedule recurring job (every hour) - using BullMQ repeat
await threatIngestQueue.add(
  "ingest-threats",
  {},
  {
    repeat: {
      pattern: "0 * * * *", // Every hour at minute 0
    },
  }
)

// Run initial ingest
console.log("📥 Running initial threat ingest...")
await threatIngestQueue.add("ingest-threats", {})

console.log("✅ Worker started successfully")
