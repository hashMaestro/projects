import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Download, Calendar } from "lucide-react"

// Server Action für Reports-Daten (Platzhalter)
async function getReportsData() {
  return {
    reports: [
      {
        id: "R001",
        name: "Compliance-Report Q4 2024",
        date: "15.12.2024",
        type: "Compliance",
      },
      {
        id: "R002",
        name: "Sicherheitsaudit Dezember",
        date: "10.12.2024",
        type: "Audit",
      },
      {
        id: "R003",
        name: "Risikoanalyse Update",
        date: "05.12.2024",
        type: "Risikoanalyse",
      },
    ],
  }
}

export default async function ReportsPage() {
  const { reports } = await getReportsData()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-muted-foreground mt-2">
          Generierte Berichte und Dokumentationen
        </p>
      </div>

      <div className="grid gap-4">
        {reports.map((report) => (
          <Card key={report.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <CardTitle className="text-lg">{report.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Calendar className="h-3 w-3" />
                      {report.date}
                    </CardDescription>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Typ:</span>
                <span className="text-sm font-medium">{report.type}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Neuen Report generieren</CardTitle>
          <CardDescription>Erstellen Sie einen neuen Bericht</CardDescription>
        </CardHeader>
        <CardContent>
          <Button>
            <FileText className="mr-2 h-4 w-4" />
            Report erstellen
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

