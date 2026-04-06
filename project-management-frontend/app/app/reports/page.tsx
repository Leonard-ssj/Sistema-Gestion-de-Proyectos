"use client"

import { useAuthStore } from "@/stores/authStore"
import { useDataStore } from "@/stores/dataStore"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TASK_STATUS_LABELS, TASK_STATUS_COLORS, TASK_PRIORITY_LABELS, TASK_PRIORITY_COLORS } from "@/lib/constants"
import { cn } from "@/lib/utils"
import type { TaskStatus, TaskPriority } from "@/mock/types"
import { normalizeAvatarUrl } from "@/lib/avatars"
import { useEffect, useState } from "react"
import { fetchTasks } from "@/services/taskService"
import { listMembers } from "@/services/memberService"
import { Loader2 } from "lucide-react"
import Link from "next/link"

export default function ReportsPage() {
  const session = useAuthStore((s) => s.session)
  const tasks = useDataStore((s) => s.tasks)
  const users = useDataStore((s) => s.users)
  const memberships = useDataStore((s) => s.memberships)
  const setMemberships = useDataStore((s) => s.setMemberships)
  const setUsers = useDataStore((s) => s.setUsers)
  const setTasks = useDataStore((s) => s.setTasks)

  const [loading, setLoading] = useState(true)
  const projectId = session?.project?.id

  // Load fresh data on mount
  useEffect(() => {
    async function loadData() {
      if (!projectId) return
      setLoading(true)
      try {
        const [tasksData, membersResp] = await Promise.all([
          fetchTasks(),
          listMembers()
        ])
        
        if (tasksData) {
          setTasks(tasksData)
        }
        
        if (membersResp.success && membersResp.members) {
          setMemberships(membersResp.members)
          // Also set users from members
          const extractedUsers = membersResp.members.map(m => m.user).filter(Boolean) as any[]
          setUsers(extractedUsers)
        }
      } catch (err) {
        console.error("Error loading reports data", err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [projectId, setTasks, setMemberships, setUsers])

  const projectTasks = tasks.filter((t) => t.project_id === projectId)
  const total = projectTasks.length

  const statusBreakdown: { status: TaskStatus; count: number }[] = (["pending", "in_progress", "in_review", "blocked", "done"] as TaskStatus[]).map((status) => ({
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

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-[24px] relative z-[1]">
      <div className="flex flex-wrap items-center justify-between gap-[16px]">
        <div>
          <h1 className="text-[36px] font-[600] mb-[10px] text-admin-dark">Reportes</h1>
          <ul className="flex items-center gap-[16px]">
            <li><Link href="/app/dashboard" className="text-admin-dark-grey hover:opacity-80 transition-opacity">Dashboard</Link></li>
            <li><span className="text-admin-dark-grey">{'>'}</span></li>
            <li><span className="text-admin-blue font-medium">Reportes</span></li>
          </ul>
        </div>
      </div>
      
      <p className="text-admin-dark-grey font-medium">Resumen analítico del proyecto.</p>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-admin-blue border-none shadow-lg group relative overflow-hidden transition-all hover:scale-[1.01]">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <div className="h-16 w-16 rounded-full border-[8px] border-white" />
          </div>
          <CardHeader className="pb-2 border-b border-white/10 mx-4 px-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-white">Desglose por Estado</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 mt-4">
            {statusBreakdown.map((s) => (
              <div key={s.status} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className={cn("border-none text-[10px] text-white bg-white/20", TASK_STATUS_COLORS[s.status])}>{TASK_STATUS_LABELS[s.status]}</Badge>
                  <span className="text-xs font-bold text-white">{s.count} ({total > 0 ? Math.round((s.count / total) * 100) : 0}%)</span>
                </div>
                <Progress value={total > 0 ? (s.count / total) * 100 : 0} className="h-1.5 bg-white/10" indicatorClassName="bg-white" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-admin-green border-none shadow-lg group relative overflow-hidden transition-all hover:scale-[1.01]">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <div className="h-16 w-16 border-[8px] border-white rotate-45" />
          </div>
          <CardHeader className="pb-2 border-b border-white/10 mx-4 px-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-white">Desglose por Prioridad</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 mt-4">
            {priorityBreakdown.map((p) => (
              <div key={p.priority} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className={cn("border-none text-[10px] text-white bg-white/20", TASK_PRIORITY_COLORS[p.priority])}>{TASK_PRIORITY_LABELS[p.priority]}</Badge>
                  <span className="text-xs font-bold text-white">{p.count}</span>
                </div>
                <Progress value={total > 0 ? (p.count / total) * 100 : 0} className="h-1.5 bg-white/10" indicatorClassName="bg-white" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white/20 backdrop-blur-md border border-white/40 shadow-sm transition-all hover:bg-white/30">
        <CardHeader className="pb-2 border-b border-white/10">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-admin-dark-grey">Tareas por Miembro</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {teamMembers.map((m) => (
              <div key={m.user?.id} className="flex items-center gap-4">
                <img alt="" src={normalizeAvatarUrl(m.user?.avatar)} className="h-8 w-8 rounded-full border border-border bg-muted/20 shrink-0" />
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
