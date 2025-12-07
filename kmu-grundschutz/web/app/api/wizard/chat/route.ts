import { NextRequest } from "next/server"
import { getOrCreateWizardSession, addWizardMessage } from "@/lib/actions/wizard-session"
import { processWizardMessage } from "@/lib/services/wizard-llm"
import { getOrCreateDebugUser } from "@/lib/utils/user"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, controlId, message, contextSummary = "" } = body

    // Get user (for debug mode)
    let userId = request.headers.get("x-user-id") || "debug-user-id"
    if (userId === "debug-user-id") {
      const debugUser = await getOrCreateDebugUser()
      userId = debugUser.id
    }

    const orgId = request.headers.get("x-org-id") || null

    // Always create a new session (no persistence for prototype)
    // sessionId is ignored - we always start fresh
    const result = await getOrCreateWizardSession(controlId, userId, orgId)
    const session = result.session

    // Load playbook
    const { loadPlaybookFromFile } = await import("@/lib/actions/wizard-session")
    const playbook = await loadPlaybookFromFile(session.controlKey)

    // Minimal context mode: Send only current message + minimal context summary
    // This saves API costs while providing enough context for the LLM
    const messages: any[] = [] // No full history - only context summary in system prompt

    // Detect provider from current user message
    const sessionProviderContext = {}

    // Check if WIZARD_OPENAI_API_KEY is configured (NO fallback to OPENAI_API_KEY)
    const wizardApiKey = process.env.WIZARD_OPENAI_API_KEY
    if (!wizardApiKey) {
      // Return a helpful error message as a stream
      const errorMessage = `⚠️ **Wizard API-Key nicht konfiguriert**

Um den Wizard zu nutzen, müssen Sie einen separaten OpenAI API-Key für den Wizard konfigurieren:

1. Erstellen Sie eine .env.local Datei im apps/web Verzeichnis
2. Fügen Sie folgende Zeile hinzu:
   WIZARD_OPENAI_API_KEY=sk-your-wizard-api-key-here
3. Starten Sie den Server neu

**WICHTIG:** Der Wizard verwendet einen separaten API-Key (WIZARD_OPENAI_API_KEY), um die Nutzung getrennt vom Worker zu tracken.

**Hinweis:** Sie können einen API-Key unter https://platform.openai.com/api-keys erstellen.`

      const encoder = new TextEncoder()
      const errorStream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(errorMessage))
          controller.close()
        },
      })

      // Save error message as assistant response
      await addWizardMessage(session.id, "ASSISTANT", errorMessage)

      return new Response(errorStream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
          "X-Session-Id": session.id,
        },
      })
    }

    // Process with LLM (streaming) - includes current user message + minimal context
    const stream = await processWizardMessage(playbook, messages, message, sessionProviderContext, contextSummary)

    // No database storage - messages are only in client state

    // Create response stream that also saves the assistant message
    const encoder = new TextEncoder()
    let assistantContent = ""

    const responseStream = new ReadableStream({
      async start(controller) {
        try {
          const reader = stream.getReader()
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            controller.enqueue(value)
            assistantContent += new TextDecoder().decode(value)
          }

          // No database storage - assistant response is only streamed to client

          controller.close()
        } catch (error) {
          console.error("Streaming error:", error)
          controller.error(error)
        }
      },
    })

    return new Response(responseStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Session-Id": session.id,
      },
    })
  } catch (error: any) {
    console.error("Wizard chat error:", error)
    
        // If it's an OpenAI API key error, return helpful message as stream
        if (error.message?.includes("WIZARD_OPENAI_API_KEY") || error.message?.includes("not configured")) {
          const errorMessage = `⚠️ **Wizard API-Key nicht konfiguriert**

Um den Wizard zu nutzen, müssen Sie einen separaten OpenAI API-Key für den Wizard konfigurieren:

1. Erstellen Sie eine .env.local Datei im apps/web Verzeichnis
2. Fügen Sie folgende Zeile hinzu:
   WIZARD_OPENAI_API_KEY=sk-your-wizard-api-key-here
3. Starten Sie den Server neu

**WICHTIG:** Der Wizard verwendet einen separaten API-Key (WIZARD_OPENAI_API_KEY), um die Nutzung getrennt vom Worker zu tracken.

**Hinweis:** Sie können einen API-Key unter https://platform.openai.com/api-keys erstellen.`

      const encoder = new TextEncoder()
      const errorStream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(errorMessage))
          controller.close()
        },
      })

      return new Response(errorStream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      })
    }
    
    // Return proper error response that can be handled by client
    const errorMessage = error.message || "Internal server error"
    const statusCode = error.message?.includes("not found") ? 404 : 500
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined
    }), {
      status: statusCode,
      headers: { "Content-Type": "application/json" },
    })
  }
}

