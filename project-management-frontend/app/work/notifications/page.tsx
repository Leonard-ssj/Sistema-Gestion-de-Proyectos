"use client"

import { useAuthStore } from "@/stores/authStore"
import { useDataStore } from "@/stores/dataStore"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bell, CheckCheck, MessageSquare, UserPlus, ArrowRightLeft, AtSign } from "lucide-react"
import Link from "next/link"

const iconMap = {
  task_assigned: Bell,
  comment: MessageSquare,
  invite: UserPlus,
  status_change: ArrowRightLeft,
  mention: AtSign,
}

export default function WorkNotificationsPage() {
  const session = useAuthStore((s) => s.session)
  const notifications = useDataStore((s) => s.notifications)
  const markNotificationRead = useDataStore((s) => s.markNotificationRead)
  const markAllNotificationsRead = useDataStore((s) => s.markAllNotificationsRead)

  const userId = session?.user?.id
  const userNotifs = notifications.filter((n) => n.user_id === userId).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  const unreadCount = userNotifs.filter((n) => !n.read).length

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notificaciones</h1>
          <p className="text-muted-foreground">{unreadCount} sin leer</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" className="gap-2" onClick={() => userId && markAllNotificationsRead(userId)}>
            <CheckCheck className="h-4 w-4" /> Marcar todas como leidas
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {userNotifs.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">No tienes notificaciones.</CardContent></Card>
        ) : (
          userNotifs.map((n) => {
            const Icon = iconMap[n.type] || Bell
            return (
              <Card key={n.id} className={`transition-colors ${!n.read ? "border-primary/30 bg-primary/5" : ""}`}>
                <CardContent className="flex items-start gap-3 p-4">
                  <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${!n.read ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{n.title}</p>
                    <p className="text-sm text-muted-foreground">{n.message}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString("es-ES")}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {!n.read && (
                      <Button variant="ghost" size="sm" onClick={() => markNotificationRead(n.id)} className="text-xs">Leida</Button>
                    )}
                    {n.link && (
                      <Link href={n.link}><Button variant="outline" size="sm" className="text-xs">Ver</Button></Link>
                    )}
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
