"use client"

import { useEffect, useMemo, useState } from "react"
import { useAuthStore } from "@/stores/authStore"
import { useDataStore } from "@/stores/dataStore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TASK_STATUS_LABELS, TASK_STATUS_COLORS, TASK_PRIORITY_LABELS, TASK_PRIORITY_COLORS } from "@/lib/constants"
import Link from "next/link"
import { listSprints } from "@/services/sprintService"
import type { Sprint } from "@/mock/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { listMembers } from "@/services/memberService"
import { fetchTasks, updateTask as updateTaskService } from "@/services/taskService"
import type { Membership, Task, User } from "@/mock/types"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CalendarWithPresets } from "@/components/ui/calendar-with-presets"
import { cn } from "@/lib/utils"
import { SPRINT_COLOR_CLASS } from "@/lib/sprintColors"

export default function TimelinePage() {
  const session = useAuthStore((s) => s.session)
  const tasks = useDataStore((s) => s.tasks)
  const users = useDataStore((s) => s.users)
  const setTasks = useDataStore((s) => s.setTasks)
  const setUsers = useDataStore((s) => s.setUsers)

  const projectId = session?.project?.id
  const sprintEnabled = !!session?.project?.sprint_enabled
  const role = session?.user?.role
  const isOwner = role === "owner"
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [memberships, setMemberships] = useState<Membership[]>([])
  const [loading, setLoading] = useState(true)
  const [sprintFilter, setSprintFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all")
  const [search, setSearch] = useState("")

  const [startDateDialogOpen, setStartDateDialogOpen] = useState(false)
  const [startDateTask, setStartDateTask] = useState<Task | null>(null)
  const [startDateValue, setStartDateValue] = useState<Date | undefined>(undefined)
  const [savingStartDate, setSavingStartDate] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        const [tasksData, membersResult, sprintsResult] = await Promise.all([
          fetchTasks(projectId),
          listMembers(),
          sprintEnabled ? listSprints() : Promise.resolve({ success: true, sprints: [] as Sprint[] }),
        ])
        if (cancelled) return
        setTasks(tasksData)
        if (membersResult.success && membersResult.members) {
          setMemberships(membersResult.members)
          const mappedUsers = membersResult.members.map((m) => m.user).filter(Boolean) as User[]
          setUsers(mappedUsers)
        }
        if (sprintsResult.success && sprintsResult.sprints) setSprints(sprintsResult.sprints)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    function onTasksChanged() {
      load()
    }
    window.addEventListener("tasks:changed", onTasksChanged as any)
    return () => {
      cancelled = true
      window.removeEventListener("tasks:changed", onTasksChanged as any)
    }
  }, [sprintEnabled, projectId, setTasks, setUsers])

  const sprintById = useMemo(() => {
    const map = new Map<string, Sprint>()
    for (const s of (sprintEnabled ? sprints : [])) map.set(s.id, s)
    return map
  }, [sprints, sprintEnabled])

  const teamUsers = useMemo(() => {
    const fromMemberships = memberships.map((m) => m.user).filter(Boolean) as User[]
    if (fromMemberships.length > 0) return fromMemberships
    return users
  }, [memberships, users])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return tasks
      .filter((t) => t.project_id === projectId)
      .filter((t) => {
        if (statusFilter === "all") return true
        return t.status === statusFilter
      })
      .filter((t) => {
        if (!sprintEnabled || sprintFilter === "all") return true
        if (sprintFilter === "backlog") return !t.sprint_id
        return t.sprint_id === sprintFilter
      })
      .filter((t) => {
        if (assigneeFilter === "all") return true
        if (assigneeFilter === "unassigned") return !t.assigned_to
        return t.assigned_to === assigneeFilter
      })
      .filter((t) => {
        if (!q) return true
        return (t.title || "").toLowerCase().includes(q) || (t.description || "").toLowerCase().includes(q)
      })
  }, [tasks, projectId, statusFilter, sprintEnabled, sprintFilter, assigneeFilter, search])

  const scheduledTasks = useMemo(
    () => filtered
      .filter((t) => !!t.start_date)
      .sort((a, b) => new Date(a.start_date!).getTime() - new Date(b.start_date!).getTime()),
    [filtered]
  )

  const unscheduledTasks = useMemo(
    () => (isOwner ? filtered.filter((t) => !t.start_date && t.status !== "done") : []),
    [filtered, isOwner]
  )

  const months = Array.from(new Set(scheduledTasks.map((t) => {
    const d = new Date(t.start_date!)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
  }))).sort()

  function openStartDateDialog(task: Task) {
    setStartDateTask(task)
    setStartDateValue(task.start_date ? new Date(task.start_date) : new Date())
    setStartDateDialogOpen(true)
  }

  async function saveStartDate() {
    if (!startDateTask || !startDateValue) return
    setSavingStartDate(true)
    try {
      const updated = await updateTaskService(startDateTask.id, { start_date: startDateValue.toISOString() })
      setTasks(tasks.map((t) => (t.id === updated.id ? updated : t)))
      setStartDateDialogOpen(false)
      setStartDateTask(null)
      setStartDateValue(undefined)
      if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("tasks:changed"))
    } finally {
      setSavingStartDate(false)
    }
  }

  const startDateMinMax = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const task = startDateTask
    if (!task) return { min: today, max: undefined as Date | undefined, sprint: undefined as Sprint | undefined }
    if (!sprintEnabled || !task.sprint_id) return { min: today, max: undefined, sprint: undefined }
    const sprint = sprintById.get(task.sprint_id)
    if (!sprint) return { min: today, max: undefined, sprint: undefined }
    const sprintStart = new Date(sprint.start_date)
    sprintStart.setHours(0, 0, 0, 0)
    const sprintEnd = new Date(sprint.end_date)
    sprintEnd.setHours(0, 0, 0, 0)
    return { min: sprintStart > today ? sprintStart : today, max: sprintEnd, sprint }
  }, [startDateTask, sprintEnabled, sprintById])

  return (
    <div className="flex flex-col gap-[24px] relative z-[1]">
      <div className="flex flex-wrap items-center justify-between gap-[16px]">
        <div>
          <h1 className="text-[36px] font-[600] mb-[10px] text-admin-dark">Timeline</h1>
          <ul className="flex items-center gap-[16px]">
            <li><Link href="/app/dashboard" className="text-admin-dark-grey hover:opacity-80 transition-opacity">Dashboard</Link></li>
            <li><span className="text-admin-dark-grey">{'>'}</span></li>
            <li><span className="text-admin-blue font-medium">Timeline</span></li>
          </ul>
        </div>
      </div>
      
      <p className="text-admin-dark-grey font-medium">Vista cronologica de las tareas del proyecto.</p>

      <div className="p-1 rounded-xl bg-white/20 backdrop-blur-md border border-white/40 shadow-sm">
        <Card className="bg-transparent border-none shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-admin-dark-grey">Filtros de Cronograma</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-4">
            <div className="grid gap-1.5">
              <Label className="text-[11px] font-semibold text-admin-dark/70">Buscar</Label>
              <Input 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                placeholder="Título o descripción" 
                className="h-9 bg-white/50 border-white/30 focus:bg-white/80 transition-colors"
              />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-[11px] font-semibold text-admin-dark/70">Estado</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9 bg-white/50 border-white/30"><SelectValue placeholder="Todos" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {Object.entries(TASK_STATUS_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label className="text-[11px] font-semibold text-admin-dark/70">Asignado a</Label>
              <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                <SelectTrigger className="h-9 bg-white/50 border-white/30"><SelectValue placeholder="Todos" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="unassigned">Sin asignar</SelectItem>
                  {teamUsers.map((u) => (
                    <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label className="text-[11px] font-semibold text-admin-dark/70">Sprint</Label>
              <Select value={sprintFilter} onValueChange={setSprintFilter} disabled={!sprintEnabled}>
                <SelectTrigger className="h-9 bg-white/50 border-white/30"><SelectValue placeholder="Todos" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="backlog">Backlog</SelectItem>
                  {sprints.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">Cargando…</CardContent></Card>
      ) : months.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No hay tareas con fecha de inicio.</CardContent></Card>
      ) : (
        <div className="relative flex flex-col gap-6">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
          {months.map((month) => {
            const [year, m] = month.split("-")
            const monthLabel = new Date(parseInt(year), parseInt(m) - 1).toLocaleString("es-ES", { month: "long", year: "numeric" })
            const monthTasks = scheduledTasks.filter((t) => {
              const d = new Date(t.start_date!)
              return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}` === month
            })
            return (
              <div key={month}>
                <div className="relative mb-3 flex items-center gap-3 pl-8">
                  <div className="absolute left-2.5 h-3 w-3 rounded-full border-2 border-primary bg-background" />
                  <h3 className="text-sm font-semibold capitalize">{monthLabel}</h3>
                </div>
                <div className="flex flex-col gap-2 pl-10">
                  {monthTasks.map((t) => {
                    const assignee = teamUsers.find((u) => u.id === t.assigned_to)
                    const sprint = sprintEnabled && t.sprint_id ? sprintById.get(t.sprint_id) : undefined
                    const sprintCls = sprint ? SPRINT_COLOR_CLASS[sprint.color] : null
                    return (
                      <Card key={t.id} className="bg-admin-blue border-none shadow-md transition-all hover:scale-[1.01] overflow-hidden group">
                        <CardContent className="flex items-center gap-4 p-3 relative">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/20" />
                          <div className="flex-1 min-w-0">
                            <Link href={`/app/tasks/${t.id}`} className="text-sm font-bold text-white hover:underline drop-shadow-sm">{t.title}</Link>
                            <div className="mt-1.5 flex flex-wrap items-center gap-2">
                              <Badge variant="outline" className={cn("text-[10px] bg-white/10 border-white/20 text-white", TASK_STATUS_COLORS[t.status])}>{TASK_STATUS_LABELS[t.status]}</Badge>
                              <Badge variant="outline" className={cn("text-[10px] bg-white/10 border-white/20 text-white", TASK_PRIORITY_COLORS[t.priority])}>{TASK_PRIORITY_LABELS[t.priority]}</Badge>
                              {sprintEnabled ? (
                                t.sprint_id && sprint ? (
                                  <span className={cn("inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-medium transition-colors bg-white/20 border-white/10 text-white")}>
                                    <span className={cn("h-1.5 w-1.5 rounded-full", sprintCls?.dot?.replace("bg-", "bg-") ?? "bg-white")} />
                                    <span className="truncate">{sprint.name}</span>
                                  </span>
                                ) : (
                                  <Badge variant="secondary" className="text-[10px] bg-white/10 text-white border-white/20 border">Backlog</Badge>
                                )
                              ) : null}
                              {assignee ? <span className="text-[10px] text-white/80 ml-1">{assignee.name}</span> : null}
                            </div>
                          </div>
                          <div className="text-right text-xs text-white/90 font-medium shrink-0 bg-white/10 p-1.5 rounded-md border border-white/10">
                            <div>{new Date(t.start_date!).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}</div>
                            {t.due_date && <div className="text-white/60 text-[10px]">- {new Date(t.due_date).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}</div>}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {isOwner && unscheduledTasks.length > 0 ? (
        <Card className="bg-white/30 backdrop-blur-md border border-white/40 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Tareas sin fecha de inicio</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {unscheduledTasks.slice(0, 12).map((t) => (
              <div key={t.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
                <div className="min-w-0">
                  <Link href={`/app/tasks/${t.id}`} className="text-sm font-medium hover:underline">{t.title}</Link>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className={`text-[10px] ${TASK_STATUS_COLORS[t.status]}`}>{TASK_STATUS_LABELS[t.status]}</Badge>
                    <Badge variant="outline" className={`text-[10px] ${TASK_PRIORITY_COLORS[t.priority]}`}>{TASK_PRIORITY_LABELS[t.priority]}</Badge>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => openStartDateDialog(t)}>
                  Asignar fecha
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <Dialog open={startDateDialogOpen} onOpenChange={(v) => { setStartDateDialogOpen(v); if (!v) { setStartDateTask(null); setStartDateValue(undefined) } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Asignar fecha de inicio</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="text-sm font-medium">{startDateTask?.title || ""}</div>
            {startDateMinMax.sprint ? (
              <span className={cn("inline-flex w-fit items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium", SPRINT_COLOR_CLASS[startDateMinMax.sprint.color].pill)}>
                <span className={cn("h-2 w-2 rounded-full", SPRINT_COLOR_CLASS[startDateMinMax.sprint.color].dot)} />
                <span className="truncate">{startDateMinMax.sprint.name}</span>
                <span className="text-[10px] opacity-80">
                  {new Date(startDateMinMax.sprint.start_date).toLocaleDateString("es-ES")} → {new Date(startDateMinMax.sprint.end_date).toLocaleDateString("es-ES")}
                </span>
              </span>
            ) : null}
            <CalendarWithPresets
              date={startDateValue}
              onDateChange={setStartDateValue}
              minDate={startDateMinMax.min}
              maxDate={startDateMinMax.max}
              disabled={savingStartDate}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setStartDateDialogOpen(false)} disabled={savingStartDate}>Cancelar</Button>
            <Button onClick={saveStartDate} disabled={!startDateValue || savingStartDate}>{savingStartDate ? "Guardando..." : "Guardar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
