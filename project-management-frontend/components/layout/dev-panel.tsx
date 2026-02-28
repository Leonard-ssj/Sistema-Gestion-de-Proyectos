"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuthStore } from "@/stores/authStore"
import { useDataStore } from "@/stores/dataStore"
import { useUIStore } from "@/stores/uiStore"
import { USERS, PROJECTS, MEMBERSHIPS } from "@/mock/seed"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { X, RefreshCw, User, Shield, Briefcase } from "lucide-react"
import { getHomeRoute } from "@/lib/guards"

export function DevPanel() {
  const router = useRouter()
  const devPanelOpen = useUIStore((s) => s.devPanelOpen)
  const setDevPanelOpen = useUIStore((s) => s.setDevPanelOpen)
  const login = useAuthStore((s) => s.login)
  const resetSeed = useDataStore((s) => s.resetSeed)

  if (!devPanelOpen) return null

  function switchTo(email: string) {
    const user = USERS.find((u) => u.email === email)
    if (!user) return
    const project = PROJECTS.find((p) => p.owner_id === user.id) || PROJECTS.find((p) => MEMBERSHIPS.some((m) => m.user_id === user.id && m.project_id === p.id))
    const membership = MEMBERSHIPS.find((m) => m.user_id === user.id)
    const session = {
      user,
      access_token: `mock-access-${Date.now()}`,
      refresh_token: `mock-refresh-${Date.now()}`,
      project: project || undefined,
      membership: membership || undefined,
    }
    login(session)
    toast.success(`Cambiado a: ${user.name} (${user.role})`)
    const route = getHomeRoute(user.role, !!project, !!membership)
    router.push(route)
  }

  function handleReset() {
    resetSeed()
    toast.success("Datos reiniciados al seed original")
  }

  return (
    <div className="fixed bottom-4 right-4 z-[100] w-80">
      <Card className="shadow-xl border-2 border-primary/20">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm">Dev Panel</CardTitle>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setDevPanelOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <p className="text-xs text-muted-foreground mb-1">Cambiar usuario:</p>
          <Button variant="outline" size="sm" className="justify-start gap-2" onClick={() => switchTo("owner@demo.com")}>
            <Briefcase className="h-3.5 w-3.5" /> Owner (Maria Garcia)
          </Button>
          <Button variant="outline" size="sm" className="justify-start gap-2" onClick={() => switchTo("employee@demo.com")}>
            <User className="h-3.5 w-3.5" /> Employee (Juan Lopez)
          </Button>
          <Button variant="outline" size="sm" className="justify-start gap-2" onClick={() => switchTo("admin@demo.com")}>
            <Shield className="h-3.5 w-3.5" /> SuperAdmin (Carlos Admin)
          </Button>
          <div className="my-1 h-px bg-border" />
          <Button variant="outline" size="sm" className="justify-start gap-2" onClick={handleReset}>
            <RefreshCw className="h-3.5 w-3.5" /> Reiniciar datos mock
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
