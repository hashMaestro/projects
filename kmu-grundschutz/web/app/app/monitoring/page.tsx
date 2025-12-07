import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Shield, Plus, RefreshCw, Globe } from "lucide-react"
import { getDomains, getExposures, getExposureStats, addDomain } from "@/lib/actions/monitoring"
import { DomainForm } from "@/components/domain-form"
import { LeakCheckButton } from "@/components/leak-check-button"
import { DeleteDomainButton } from "@/components/delete-domain-button"
import Link from "next/link"
import { revalidatePath } from "next/cache"

// Mock org for debugging (replace with real auth later)
const MOCK_ORG_ID = "debug-org-id"

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("de-DE", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

function formatRelativeTime(date: Date) {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor(diff / (1000 * 60))

  if (days > 0) return `vor ${days} Tag${days > 1 ? "en" : ""}`
  if (hours > 0) return `vor ${hours} Stunde${hours > 1 ? "n" : ""}`
  if (minutes > 0) return `vor ${minutes} Minute${minutes > 1 ? "n" : ""}`
  return "gerade eben"
}

export default async function MonitoringPage({
  searchParams,
}: {
  searchParams: { domain?: string }
}) {
  const domains = await getDomains(MOCK_ORG_ID)
  const exposures = await getExposures(MOCK_ORG_ID, searchParams.domain)
  const stats = await getExposureStats(MOCK_ORG_ID)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Leak Monitoring</h1>
          <p className="text-muted-foreground mt-2">
            Überwachung von Datenlecks und Exposures für Ihre Domains
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DomainForm orgId={MOCK_ORG_ID} />
          <LeakCheckButton orgId={MOCK_ORG_ID} />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Gesamt Exposures</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Letzte 7 Tage</CardDescription>
            <CardTitle className="text-3xl">{stats.recent}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Überwachte Domains</CardDescription>
            <CardTitle className="text-3xl">{domains.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Quellen</CardDescription>
            <CardTitle className="text-3xl">{Object.keys(stats.bySource).length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Domains */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Überwachte Domains</CardTitle>
              <DomainForm orgId={MOCK_ORG_ID} />
            </div>
            <CardDescription>Verwaltete Domains für Leak-Checks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {domains.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Noch keine Domains hinzugefügt
              </p>
            ) : (
              domains.map((domain) => (
                <div
                  key={domain.id}
                  className="flex items-center justify-between p-3 border rounded-md"
                >
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{domain.domain}</p>
                      <p className="text-xs text-muted-foreground">
                        {domain.exposureCount} Exposure{domain.exposureCount !== 1 ? "s" : ""}
                        {domain.verified && " • Verifiziert"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {domain.exposureCount > 0 && (
                      <Badge variant="destructive">{domain.exposureCount}</Badge>
                    )}
                    <LeakCheckButton orgId={MOCK_ORG_ID} domainId={domain.id} />
                    <DeleteDomainButton
                      orgId={MOCK_ORG_ID}
                      domainId={domain.id}
                      domainName={domain.domain}
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Exposures */}
        <Card>
          <CardHeader>
            <CardTitle>Exposures</CardTitle>
            <CardDescription>
              Gefundene Datenlecks und Sicherheitsvorfälle
              {searchParams.domain && ` für ${searchParams.domain}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {exposures.length === 0 ? (
              <div className="text-center py-8">
                <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Keine Exposures gefunden</p>
              </div>
            ) : (
              exposures.map((exposure) => (
                <div
                  key={exposure.id}
                  className="flex items-start justify-between p-3 border rounded-md hover:bg-muted/50"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium truncate">{exposure.source}</p>
                        <Badge variant="outline" className="text-xs">
                          {exposure.domain}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Erste Sichtung: {formatDate(exposure.firstSeenAt)} (
                        {formatRelativeTime(exposure.firstSeenAt)})
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

