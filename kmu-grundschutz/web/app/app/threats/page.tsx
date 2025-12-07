import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Shield, Info, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { getThreats } from "@/lib/actions/threats"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ThreatIngestButton } from "@/components/threat-ingest-button"

// Mock user/org for debugging (replace with real auth later)
const MOCK_USER_ID = "debug-user-id"
const MOCK_ORG_ID = null

export default async function ThreatsPage() {
  const threats = await getThreats(MOCK_USER_ID, MOCK_ORG_ID)

  const getSeverityBadge = (cvss?: number | null) => {
    if (!cvss) return <Badge variant="outline">Unbekannt</Badge>
    if (cvss >= 9.0) return <Badge variant="destructive">Kritisch ({cvss.toFixed(1)})</Badge>
    if (cvss >= 7.0) return <Badge variant="destructive">Hoch ({cvss.toFixed(1)})</Badge>
    if (cvss >= 4.0) return <Badge variant="secondary">Mittel ({cvss.toFixed(1)})</Badge>
    return <Badge variant="outline">Niedrig ({cvss.toFixed(1)})</Badge>
  }

  const getSeverityIcon = (cvss?: number | null) => {
    if (!cvss) return <Info className="h-5 w-5 text-muted-foreground" />
    if (cvss >= 7.0) return <AlertTriangle className="h-5 w-5 text-destructive" />
    return <Shield className="h-5 w-5 text-yellow-500" />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Threats</h1>
          <p className="text-muted-foreground mt-2">
            Übersicht über identifizierte Bedrohungen und Risiken
          </p>
        </div>
        <ThreatIngestButton />
      </div>

      {threats.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Keine Threats gefunden. Starten Sie den Worker, um Threats zu importieren.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {threats.map((threat) => (
            <Card key={threat.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {getSeverityIcon(threat.cvss)}
                    <div className="flex-1">
                      <CardTitle className="text-lg">{threat.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {threat.source} • {new Date(threat.publishedAt).toLocaleDateString("de-DE")}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    {getSeverityBadge(threat.cvss)}
                    {/* Protection Status */}
                    {threat.controlMappings.length > 0 && (
                      <div className="flex items-center gap-2">
                        {threat.protectionScore >= 80 ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : threat.protectionScore >= 50 ? (
                          <Shield className="h-4 w-4 text-yellow-500" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-destructive" />
                        )}
                        <span className="text-sm font-medium">{threat.protectionScore}%</span>
                        <span className="text-xs text-muted-foreground">geschützt</span>
                      </div>
                    )}
                    <Link href={`/app/threats/${threat.id}`}>
                      <Button variant="outline" size="sm">
                        Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {threat.summary && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {threat.summary}
                    </p>
                  )}
                  {/* Protection Status Bar */}
                  {threat.controlMappings.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Ihr Schutzstatus:</span>
                        <span className="font-medium">
                          {threat.protectionScore}% geschützt
                        </span>
                      </div>
                      <Progress value={threat.protectionScore} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        {threat.controlMappings.length} betroffene Control
                        {threat.controlMappings.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm text-muted-foreground">Tags:</span>
                    {threat.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
