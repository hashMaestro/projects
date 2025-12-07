import { NextRequest, NextResponse } from "next/server"
import { leakCheckQueue } from "@/lib/queue"
import { getOrCreateDebugOrg } from "@/lib/utils/user"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    let { orgId, domainId } = body

    if (!orgId) {
      return NextResponse.json({ error: "orgId required" }, { status: 400 })
    }

    // Convert debug org ID to real org ID
    if (orgId === "debug-org-id") {
      const org = await getOrCreateDebugOrg()
      orgId = org.id
    }

    // Add job to queue
    const job = await leakCheckQueue.add("leak-check", {
      orgId,
      domainId,
    })

    return NextResponse.json({
      success: true,
      jobId: job.id,
      message: "Leak check job queued",
    })
  } catch (error) {
    console.error("Error queueing leak check:", error)
    return NextResponse.json(
      { error: "Failed to queue leak check" },
      { status: 500 }
    )
  }
}

