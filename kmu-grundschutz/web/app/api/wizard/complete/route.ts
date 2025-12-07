import { NextRequest, NextResponse } from "next/server"
import { completeWizardSession, getWizardSession } from "@/lib/actions/wizard-session"
import { generateCompletionSummary } from "@/lib/services/wizard-llm"
import { getOrCreateDebugUser } from "@/lib/utils/user"
import { loadPlaybookFromFile } from "@/lib/actions/wizard-session"

export async function POST(request: NextRequest) {
  try {
    const { sessionId, controlId } = await request.json()

    // Get user (for debug mode)
    let userId = request.headers.get("x-user-id") || "debug-user-id"
    if (userId === "debug-user-id") {
      const debugUser = await getOrCreateDebugUser()
      userId = debugUser.id
    }

    const orgId = request.headers.get("x-org-id") || null

    if (!controlId) {
      return NextResponse.json({ error: "Control ID required" }, { status: 400 })
    }

    // Get control to load playbook
    const { prisma } = await import("@/lib/prisma")
    const control = await prisma.control.findUnique({
      where: { id: controlId },
    })

    if (!control) {
      return NextResponse.json({ error: "Control not found" }, { status: 404 })
    }

    // Load playbook
    const { loadPlaybookFromFile } = await import("@/lib/actions/wizard-session")
    const playbook = await loadPlaybookFromFile(control.key)
    if (!playbook) {
      return NextResponse.json({ error: "Playbook not found" }, { status: 404 })
    }

    // Zero history mode: Generate summary without conversation history
    // The LLM will create a summary based on the playbook validation steps
    const summary = await generateCompletionSummary(playbook, [])

    // Complete session (only updates control status, no session storage)
    const completedSession = await completeWizardSession(
      sessionId,
      userId,
      orgId,
      summary,
      {
        controlId,
        playbookVersion: "1.0",
        controlKey: control.key,
        messageCount: 0, // Zero history mode
        validationSteps: playbook.validation_steps,
        evidenceRequirements: playbook.evidence_requirements,
        completedAt: new Date().toISOString(),
      }
    )

    return NextResponse.json({
      success: true,
      session: completedSession,
      summary,
    })
  } catch (error: any) {
    console.error("Wizard completion error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

