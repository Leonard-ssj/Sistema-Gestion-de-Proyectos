"use client"

import { useEffect } from "react"
import { useNotificationStore } from "@/stores/notificationStore"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bell, CheckCheck, MessageSquare, UserPlus, ArrowRightLeft, AtSign, Trash2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const iconMap: Record<string, any> = {
  task_assigned: Bell,
  comment: MessageSquare,
  invite: UserPlus,
  invite_accepted: UserPlus,
  status_change: ArrowRightLeft,
  task_updated: Bell,
  member_deactivated: UserPlus,
  member_reactivated: UserPlus,
  mention: AtSign,
}

function getAccent(type: string) {
  if (type === "task_assigned") return { icon: "bg-sky-500 text-white", iconSubtle: "bg-sky-500/15 text-sky-700 dark:text-sky-200", border: "border-sky-500/30", borderSubtle: "border-sky-500/20", bg: "bg-sky-500/10", bgSubtle: "bg-sky-500/5" }
  if (type === "status_change") return { icon: "bg-amber-500 text-white", iconSubtle: "bg-amber-500/15 text-amber-700 dark:text-amber-200", border: "border-amber-500/30", borderSubtle: "border-amber-500/20", bg: "bg-amber-500/10", bgSubtle: "bg-amber-500/5" }
  if (type === "comment") return { icon: "bg-violet-500 text-white", iconSubtle: "bg-violet-500/15 text-violet-700 dark:text-violet-200", border: "border-violet-500/30", borderSubtle: "border-violet-500/20", bg: "bg-violet-500/10", bgSubtle: "bg-violet-500/5" }
  if (type === "invite_accepted" || type === "invite") return { icon: "bg-emerald-500 text-white", iconSubtle: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-200", border: "border-emerald-500/30", borderSubtle: "border-emerald-500/20", bg: "bg-emerald-500/10", bgSubtle: "bg-emerald-500/5" }
  if (type === "mention") return { icon: "bg-fuchsia-500 text-white", iconSubtle: "bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-200", border: "border-fuchsia-500/30", borderSubtle: "border-fuchsia-500/20", bg: "bg-fuchsia-500/10", bgSubtle: "bg-fuchsia-500/5" }
  if (type === "task_updated") return { icon: "bg-indigo-500 text-white", iconSubtle: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-200", border: "border-indigo-500/30", borderSubtle: "border-indigo-500/20", bg: "bg-indigo-500/10", bgSubtle: "bg-indigo-500/5" }
  return { icon: "bg-primary text-primary-foreground", iconSubtle: "bg-primary/15 text-primary", border: "border-primary/30", borderSubtle: "border-primary/20", bg: "bg-primary/10", bgSubtle: "bg-primary/5" }
}

export default function NotificationsPage() {
  const items = useNotificationStore((s) => s.items)
  const unreadCount = useNotificationStore((s) => s.unreadCount)
  const isLoading = useNotificationStore((s) => s.isLoadingList)
  const loadList = useNotificationStore((s) => s.loadList)
  const markRead = useNotificationStore((s) => s.markRead)
  const markAllRead = useNotificationStore((s) => s.markAllRead)
  const remove = useNotificationStore((s) => s.remove)

  useEffect(() => {
    loadList({ unreadOnly: false, limit: 50, offset: 0 })
  }, [loadList])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notificaciones</h1>
          <p className="text-muted-foreground">{unreadCount} sin leer</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" className="gap-2" onClick={() => markAllRead()}>
            <CheckCheck className="h-4 w-4" /> Marcar todas como leidas
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {isLoading ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">Cargando...</CardContent></Card>
        ) : items.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">No tienes notificaciones.</CardContent></Card>
        ) : (
          items.map((n) => {
            const Icon = iconMap[n.type] || Bell
            const accent = getAccent(String(n.type))
            return (
              <Card
                key={n.id}
                className={cn(
                  "transition-colors",
                  n.read ? `${accent.borderSubtle} ${accent.bgSubtle}` : `${accent.border} ${accent.bg}`
                )}
              >
                <CardContent className="flex items-start gap-3 p-4">
                  <div className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full", n.read ? accent.iconSubtle : accent.icon)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{n.title}</p>
                    <p className="text-sm text-muted-foreground">{n.message}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString("es-ES")}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {!n.read && (
                      <Button variant="ghost" size="sm" onClick={() => markRead(n.id)} className="text-xs">
                        Marcar leida
                      </Button>
                    )}
                    {n.link && (
                      <Link href={n.link}>
                        <Button variant="outline" size="sm" className="text-xs">Ver</Button>
                      </Link>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={async () => {
                        const ok = await remove(n.id)
                        if (ok) toast.success("Notificación eliminada")
                        else toast.error("No se pudo eliminar")
                      }}
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
