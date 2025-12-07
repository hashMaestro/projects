import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, Shield, ArrowLeft, CheckCircle2, Circle } from "lucide-react"
import Link from "next/link"
import { getThreat, calculateProtectionStatus } from "@/lib/actions/threats"
import { notFound } from "next/navigation"
import { UserControlStatus } from "@prisma/client"

// Mock user/org for debugging (replace with real auth later)
const MOCK_USER_ID = "debug-user-id"
const MOCK_ORG_ID = null

const statusLabels: Record<UserControlStatus, string> = {
  TODO: "Offen",
  IN_PROGRESS: "In Bearbeitung",
  DONE: "Abgeschlossen",
}

const statusVariants: Record<UserControlStatus, "default" | "secondary" | "outline"> = {
  TODO: "outline",
  IN_PROGRESS: "secondary",
  DONE: "default",
}

export default async function ThreatDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const threat = await getThreat(params.id)

  if (!threat) {
    notFound()
  }

  const protectionStatus = await calculateProtectionStatus(
    params.id,
    MOCK_USER_ID,
    MOCK_ORG_ID
  )

  const getSeverityBadge = (cvss?: number | null) => {
    if (!cvss) return <Badge variant="outline">Unbekannt</Badge>
    if (cvss >= 9.0) return <Badge variant="destructive">Kritisch ({cvss.toFixed(1)})</Badge>
    if (cvss >= 7.0) return <Badge variant="destructive">Hoch ({cvss.toFixed(1)})</Badge>
    if (cvss >= 4.0) return <Badge variant="secondary">Mittel ({cvss.toFixed(1)})</Badge>
    return <Badge variant="outline">Niedrig ({cvss.toFixed(1)})</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/app/threats">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{threat.title}</h1>
          <p className="text-muted-foreground mt-2">
            {threat.source} • {new Date(threat.publishedAt).toLocaleDateString("de-DE")}
          </p>
        </div>
        {getSeverityBadge(threat.cvss)}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Threat Details */}
        <Card>
          <CardHeader>
            <CardTitle>Bedrohungsdetails</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {threat.summary && (
              <div>
                <p className="text-sm font-medium mb-2">Zusammenfassung</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {threat.summary}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium mb-2">Tags</p>
              <div className="flex flex-wrap gap-2">
                {threat.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            {threat.cvss && (
              <div>
                <p className="text-sm font-medium mb-2">CVSS Score</p>
                <p className="text-sm text-muted-foreground">{threat.cvss.toFixed(1)}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Protection Status */}
        <Card>
          <CardHeader>
            <CardTitle>Ihr Schutzstatus</CardTitle>
            <CardDescription>
              Gewichtete Bewertung basierend auf implementierten Controls
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Schutzlevel</span>
                <span className="font-bold">{protectionStatus.score}%</span>
              </div>
              <Progress value={protectionStatus.score} />
            </div>
            <div className="text-sm text-muted-foreground">
              {protectionStatus.achieved} von {protectionStatus.total} gewichteten Punkten
              erreicht
            </div>
            <div className="rounded-md bg-muted/50 p-3 border border-muted">
              <div className="flex gap-2">
                <AlertTriangle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground">
                  <strong>Hinweis:</strong> Der Schutzstatus ist ein Schätzwert und nur dann
                  akkurat, wenn die betroffenen Controls und individuellen Handlungsempfehlungen
                  für diese Bedrohung gewissenhaft umgesetzt wurden.
                </p>
              </div>
            </div>
            {protectionStatus.controls.length > 0 && (
              <div className="space-y-2 pt-4 border-t">
                <p className="text-sm font-medium">Betroffene Controls</p>
                <div className="space-y-2">
                  {protectionStatus.controls.map((item) => (
                    <div
                      key={item.control.id}
                      className="flex items-center justify-between p-2 rounded border"
                    >
                      <div className="flex items-center gap-2">
                        {item.status === "DONE" ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <Circle className="h-4 w-4 text-muted-foreground" />
                        )}
                        <div>
                          <p className="text-sm font-medium">{item.control.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.control.key} • Gewicht: {item.weight}
                          </p>
                        </div>
                      </div>
                      <Badge variant={statusVariants[item.status]}>
                        {statusLabels[item.status]}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

