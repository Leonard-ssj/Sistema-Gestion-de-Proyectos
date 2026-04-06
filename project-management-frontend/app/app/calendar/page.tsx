"use client"

import { useEffect, useMemo, useState } from "react"
import { useAuthStore } from "@/stores/authStore"
import { useDataStore } from "@/stores/dataStore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { TASK_PRIORITY_COLORS, TASK_STATUS_COLORS, TASK_STATUS_LABELS } from "@/lib/constants"
import Link from "next/link"
import { listSprints } from "@/services/sprintService"
import type { Membership, Sprint, Task, User } from "@/mock/types"
import { fetchTasks, updateTask as updateTaskService } from "@/services/taskService"
import { listMembers } from "@/services/memberService"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CalendarWithPresets } from "@/components/ui/calendar-with-presets"
import { cn } from "@/lib/utils"
import { SPRINT_COLOR_CLASS } from "@/lib/sprintColors"

export default function CalendarPage() {
  const session = useAuthStore((s) => s.session)
  const tasks = useDataStore((s) => s.tasks)
  const users = useDataStore((s) => s.users)
  const setTasks = useDataStore((s) => s.setTasks)
  const setUsers = useDataStore((s) => s.setUsers)
  const [currentDate, setCurrentDate] = useState(new Date())
  const sprintEnabled = !!session?.project?.sprint_enabled
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [memberships, setMemberships] = useState<Membership[]>([])
  const [loading, setLoading] = useState(true)

  const [sprintFilter, setSprintFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all")
  const [search, setSearch] = useState("")

  const [dayDialogOpen, setDayDialogOpen] = useState(false)
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)

  const [moveDialogOpen, setMoveDialogOpen] = useState(false)
  const [moveTask, setMoveTask] = useState<Task | null>(null)
  const [moveDueDate, setMoveDueDate] = useState<Date | undefined>(undefined)
  const [savingMove, setSavingMove] = useState(false)

  const projectId = session?.project?.id

  useEffect(() => {
    if (!projectId) return
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
  }, [projectId, sprintEnabled, setTasks, setUsers])

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
      .filter((t) => !!t.due_date)
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

  const activeOrFilteredSprint = useMemo(() => {
    if (!sprintEnabled) return null
    if (sprintFilter !== "all" && sprintFilter !== "backlog") return sprintById.get(sprintFilter) ?? null
    return sprints.find((s) => s.status === "active") ?? null
  }, [sprintEnabled, sprintFilter, sprintById, sprints])

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const monthLabel = currentDate.toLocaleString("es-ES", { month: "long", year: "numeric" })

  const days = Array.from({ length: 42 }, (_, i) => {
    const dayNum = i - firstDay + 1
    if (dayNum < 1 || dayNum > daysInMonth) return null
    return dayNum
  })

  function prevMonth() {
    setCurrentDate(new Date(year, month - 1, 1))
  }
  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  function getTasksForDay(day: number) {
    return filtered.filter((t) => {
      const d = new Date(t.due_date!)
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day
    })
  }

  const today = new Date()
  const isToday = (day: number) => today.getFullYear() === year && today.getMonth() === month && today.getDate() === day

  function inSprintRange(date: Date, sprint: Sprint | null) {
    if (!sprint) return false
    const x = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
    const start = new Date(sprint.start_date)
    const end = new Date(sprint.end_date)
    const s = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime()
    const e = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime()
    return x >= s && x <= e
  }

  const role = session?.user?.role
  const isOwner = role === "owner"

  const selectedDayTasks = useMemo(() => {
    if (!selectedDay) return []
    const y = selectedDay.getFullYear()
    const m = selectedDay.getMonth()
    const d0 = selectedDay.getDate()
    return filtered
      .filter((t) => {
        const d = new Date(t.due_date!)
        return d.getFullYear() === y && d.getMonth() === m && d.getDate() === d0
      })
      .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
  }, [selectedDay, filtered])

  function openDay(day: number) {
    const d = new Date(year, month, day)
    setSelectedDay(d)
    setDayDialogOpen(true)
  }

  function openMove(task: Task) {
    setMoveTask(task)
    setMoveDueDate(task.due_date ? new Date(task.due_date) : new Date())
    setMoveDialogOpen(true)
  }

  const moveMinDate = useMemo(() => {
    const tomorrow = new Date()
    tomorrow.setHours(0, 0, 0, 0)
    tomorrow.setDate(tomorrow.getDate() + 1)
    if (!moveTask || !sprintEnabled || !moveTask.sprint_id) return tomorrow
    const sprint = sprintById.get(moveTask.sprint_id)
    if (!sprint) return tomorrow
    const start = new Date(sprint.start_date)
    start.setHours(0, 0, 0, 0)
    return start > tomorrow ? start : tomorrow
  }, [moveTask, sprintEnabled, sprintById])

  async function saveMove() {
    if (!moveTask || !moveDueDate) return
    setSavingMove(true)
    try {
      const updated = await updateTaskService(moveTask.id, { due_date: moveDueDate.toISOString() })
      setTasks(tasks.map((t) => (t.id === updated.id ? updated : t)))
      setMoveDialogOpen(false)
      setMoveTask(null)
      setMoveDueDate(undefined)
      if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("tasks:changed"))
    } finally {
      setSavingMove(false)
    }
  }

  return (
    <div className="flex flex-col gap-[24px] relative z-[1]">
      <div className="flex flex-wrap items-center justify-between gap-[16px]">
        <div>
          <h1 className="text-[36px] font-[600] mb-[10px] text-admin-dark">Calendario</h1>
          <ul className="flex items-center gap-[16px]">
            <li><Link href="/app/dashboard" className="text-admin-dark-grey hover:opacity-80 transition-opacity">Dashboard</Link></li>
            <li><span className="text-admin-dark-grey">{'>'}</span></li>
            <li><span className="text-admin-blue font-medium">Calendario</span></li>
          </ul>
        </div>
      </div>
      
      <p className="text-admin-dark-grey font-medium">Tareas organizadas por fecha de vencimiento</p>

      <div className="p-1 rounded-xl bg-white/20 backdrop-blur-md border border-white/40 shadow-sm">
        <Card className="bg-transparent border-none shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-admin-dark-grey">Filtros de Calendario</CardTitle>
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

      <Card className="bg-white/30 backdrop-blur-md border border-white/40 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <Button variant="ghost" size="icon" onClick={prevMonth}><ChevronLeft className="h-4 w-4" /></Button>
          <div className="flex flex-col items-center gap-1">
            <CardTitle className="capitalize text-base">{monthLabel}</CardTitle>
            {activeOrFilteredSprint ? (
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-medium",
                  SPRINT_COLOR_CLASS[activeOrFilteredSprint.color].pill
                )}
                title={`${activeOrFilteredSprint.name} · ${new Date(activeOrFilteredSprint.start_date).toLocaleDateString("es-ES")} → ${new Date(activeOrFilteredSprint.end_date).toLocaleDateString("es-ES")}`}
              >
                <span className={cn("h-2 w-2 rounded-full", SPRINT_COLOR_CLASS[activeOrFilteredSprint.color].dot)} />
                <span className="truncate">{activeOrFilteredSprint.name}</span>
                <span className="opacity-80">
                  {new Date(activeOrFilteredSprint.start_date).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" })}→
                  {new Date(activeOrFilteredSprint.end_date).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" })}
                </span>
              </span>
            ) : null}
          </div>
          <Button variant="ghost" size="icon" onClick={nextMonth}><ChevronRight className="h-4 w-4" /></Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 text-center text-muted-foreground">Cargando…</div>
          ) : null}
          <div className="grid grid-cols-7 gap-px">
            {["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"].map((d) => (
              <div key={d} className="p-2 text-center text-xs font-medium text-muted-foreground">{d}</div>
            ))}
            {days.map((day, i) => {
              const dayTasks = day ? getTasksForDay(day) : []
              const dateObj = day ? new Date(year, month, day) : null
              const inSprint = dateObj ? inSprintRange(dateObj, activeOrFilteredSprint) : false
              const sprintRangeClass = activeOrFilteredSprint ? SPRINT_COLOR_CLASS[activeOrFilteredSprint.color].range : ""
              return (
                <div
                  key={i}
                  className={cn(
                    "min-h-[100px] border p-2 transition-all overflow-hidden relative",
                    day ? "bg-white/40 hover:bg-white/60 cursor-pointer" : "bg-admin-dark-grey/5",
                    day && isToday(day) ? "ring-2 ring-admin-blue z-[2]" : "border-white/20",
                    day && inSprint ? sprintRangeClass : ""
                  )}
                  onClick={() => day && openDay(day)}
                >
                  {day && (
                    <>
                      <span className={cn("text-xs font-bold", isToday(day) ? "text-admin-blue" : "text-admin-dark-grey")}>{day}</span>
                      <div className="mt-1 flex flex-col gap-1">
                        {dayTasks.slice(0, 3).map((t) => {
                          const sp = sprintEnabled && t.sprint_id ? sprintById.get(t.sprint_id) : null
                          const cls = sp ? SPRINT_COLOR_CLASS[sp.color] : null
                          return (
                            <Link key={t.id} href={`/app/tasks/${t.id}`} onClick={(e) => e.stopPropagation()}>
                              <span className={cn("inline-flex w-full items-center gap-1 rounded bg-admin-blue px-1.5 py-0.5 text-[9px] font-bold text-white shadow-sm transition-transform hover:scale-105")}>
                                {cls ? <span className={cn("h-1.5 w-1.5 rounded-full", cls.dot?.replace("bg-", "bg-") ?? "bg-white")} /> : <div className="h-1.5 w-1.5 rounded-full bg-white/40" />}
                                <span className="truncate">{t.title}</span>
                              </span>
                            </Link>
                          )
                        })}
                        {dayTasks.length > 3 && (
                          <span className="text-[9px] text-muted-foreground">+{dayTasks.length - 3} mas</span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Dialog open={dayDialogOpen} onOpenChange={(v) => { setDayDialogOpen(v); if (!v) setSelectedDay(null) }}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {selectedDay ? selectedDay.toLocaleDateString("es-ES", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) : ""}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-2">
            {selectedDayTasks.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground">No hay tareas con vencimiento en este día.</div>
            ) : (
              selectedDayTasks.map((t) => {
                const assignee = teamUsers.find((u) => u.id === t.assigned_to)
                const sp = sprintEnabled && t.sprint_id ? sprintById.get(t.sprint_id) : null
                const cls = sp ? SPRINT_COLOR_CLASS[sp.color] : null
                return (
                  <div key={t.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
                    <div className="min-w-0">
                      <Link href={`/app/tasks/${t.id}`} className="text-sm font-medium hover:underline">{t.title}</Link>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className={cn("text-[10px]", TASK_STATUS_COLORS[t.status])}>
                          {TASK_STATUS_LABELS[t.status]}
                        </Badge>
                        <Badge variant="outline" className={cn("text-[10px]", TASK_PRIORITY_COLORS[t.priority])}>
                          {t.priority}
                        </Badge>
                        {cls ? (
                          <span className={cn("inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-medium", cls.pill)}>
                            <span className={cn("h-2 w-2 rounded-full", cls.dot)} />
                            <span className="truncate">{sp?.name}</span>
                          </span>
                        ) : null}
                        {assignee ? <span className="text-[10px] text-muted-foreground">{assignee.name}</span> : null}
                      </div>
                    </div>
                    {isOwner ? (
                      <Button variant="outline" size="sm" onClick={() => openMove(t)}>
                        Cambiar vencimiento
                      </Button>
                    ) : null}
                  </div>
                )
              })
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={moveDialogOpen} onOpenChange={(v) => { setMoveDialogOpen(v); if (!v) { setMoveTask(null); setMoveDueDate(undefined) } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Cambiar vencimiento</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="text-sm font-medium">{moveTask?.title || ""}</div>
            {moveTask && sprintEnabled && moveTask.sprint_id ? (() => {
              const sp = sprintById.get(moveTask.sprint_id!)
              if (!sp) return null
              const cls = SPRINT_COLOR_CLASS[sp.color]
              return (
                <span className={cn("inline-flex w-fit items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium", cls.pill)}>
                  <span className={cn("h-2 w-2 rounded-full", cls.dot)} />
                  <span className="truncate">{sp.name}</span>
                  <span className="text-[10px] opacity-80">
                    {new Date(sp.start_date).toLocaleDateString("es-ES")} → {new Date(sp.end_date).toLocaleDateString("es-ES")}
                  </span>
                </span>
              )
            })() : null}
            <CalendarWithPresets date={moveDueDate} onDateChange={setMoveDueDate} minDate={moveMinDate} disabled={savingMove} />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setMoveDialogOpen(false)} disabled={savingMove}>Cancelar</Button>
            <Button onClick={saveMove} disabled={!moveDueDate || savingMove}>{savingMove ? "Guardando..." : "Guardar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
