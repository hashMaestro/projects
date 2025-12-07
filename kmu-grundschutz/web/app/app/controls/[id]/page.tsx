import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Link from "next/link"
import { ArrowLeft, Upload, Save } from "lucide-react"
import { getControl, updateControlStatus } from "@/lib/actions/controls"
import { UserControlStatus } from "@prisma/client"
import { ControlStatusForm } from "@/components/control-status-form"
import { notFound } from "next/navigation"

// Mock user/org for debugging (replace with real auth later)
const MOCK_USER_ID = "debug-user-id"
const MOCK_ORG_ID = null

const statusLabels: Record<UserControlStatus, string> = {
  TODO: "Offen",
  IN_PROGRESS: "In Bearbeitung",
  DONE: "Abgeschlossen",
}

export default async function ControlDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const control = await getControl(params.id, MOCK_USER_ID, MOCK_ORG_ID)

  if (!control) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/app/controls">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{control.title}</h1>
          <p className="text-muted-foreground mt-2">
            Control {control.key} - {control.category}
          </p>
        </div>
      </div>

      {/* Wizard Button for 1.1, 1.2, 1.3 */}
      {(control.key === "1.1" || control.key === "1.2" || control.key === "1.3") && (
        <Card>
          <CardContent className="pt-6">
            <Link href={`/app/wizard/${control.id}`}>
              <Button size="lg" className="w-full">
                🧙 Wizard starten
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground mt-2 text-center">
              LLM-gestützte Schritt-für-Schritt Anleitung zur Implementierung
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Control Details */}
        <Card>
          <CardHeader>
            <CardTitle>Beschreibung</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-1">Zusammenfassung</p>
              <p className="text-sm text-muted-foreground">
                {control.summary || "Keine Beschreibung verfügbar"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <div>
                <span className="text-sm font-medium">Kategorie: </span>
                <Badge variant="outline">{control.category}</Badge>
              </div>
              {control.level && (
                <div>
                  <span className="text-sm font-medium">Level: </span>
                  <Badge variant="outline">{control.level}</Badge>
                </div>
              )}
            </div>
            {control.tags.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Tags</p>
                <div className="flex flex-wrap gap-1">
                  {control.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status & Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Status & Fortschritt</CardTitle>
            <CardDescription>Verwalten Sie Ihren Fortschritt für dieses Control</CardDescription>
          </CardHeader>
          <CardContent>
            <ControlStatusForm
              controlId={control.id}
              currentStatus={control.userStatus}
              currentNotes={control.notes || ""}
              userId={MOCK_USER_ID}
              orgId={MOCK_ORG_ID}
            />
          </CardContent>
        </Card>
      </div>

      {/* Evidence Upload Stub */}
      <Card>
        <CardHeader>
          <CardTitle>Nachweise</CardTitle>
          <CardDescription>Laden Sie Nachweise für dieses Control hoch</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button disabled>
              <Upload className="mr-2 h-4 w-4" />
              Datei hochladen
            </Button>
            <p className="text-sm text-muted-foreground">
              {control.evidenceUrl ? (
                <a href={control.evidenceUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Nachweis anzeigen
                </a>
              ) : (
                "Keine Nachweise hochgeladen"
              )}
            </p>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Hinweis: Der Upload wird in einer späteren Version implementiert.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

