"use client"

import { useAuthStore } from "@/stores/authStore"
import { useDataStore } from "@/stores/dataStore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TASK_STATUS_LABELS, TASK_STATUS_COLORS, TASK_PRIORITY_LABELS, TASK_PRIORITY_COLORS } from "@/lib/constants"
import type { TaskStatus, TaskPriority } from "@/mock/types"

export default function ReportsPage() {
  const session = useAuthStore((s) => s.session)
  const tasks = useDataStore((s) => s.tasks)
  const users = useDataStore((s) => s.users)
  const memberships = useDataStore((s) => s.memberships)

  const projectId = session?.project?.id
  const projectTasks = tasks.filter((t) => t.project_id === projectId)
  const total = projectTasks.length

  const statusBreakdown: { status: TaskStatus; count: number }[] = (["pending", "in_progress", "blocked", "done"] as TaskStatus[]).map((status) => ({
    status,
    count: projectTasks.filter((t) => t.status === status).length,
  }))

  const priorityBreakdown: { priority: TaskPriority; count: number }[] = (["low", "medium", "high", "urgent"] as TaskPriority[]).map((priority) => ({
    priority,
    count: projectTasks.filter((t) => t.priority === priority).length,
  }))

  const teamMembers = memberships
    .filter((m) => m.project_id === projectId && m.status === "active")
    .map((m) => {
      const user = users.find((u) => u.id === m.user_id)
      const userTasks = projectTasks.filter((t) => t.assigned_to === m.user_id)
      const doneTasks = userTasks.filter((t) => t.status === "done").length
      return { user, total: userTasks.length, done: doneTasks }
    })
    .filter((m) => m.user)

  const unassigned = projectTasks.filter((t) => !t.assigned_to).length

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reportes</h1>
        <p className="text-muted-foreground">Resumen analitico del proyecto</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Por Estado</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-3">
            {statusBreakdown.map((s) => (
              <div key={s.status} className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className={TASK_STATUS_COLORS[s.status]}>{TASK_STATUS_LABELS[s.status]}</Badge>
                  <span className="text-sm font-medium">{s.count} ({total > 0 ? Math.round((s.count / total) * 100) : 0}%)</span>
                </div>
                <Progress value={total > 0 ? (s.count / total) * 100 : 0} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Por Prioridad</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-3">
            {priorityBreakdown.map((p) => (
              <div key={p.priority} className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className={TASK_PRIORITY_COLORS[p.priority]}>{TASK_PRIORITY_LABELS[p.priority]}</Badge>
                  <span className="text-sm font-medium">{p.count}</span>
                </div>
                <Progress value={total > 0 ? (p.count / total) * 100 : 0} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Rendimiento por Miembro</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {teamMembers.map((m) => (
              <div key={m.user?.id} className="flex items-center gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shrink-0">
                  {m.user?.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{m.user?.name}</span>
                    <span className="text-xs text-muted-foreground">{m.done}/{m.total} completadas</span>
                  </div>
                  <Progress value={m.total > 0 ? (m.done / m.total) * 100 : 0} className="mt-1 h-2" />
                </div>
              </div>
            ))}
            {unassigned > 0 && (
              <p className="text-xs text-muted-foreground">{unassigned} tarea(s) sin asignar</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
