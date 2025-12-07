import { NextRequest, NextResponse } from "next/server"
import { Queue } from "bullmq"
import IORedis from "ioredis"

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379"

let threatIngestQueue: Queue | null = null

// Lazy initialization of Redis connection
async function getQueue(): Promise<Queue | null> {
  if (threatIngestQueue) {
    // Test if connection is still alive
    try {
      await threatIngestQueue.client.ping()
      return threatIngestQueue
    } catch {
      // Connection is dead, reset it
      threatIngestQueue = null
    }
  }

  try {
    const connection = new IORedis(redisUrl, {
      maxRetriesPerRequest: null,
      // Use same config as worker
      lazyConnect: false,
    })

    // Test connection immediately
    await connection.ping()

    threatIngestQueue = new Queue("threat-ingest", {
      connection,
    })

    return threatIngestQueue
  } catch (error: any) {
    console.error("Failed to initialize Redis connection:", error)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const queue = await getQueue()

    if (!queue) {
      return NextResponse.json(
        {
          error: "Redis not available",
          message: "Redis konnte nicht verbunden werden. Bitte starten Sie Redis:\ncd infra/docker && docker compose -f docker-compose.dev.yml up -d redis",
        },
        { status: 503 }
      )
    }

    // Add job to queue
    const job = await queue.add("ingest-threats", {})

    return NextResponse.json({
      success: true,
      jobId: job.id,
      message: "Threat ingest job queued",
    })
  } catch (error: any) {
    console.error("Error queueing threat ingest:", error)
    
    const errorCode = error.code || error.message || ""
    const errorString = String(errorCode).toLowerCase()
    
    if (
      errorString.includes("econnrefused") ||
      errorString.includes("connection refused") ||
      errorString.includes("connect econnrefused")
    ) {
      return NextResponse.json(
        {
          error: "Redis connection refused",
          message: "Redis läuft nicht oder ist nicht erreichbar. Bitte starten Sie Redis:\ncd infra/docker && docker compose -f docker-compose.dev.yml up -d redis\n\nFalls Redis bereits läuft, prüfen Sie die Verbindung mit:\nredis-cli -h localhost -p 6379 ping",
        },
        { status: 503 }
      )
    }

    if (errorString.includes("timeout") || errorString.includes("timed out")) {
      return NextResponse.json(
        {
          error: "Redis connection timeout",
          message: "Verbindung zu Redis hat zu lange gedauert. Bitte prüfen Sie, ob Redis läuft.",
        },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { 
        error: "Failed to queue threat ingest", 
        details: error.message || String(error),
        message: "Unbekannter Fehler beim Verbinden mit Redis. Bitte prüfen Sie die Redis-Verbindung."
      },
      { status: 500 }
    )
  }
}

