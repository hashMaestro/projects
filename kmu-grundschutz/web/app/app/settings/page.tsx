import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Settings as SettingsIcon, User, Bell, Shield } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Einstellungen und Konfiguration
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <CardTitle>Benutzerprofil</CardTitle>
            </div>
            <CardDescription>Persönliche Einstellungen verwalten</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Profil bearbeiten
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <CardTitle>Benachrichtigungen</CardTitle>
            </div>
            <CardDescription>Alert- und E-Mail-Einstellungen</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Benachrichtigungen konfigurieren
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <CardTitle>Sicherheit</CardTitle>
            </div>
            <CardDescription>Passwort und Zwei-Faktor-Authentifizierung</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Sicherheitseinstellungen
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              <CardTitle>Systemeinstellungen</CardTitle>
            </div>
            <CardDescription>Allgemeine Konfiguration</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              System konfigurieren
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

