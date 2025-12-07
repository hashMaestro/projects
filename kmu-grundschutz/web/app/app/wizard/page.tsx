import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wand2, ArrowRight } from "lucide-react"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"

async function getPlaybooks() {
  const playbooks = await prisma.playbook.findMany({
    include: {
      control: true,
    },
    orderBy: {
      control: {
        key: "asc",
      },
    },
  })

  return playbooks
}

export default async function WizardPage() {
  const playbooks = await getPlaybooks()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Wizard</h1>
        <p className="text-muted-foreground mt-2">
          Schritt-für-Schritt-Anleitung zur Grundschutz-Implementierung
        </p>
      </div>

      {playbooks.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {playbooks.map((playbook) => (
            <Card key={playbook.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{playbook.control.title}</CardTitle>
                  <Badge variant="outline">{playbook.control.key}</Badge>
                </div>
                <CardDescription>{playbook.control.category}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {playbook.control.summary || "Keine Beschreibung verfügbar"}
                </p>
                <Link href={`/app/wizard/${playbook.controlId}`}>
                  <Button className="w-full">
                    Wizard starten
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Keine Playbooks verfügbar. Bitte führen Sie den Seeder aus.
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Implementierungsphasen</CardTitle>
          <CardDescription>Übersicht der typischen Schritte</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>Strukturanalyse</li>
            <li>Modellierung</li>
            <li>Bausteinauswahl</li>
            <li>Risikoanalyse</li>
            <li>Maßnahmenumsetzung</li>
            <li>Zertifizierung</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
