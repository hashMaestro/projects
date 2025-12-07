import { Queue, Worker } from "bullmq"
import { config } from "./config.js"
import IORedis from "ioredis"

const connection = new IORedis(config.redisUrl, {
  maxRetriesPerRequest: null,
})

export const threatIngestQueue = new Queue("threat-ingest", {
  connection,
})

export const threatProcessQueue = new Queue("threat-process", {
  connection,
})

export const leakCheckQueue = new Queue("leak-check", {
  connection,
})

export function createWorker(queueName: string, processor: (job: any) => Promise<void>) {
  return new Worker(queueName, processor, {
    connection,
    concurrency: 5,
  })
}

