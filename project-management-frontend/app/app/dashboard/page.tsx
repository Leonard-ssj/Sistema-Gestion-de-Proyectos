"use client"

import { useEffect, useMemo, useState } from "react"
import { useAuthStore } from "@/stores/authStore"
import { useDataStore } from "@/stores/dataStore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ListTodo, CheckCircle2, Clock, AlertTriangle, Users, TrendingUp } from "lucide-react"
import Link from "next/link"
import { fetchTasks } from "@/services/taskService"
import { listMembers } from "@/services/memberService"

export default function DashboardPage() {
  const session = useAuthStore((s) => s.session)
  const tasks = useDataStore((s) => s.tasks)
  const memberships = useDataStore((s) => s.memberships)
  const setTasks = useDataStore((s) => s.setTasks)
  const setMemberships = useDataStore((s) => s.setMemberships)

  const [isLoading, setIsLoading] = useState(true)

  const projectId = session?.project?.id
  const projectTasks = useMemo(() => tasks.filter((t) => t.project_id === projectId), [tasks, projectId])
  const members = useMemo(() => memberships.filter((m) => m.project_id === projectId && m.status === "active"), [memberships, projectId])

  useEffect(() => {
    let isMounted = true

    async function load() {
      if (!projectId) {
        if (isMounted) setIsLoading(false)
        return
      }

      try {
        const [fetchedTasks, membersResult] = await Promise.all([
          fetchTasks(projectId),
          listMembers(),
        ])

        if (!isMounted) return

        setTasks(fetchedTasks)
        if (membersResult.success && membersResult.members) {
          setMemberships(membersResult.members.map((m) => ({ ...m, project_id: projectId })))
        }
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    load()
    return () => {
      isMounted = false
    }
  }, [projectId, setTasks, setMemberships])

  useEffect(() => {
    if (!projectId) return
    let cancelled = false
    async function refresh() {
      try {
        const fetchedTasks = await fetchTasks(projectId)
        if (!cancelled) setTasks(fetchedTasks)
      } catch {
      }
    }
    function onTasksChanged() {
      refresh()
    }
    const interval = window.setInterval(refresh, 20000)
    window.addEventListener("tasks:changed", onTasksChanged as any)
    return () => {
      cancelled = true
      window.clearInterval(interval)
      window.removeEventListener("tasks:changed", onTasksChanged as any)
    }
  }, [projectId, setTasks])

  const done = projectTasks.filter((t) => t.status === "done").length
  const inProgress = projectTasks.filter((t) => t.status === "in_progress").length
  const pending = projectTasks.filter((t) => t.status === "pending").length
  const blocked = projectTasks.filter((t) => t.status === "blocked").length
  const total = projectTasks.length
  const completionRate = total > 0 ? Math.round((done / total) * 100) : 0
  const statusCounts = { pending, inProgress, blocked, done }

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

  const donutStyle = useMemo(() => {
    const value = Math.min(100, Math.max(0, completionRate))
    return {
      background: `conic-gradient(hsl(var(--primary)) ${value}%, hsl(var(--muted)) 0)`,
    } as const
  }, [completionRate])

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
              <span className="text-2xl font-bold">{isLoading ? "—" : s.value}</span>
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-2 border-primary/20 shadow-xl">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm">Progreso General</CardTitle>
          <Badge variant="secondary" className="text-xs">{completionRate}%</Badge>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="relative h-20 w-20 rounded-full bg-muted/30 p-1">
              <div className="absolute inset-0 rounded-full" style={donutStyle} />
              <div className="absolute inset-1 flex items-center justify-center rounded-full bg-background">
                <div className="text-center">
                  <div className="text-lg font-bold">{completionRate}%</div>
                  <div className="text-[10px] text-muted-foreground">completado</div>
                </div>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-baseline justify-between">
                <p className="text-sm font-medium">{done} / {total}</p>
                <p className="text-xs text-muted-foreground">tareas hechas</p>
              </div>
              <Progress value={completionRate} className="mt-2 h-3" />
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs">Pendiente: {statusCounts.pending}</Badge>
                <Badge variant="outline" className="text-xs">En Progreso: {statusCounts.inProgress}</Badge>
                <Badge variant="outline" className="text-xs">Bloqueada: {statusCounts.blocked}</Badge>
                <Badge variant="outline" className="text-xs">Hecha: {statusCounts.done}</Badge>
              </div>
            </div>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted/40 flex">
            <div className="h-full bg-yellow-400/70" style={{ width: total ? `${(statusCounts.pending / total) * 100}%` : "0%" }} />
            <div className="h-full bg-blue-400/70" style={{ width: total ? `${(statusCounts.inProgress / total) * 100}%` : "0%" }} />
            <div className="h-full bg-red-400/70" style={{ width: total ? `${(statusCounts.blocked / total) * 100}%` : "0%" }} />
            <div className="h-full bg-green-400/70" style={{ width: total ? `${(statusCounts.done / total) * 100}%` : "0%" }} />
          </div>
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
