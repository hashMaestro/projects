// AUTH TEMPORARILY DISABLED FOR DEBUGGING
// import { auth } from "@/lib/auth"
// import { signOut } from "@/lib/auth"
// import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { AppSidebar } from "@/components/app-sidebar"
import { MobileNav } from "@/components/mobile-nav"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // AUTH CHECK DISABLED - Uncomment to re-enable authentication
  // const session = await auth()
  // if (!session) {
  //   redirect("/auth/signin")
  // }
  
  // Mock session for debugging
  const session = { user: { email: "debug@example.com", name: "Debug User" } }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow border-r bg-background">
          <div className="flex items-center flex-shrink-0 px-4 py-6 border-b">
            <h1 className="text-xl font-semibold">KMU Grundschutz</h1>
          </div>
          <div className="flex flex-col flex-grow overflow-y-auto">
            <AppSidebar />
            <Separator />
            <div className="px-4 py-4">
              <div className="mb-2 text-sm text-muted-foreground">
                {session?.user?.email || "Debug Mode"}
              </div>
              {/* AUTH DISABLED - Uncomment to re-enable logout
              <form
                action={async () => {
                  "use server"
                  await signOut({ redirectTo: "/" })
                }}
              >
                <Button
                  type="submit"
                  variant="ghost"
                  className="w-full justify-start"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Abmelden
                </Button>
              </form>
              */}
              <div className="text-xs text-muted-foreground italic">
                Auth deaktiviert (Debug)
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b bg-background">
          <h1 className="text-lg font-semibold">KMU Grundschutz</h1>
          <MobileNav />
        </header>
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="container mx-auto p-6">{children}</div>
        </main>
      </div>
    </div>
  )
}

