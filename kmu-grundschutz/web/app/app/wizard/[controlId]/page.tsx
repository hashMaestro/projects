import { getOrCreateWizardSession } from "@/lib/actions/wizard-session"
import { WizardChat } from "@/components/wizard-chat"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getOrCreateDebugUser } from "@/lib/utils/user"

// Mock user/org for debugging (replace with real auth later)
const MOCK_USER_ID = "debug-user-id"
const MOCK_ORG_ID = null

export default async function WizardPage({
  params,
}: {
  params: { controlId: string }
}) {
  // Get or create debug user
  const debugUser = await getOrCreateDebugUser()

  // Get or create wizard session
  let sessionData
  try {
    sessionData = await getOrCreateWizardSession(
      params.controlId,
      debugUser.id,
      MOCK_ORG_ID
    )
  } catch (error: any) {
    console.error("Failed to get wizard session:", error)
    if (error.message?.includes("Playbook not found")) {
      notFound()
    }
    throw error
  }

  const { session, control } = sessionData

  // Format messages for component
  const messages = session.messages.map((msg: any) => ({
    role: msg.role,
    content: msg.content,
    createdAt: msg.createdAt,
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/app/controls">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Wizard: {control.title}</h1>
          <p className="text-muted-foreground mt-2">
            Control {control.key} - LLM-gestützte Schritt-für-Schritt Anleitung
          </p>
        </div>
      </div>

      <WizardChat
        sessionId={session.id}
        controlId={params.controlId}
        controlKey={control.key}
        initialMessages={messages}
        playbookQuestions={sessionData.playbook.questions_to_user || []}
      />
    </div>
  )
}

