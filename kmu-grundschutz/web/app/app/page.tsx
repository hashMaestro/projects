import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, Shield, AlertTriangle, CheckCircle2 } from "lucide-react"

// Server Action für Dashboard-Daten (Platzhalter)
async function getDashboardData() {
  // Platzhalter-Daten - später durch echte Datenbankabfragen ersetzen
  return {
    totalControls: 42,
    activeThreats: 3,
    complianceScore: 87,
    lastScan: new Date().toLocaleDateString("de-DE"),
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Übersicht über Ihren Grundschutz-Status
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Controls</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalControls}</div>
            <p className="text-xs text-muted-foreground">Gesamt implementiert</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktive Bedrohungen</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{data.activeThreats}</div>
            <p className="text-xs text-muted-foreground">Erfordern Aufmerksamkeit</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.complianceScore}%</div>
            <p className="text-xs text-muted-foreground">Basis-IT-Grundschutz</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Letzter Scan</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.lastScan}</div>
            <p className="text-xs text-muted-foreground">Automatische Prüfung</p>
          </CardContent>
        </Card>
      </div>

      {/* Status Overview */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Statusübersicht</CardTitle>
            <CardDescription>Aktueller Stand der Implementierung</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Bausteine umgesetzt</span>
              <Badge variant="default">12/15</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Anforderungen erfüllt</span>
              <Badge variant="secondary">87%</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Offene Maßnahmen</span>
              <Badge variant="outline">8</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Schnellzugriff</CardTitle>
            <CardDescription>Häufig genutzte Funktionen</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Verwenden Sie die Sidebar-Navigation, um zu den verschiedenen Bereichen zu gelangen.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

