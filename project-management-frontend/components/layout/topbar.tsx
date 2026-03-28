"use client"

import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/stores/authStore"
import { useDataStore } from "@/stores/dataStore"
import { useUIStore } from "@/stores/uiStore"
import { Bell, Menu, Moon, Sun, LogOut } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { listSprints } from "@/services/sprintService"
import { useEffect, useState } from "react"
import type { Sprint } from "@/mock/types"
import { fetchNotifications } from "@/services/notificationService"
import { cn } from "@/lib/utils"
import { SPRINT_COLOR_CLASS } from "@/lib/sprintColors"
import { normalizeAvatarUrl } from "@/lib/avatars"

export function Topbar() {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const session = useAuthStore((s) => s.session)
  const logout = useAuthStore((s) => s.logout)
  const notifications = useDataStore((s) => s.notifications)
  const setNotifications = useDataStore((s) => s.setNotifications)
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)
  const [activeSprint, setActiveSprint] = useState<Sprint | null>(null)

  const unreadCount = notifications.filter((n) => n.user_id === session?.user?.id && !n.read).length
  const role = session?.user?.role
  const sprintEnabled = !!session?.project?.sprint_enabled

  const notifRoute = role === "owner" ? "/app/notifications" : role === "employee" ? "/work/notifications" : "/admin"

  useEffect(() => {
    async function initNotifs() {
      if (session?.user?.id) {
        const notifs = await fetchNotifications()
        if (notifs) {
          setNotifications(notifs)
        }
      }
    }
    initNotifs()
  }, [session?.user?.id, setNotifications])

  useEffect(() => {
    if (!sprintEnabled) return
    let cancelled = false
    async function load() {
      const result = await listSprints("active")
      if (cancelled) return
      if (result.success && result.sprints && result.sprints.length > 0) {
        setActiveSprint(result.sprints[0])
      } else {
        setActiveSprint(null)
      }
    }
    function onSprintChanged(e: Event) {
      const ce = e as CustomEvent<{ activeSprint?: Sprint | null }>
      if (ce.detail && "activeSprint" in ce.detail) {
        setActiveSprint(ce.detail.activeSprint ?? null)
        return
      }
      load()
    }

    const interval = window.setInterval(load, 15000)
    window.addEventListener("sprint:changed", onSprintChanged as any)
    load()
    return () => {
      cancelled = true
      window.clearInterval(interval)
      window.removeEventListener("sprint:changed", onSprintChanged as any)
    }
  }, [sprintEnabled, session?.project?.id])

  function handleLogout() {
    logout()
    router.push("/auth/login")
  }

  const effectiveActiveSprint = sprintEnabled ? activeSprint : null
  const sprintLabel = effectiveActiveSprint ? `${effectiveActiveSprint.name}` : "Sin sprint activo"
  const sprintColor = effectiveActiveSprint?.color ? SPRINT_COLOR_CLASS[effectiveActiveSprint.color] : null
  const sprintMeta = (() => {
    if (!effectiveActiveSprint) return null
    const start = new Date(effectiveActiveSprint.start_date)
    const end = new Date(effectiveActiveSprint.end_date)
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null
    const fmt = (d: Date) => d.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" })
    const days = Math.max(1, Math.round((new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime() - new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime()) / 86400000))
    return { text: `${fmt(start)}→${fmt(end)} · ${days}d`, title: `${start.toLocaleDateString("es-ES")} → ${end.toLocaleDateString("es-ES")} · ${days} días` }
  })()

  return (
    <header className="z-30 flex h-14 shrink-0 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Button variant="ghost" size="icon" className="shrink-0 lg:hidden" onClick={toggleSidebar}>
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle menu</span>
      </Button>

      <div className="flex flex-1 items-center gap-3">
        {sprintEnabled ? (
          <span
            className={cn(
              "hidden md:inline-flex items-center gap-2 rounded-md border px-2 py-1 text-[11px] font-semibold shadow-sm max-w-[320px] truncate",
              sprintColor?.pill ?? "border-border bg-muted/40 text-foreground"
            )}
            title={sprintMeta ? `${sprintLabel} · ${sprintMeta.title}` : sprintLabel}
          >
            <span className={cn("h-2 w-2 rounded-full", sprintColor?.dot ?? "bg-muted-foreground")} />
            <span className="truncate">{sprintLabel}</span>
            {sprintMeta ? <span className="hidden lg:inline text-[10px] font-medium opacity-80">{sprintMeta.text}</span> : null}
          </span>
        ) : null}
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          title="Cambiar tema"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Cambiar tema</span>
        </Button>

        <Button variant="ghost" size="icon" className="relative" onClick={() => router.push(notifRoute)}>
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full p-0 text-[10px]">
              {unreadCount}
            </Badge>
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              {session?.user ? (
                <img
                  src={normalizeAvatarUrl(session.user.avatar)}
                  alt=""
                  className="h-7 w-7 rounded-full border border-border bg-card"
                />
              ) : (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {session?.user?.name?.charAt(0) || "U"}
                </div>
              )}
              <span className="hidden text-sm sm:inline">{session?.user?.name || "Usuario"}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{session?.user?.name}</p>
              <p className="text-xs text-muted-foreground">{session?.user?.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push(role === "owner" ? "/app/profile" : role === "employee" ? "/work/profile" : "/admin/settings")}>
              Perfil
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" /> Cerrar sesion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
