import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getControls, getCategories } from "@/lib/actions/controls"
import { UserControlStatus } from "@prisma/client"
import { Filter } from "lucide-react"

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

export default async function ControlsPage({
  searchParams,
}: {
  searchParams: { category?: string }
}) {
  const category = searchParams.category
  const controls = await getControls(MOCK_USER_ID, MOCK_ORG_ID, category)
  const categories = await getCategories()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Controls</h1>
          <p className="text-muted-foreground mt-2">
            Verwaltung der IT-Grundschutz-Maßnahmen
          </p>
        </div>
      </div>

      {/* Filter */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <CardTitle className="text-lg">Filter</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Link href="/app/controls">
              <Button
                variant={!category ? "default" : "outline"}
                size="sm"
              >
                Alle
              </Button>
            </Link>
            {categories.map((cat) => (
              <Link key={cat} href={`/app/controls?category=${encodeURIComponent(cat)}`}>
                <Button
                  variant={category === cat ? "default" : "outline"}
                  size="sm"
                >
                  {cat}
                </Button>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Controls List */}
      <div className="grid gap-4">
        {controls.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Keine Controls gefunden.
            </CardContent>
          </Card>
        ) : (
          controls.map((control) => (
            <Card key={control.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-lg">{control.title}</CardTitle>
                      <Badge variant="outline">{control.key}</Badge>
                    </div>
                    <CardDescription className="mt-1">
                      {control.summary || "Keine Beschreibung verfügbar"}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={statusVariants[control.userStatus]}>
                      {statusLabels[control.userStatus]}
                    </Badge>
                    {(control.key === "1.1" || control.key === "1.2" || control.key === "1.3") && (
                      <Link href={`/app/wizard/${control.id}`}>
                        <Button variant="default" size="sm">
                          Wizard starten
                        </Button>
                      </Link>
                    )}
                    <Link href={`/app/controls/${control.id}`}>
                      <Button variant="outline" size="sm">
                        Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-muted-foreground">Kategorie:</span>
                  <Badge variant="outline">{control.category}</Badge>
                  {control.level && (
                    <>
                      <span className="text-sm text-muted-foreground">Level:</span>
                      <Badge variant="outline">{control.level}</Badge>
                    </>
                  )}
                  {control.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 ml-2">
                      {control.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
