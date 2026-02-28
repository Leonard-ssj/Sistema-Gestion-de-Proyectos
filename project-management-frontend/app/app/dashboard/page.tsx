"use client"

import { useAuthStore } from "@/stores/authStore"
import { useDataStore } from "@/stores/dataStore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ListTodo, CheckCircle2, Clock, AlertTriangle, Users, TrendingUp } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const session = useAuthStore((s) => s.session)
  const tasks = useDataStore((s) => s.tasks)
  const memberships = useDataStore((s) => s.memberships)

  const projectId = session?.project?.id
  const projectTasks = tasks.filter((t) => t.project_id === projectId)
  const members = memberships.filter((m) => m.project_id === projectId && m.status === "active")

  const done = projectTasks.filter((t) => t.status === "done").length
  const inProgress = projectTasks.filter((t) => t.status === "in_progress").length
  const pending = projectTasks.filter((t) => t.status === "pending").length
  const blocked = projectTasks.filter((t) => t.status === "blocked").length
  const total = projectTasks.length
  const completionRate = total > 0 ? Math.round((done / total) * 100) : 0

  const urgentTasks = projectTasks.filter((t) => t.priority === "urgent" && t.status !== "done")
  const overdueTasks = projectTasks.filter((t) => {
    if (!t.due_date || t.status === "done") return false
    return new Date(t.due_date) < new Date()
  })

  const stats = [
    { label: "Total Tareas", value: total, icon: ListTodo, color: "text-primary" },
    { label: "Completadas", value: done, icon: CheckCircle2, color: "text-emerald-600" },
    { label: "En Progreso", value: inProgress, icon: Clock, color: "text-amber-600" },
    { label: "Bloqueadas", value: blocked, icon: AlertTriangle, color: "text-red-600" },
    { label: "Miembros", value: members.length, icon: Users, color: "text-primary" },
    { label: "Completado", value: `${completionRate}%`, icon: TrendingUp, color: "text-emerald-600" },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-balance">Dashboard</h1>
        <p className="text-muted-foreground">{session?.project?.name || "Proyecto"}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex flex-col items-center gap-1 p-4">
              <s.icon className={`h-5 w-5 ${s.color}`} />
              <span className="text-2xl font-bold">{s.value}</span>
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Progreso General</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={completionRate} className="h-3" />
          <p className="mt-2 text-xs text-muted-foreground">{done} de {total} tareas completadas</p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" /> Tareas Urgentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {urgentTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay tareas urgentes pendientes.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {urgentTasks.slice(0, 5).map((t) => (
                  <li key={t.id}>
                    <Link href={`/app/tasks/${t.id}`} className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent">
                      <span className="text-sm font-medium">{t.title}</span>
                      <Badge variant="destructive" className="text-[10px]">Urgente</Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" /> Tareas Vencidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {overdueTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay tareas vencidas.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {overdueTasks.slice(0, 5).map((t) => (
                  <li key={t.id}>
                    <Link href={`/app/tasks/${t.id}`} className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent">
                      <span className="text-sm font-medium">{t.title}</span>
                      <Badge variant="outline" className="text-[10px] text-amber-600">Vencida</Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
