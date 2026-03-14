"use client"

import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/stores/authStore"
import { useNotificationStore } from "@/stores/notificationStore"
import { useUIStore } from "@/stores/uiStore"
import { Bell, Menu, Moon, Sun, LogOut, MessageSquare, UserPlus, ArrowRightLeft, AtSign, CheckCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Card, CardContent } from "@/components/ui/card"
import { listSprints } from "@/services/sprintService"
import { useEffect, useState } from "react"
import type { Sprint } from "@/mock/types"
import { cn } from "@/lib/utils"
import { SPRINT_COLOR_CLASS } from "@/lib/sprintColors"
import { normalizeAvatarUrl } from "@/lib/avatars"

export function Topbar() {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const session = useAuthStore((s) => s.session)
  const logout = useAuthStore((s) => s.logout)
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)
  const [activeSprint, setActiveSprint] = useState<Sprint | null>(null)
  const [notifOpen, setNotifOpen] = useState(false)

  const unreadCount = useNotificationStore((s) => s.unreadCount)
  const preview = useNotificationStore((s) => s.preview)
  const loadPreview = useNotificationStore((s) => s.loadPreview)
  const refreshUnreadCount = useNotificationStore((s) => s.refreshUnreadCount)
  const markAllRead = useNotificationStore((s) => s.markAllRead)
  const markRead = useNotificationStore((s) => s.markRead)
  const refreshSectionCounts = useNotificationStore((s) => s.refreshSectionCounts)
  const enableSound = useNotificationStore((s) => s.enableSound)
  const startRealtime = useNotificationStore((s) => s.startRealtime)

  const role = session?.user?.role
  const canShowSprints = role !== "superadmin" && !!session?.project?.id

  const notifRoute = role === "owner" ? "/app/notifications" : role === "employee" ? "/work/notifications" : "/admin"

  useEffect(() => {
    if (!session?.user?.id) return
    if (session.access_token) startRealtime(session.access_token)
    refreshUnreadCount()
    refreshSectionCounts()
    const id = window.setInterval(() => {
      refreshUnreadCount()
      refreshSectionCounts()
      if (notifOpen) loadPreview()
    }, 15000)
    return () => window.clearInterval(id)
  }, [session?.user?.id, session?.access_token, startRealtime, refreshUnreadCount, refreshSectionCounts, notifOpen, loadPreview])

  function getNotifAccent(type: string) {
    if (type === "task_assigned") return { icon: "bg-sky-500 text-white", iconSubtle: "bg-sky-500/15 text-sky-700 dark:text-sky-200", border: "border-sky-500/30", borderSubtle: "border-sky-500/20", bg: "bg-sky-500/10", bgSubtle: "bg-sky-500/5" }
    if (type === "status_change") return { icon: "bg-amber-500 text-white", iconSubtle: "bg-amber-500/15 text-amber-700 dark:text-amber-200", border: "border-amber-500/30", borderSubtle: "border-amber-500/20", bg: "bg-amber-500/10", bgSubtle: "bg-amber-500/5" }
    if (type === "comment") return { icon: "bg-violet-500 text-white", iconSubtle: "bg-violet-500/15 text-violet-700 dark:text-violet-200", border: "border-violet-500/30", borderSubtle: "border-violet-500/20", bg: "bg-violet-500/10", bgSubtle: "bg-violet-500/5" }
    if (type === "task_updated") return { icon: "bg-indigo-500 text-white", iconSubtle: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-200", border: "border-indigo-500/30", borderSubtle: "border-indigo-500/20", bg: "bg-indigo-500/10", bgSubtle: "bg-indigo-500/5" }
    if (type === "invite_accepted" || type === "invite") return { icon: "bg-emerald-500 text-white", iconSubtle: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-200", border: "border-emerald-500/30", borderSubtle: "border-emerald-500/20", bg: "bg-emerald-500/10", bgSubtle: "bg-emerald-500/5" }
    if (type === "mention") return { icon: "bg-fuchsia-500 text-white", iconSubtle: "bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-200", border: "border-fuchsia-500/30", borderSubtle: "border-fuchsia-500/20", bg: "bg-fuchsia-500/10", bgSubtle: "bg-fuchsia-500/5" }
    if (type === "member_deactivated") return { icon: "bg-rose-500 text-white", iconSubtle: "bg-rose-500/15 text-rose-700 dark:text-rose-200", border: "border-rose-500/30", borderSubtle: "border-rose-500/20", bg: "bg-rose-500/10", bgSubtle: "bg-rose-500/5" }
    if (type === "member_reactivated") return { icon: "bg-emerald-500 text-white", iconSubtle: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-200", border: "border-emerald-500/30", borderSubtle: "border-emerald-500/20", bg: "bg-emerald-500/10", bgSubtle: "bg-emerald-500/5" }
    return { icon: "bg-primary text-primary-foreground", iconSubtle: "bg-primary/15 text-primary", border: "border-primary/30", borderSubtle: "border-primary/20", bg: "bg-primary/10", bgSubtle: "bg-primary/5" }
  }

  useEffect(() => {
    if (!canShowSprints) return
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
  }, [canShowSprints, session?.project?.id])

  function handleLogout() {
    logout()
    router.push("/auth/login")
  }

  const effectiveActiveSprint = activeSprint
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
        {canShowSprints ? (
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

        <DropdownMenu
          open={notifOpen}
          onOpenChange={(open) => {
            setNotifOpen(open)
            if (open) {
              enableSound()
              loadPreview()
            }
          }}
        >
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <Badge className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px]">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-96">
            <div className="flex items-center justify-between px-2 py-1.5">
              <p className="text-sm font-semibold">Notificaciones</p>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-xs"
                  onClick={() => markAllRead()}
                >
                  <CheckCheck className="mr-1 h-4 w-4" /> Marcar todas
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2 text-xs"
                  onClick={() => {
                    setNotifOpen(false)
                    router.push(notifRoute)
                  }}
                >
                  Ver todas
                </Button>
              </div>
            </div>
            <DropdownMenuSeparator />
            <div className="max-h-[380px] overflow-y-auto p-2">
              {preview.length === 0 ? (
                <Card>
                  <CardContent className="py-10 text-center text-sm text-muted-foreground">
                    No tienes notificaciones.
                  </CardContent>
                </Card>
              ) : (
                <div className="flex flex-col gap-2">
                  {preview.map((n) => {
                    const Icon =
                      n.type === "comment"
                        ? MessageSquare
                        : n.type === "task_assigned"
                          ? Bell
                          : n.type === "status_change"
                            ? ArrowRightLeft
                            : n.type === "invite_accepted" || n.type === "invite"
                              ? UserPlus
                              : n.type === "mention"
                                ? AtSign
                                : Bell
                    const accent = getNotifAccent(String(n.type))
                    return (
                      <div
                        key={n.id}
                        className={cn(
                          "w-full rounded-lg border p-3 text-left transition-colors",
                          n.read ? `${accent.borderSubtle} ${accent.bgSubtle} hover:bg-muted/30` : `${accent.border} ${accent.bg}`
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn("mt-0.5 flex h-8 w-8 items-center justify-center rounded-full", n.read ? accent.iconSubtle : accent.icon)}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium">{n.title}</p>
                            <p className="text-sm text-muted-foreground line-clamp-2">{n.message}</p>
                            <p className="mt-1 text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString("es-ES")}</p>
                          </div>
                          <div className="flex shrink-0 flex-col items-end gap-2">
                            {!n.read ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs"
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  markRead(n.id)
                                }}
                              >
                                Leida
                              </Button>
                            ) : null}
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2 text-xs"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                setNotifOpen(false)
                                router.push(n.link || notifRoute)
                              }}
                            >
                              Ver
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

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
