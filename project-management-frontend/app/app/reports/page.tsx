"use client"

import { useEffect, useMemo, useState } from "react"
import { useAuthStore } from "@/stores/authStore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { TASK_STATUS_LABELS, TASK_STATUS_COLORS, TASK_PRIORITY_LABELS, TASK_PRIORITY_COLORS } from "@/lib/constants"
import type { Sprint, Task, TaskPriority, TaskStatus, Membership } from "@/mock/types"
import { normalizeAvatarUrl } from "@/lib/avatars"
import { fetchTasks } from "@/services/taskService"
import { listMembers } from "@/services/memberService"
import { listSprints } from "@/services/sprintService"
import { toast } from "sonner"
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from "recharts"
import { Download, Loader2 } from "lucide-react"

export default function ReportsPage() {
  const session = useAuthStore((s) => s.session)
  const [loading, setLoading] = useState(true)
  const [tasks, setTasks] = useState<Task[]>([])
  const [members, setMembers] = useState<Membership[]>([])
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [sprintFilter, setSprintFilter] = useState<string>("all")

  useEffect(() => {
    async function load() {
      if (!session?.project?.id) return
      setLoading(true)
      try {
        const [t, m, sp] = await Promise.all([
          fetchTasks(session.project.id),
          listMembers(),
          listSprints(),
        ])
        setTasks(t)
        if (m.success && m.members) setMembers(m.members)
        if (sp.success && sp.sprints) setSprints(sp.sprints)
      } catch (e: any) {
        toast.error(e?.message || "Error cargando reportes")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [session?.project?.id])

  const sprintLabelById = useMemo(() => {
    const map: Record<string, string> = {}
    for (const s of sprints) map[s.id] = s.name
    return map
  }, [sprints])

  const filteredTasks = useMemo(() => {
    if (sprintFilter === "all") return tasks
    if (sprintFilter === "backlog") return tasks.filter((t) => !t.sprint_id)
    return tasks.filter((t) => t.sprint_id === sprintFilter)
  }, [tasks, sprintFilter])

  const total = filteredTasks.length
  const doneCount = filteredTasks.filter((t) => t.status === "done").length
  const completionPct = total > 0 ? Math.round((doneCount / total) * 100) : 0
  const unassigned = filteredTasks.filter((t) => !t.assigned_to).length

  const statusOrder: TaskStatus[] = ["pending", "in_progress", "in_review", "blocked", "done"]
  const priorityOrder: TaskPriority[] = ["low", "medium", "high", "urgent"]

  const statusChartConfig = useMemo(
    () => ({
      pending: { label: TASK_STATUS_LABELS.pending, color: "#eab308" },
      in_progress: { label: TASK_STATUS_LABELS.in_progress, color: "#3b82f6" },
      in_review: { label: TASK_STATUS_LABELS.in_review, color: "#a855f7" },
      blocked: { label: TASK_STATUS_LABELS.blocked, color: "#ef4444" },
      done: { label: TASK_STATUS_LABELS.done, color: "#10b981" },
    }),
    [],
  )

  const priorityChartConfig = useMemo(
    () => ({
      low: { label: TASK_PRIORITY_LABELS.low, color: "#64748b" },
      medium: { label: TASK_PRIORITY_LABELS.medium, color: "#3b82f6" },
      high: { label: TASK_PRIORITY_LABELS.high, color: "#f97316" },
      urgent: { label: TASK_PRIORITY_LABELS.urgent, color: "#ef4444" },
    }),
    [],
  )

  const statusData = useMemo(
    () =>
      statusOrder.map((status) => ({
        status,
        count: filteredTasks.filter((t) => t.status === status).length,
        fill: `var(--color-${status})`,
      })),
    [filteredTasks],
  )

  const priorityData = useMemo(
    () =>
      priorityOrder.map((priority) => ({
        priority,
        count: filteredTasks.filter((t) => t.priority === priority).length,
        fill: `var(--color-${priority})`,
      })),
    [filteredTasks],
  )

  const teamMembers = useMemo(() => {
    const active = members.filter((m) => m.status === "active" && m.user)
    const rows = active.map((m) => {
      const userTasks = filteredTasks.filter((t) => t.assigned_to === m.user_id)
      const done = userTasks.filter((t) => t.status === "done").length
      return { user: m.user, total: userTasks.length, done }
    })
    rows.sort((a, b) => b.done - a.done)
    return rows
  }, [members, filteredTasks])

  const sprintOverview = useMemo(() => {
    const rows: { key: string; name: string; total: number; done: number }[] = []
    const backlogTasks = tasks.filter((t) => !t.sprint_id)
    rows.push({ key: "backlog", name: "Backlog", total: backlogTasks.length, done: backlogTasks.filter((t) => t.status === "done").length })
    for (const sp of sprints) {
      const st = tasks.filter((t) => t.sprint_id === sp.id)
      rows.push({ key: sp.id, name: sp.name, total: st.length, done: st.filter((t) => t.status === "done").length })
    }
    return rows
  }, [tasks, sprints])

  const memberNameByUserId = useMemo(() => {
    const map: Record<string, string> = {}
    for (const m of members) {
      if (m.user?.id && m.user?.name) map[m.user.id] = m.user.name
    }
    return map
  }, [members])

  function parseIsoDate(value?: string | null) {
    if (!value) return null
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return null
    return d
  }

  async function exportTasksXlsx() {
    try {
      const ExcelJSImport = await import("exceljs")
      const ExcelJS: any = (ExcelJSImport as any).default || ExcelJSImport
      const workbook = new ExcelJS.Workbook()
      workbook.creator = "ProGest"
      workbook.created = new Date()

      const sheet = workbook.addWorksheet("Tareas", {
        views: [{ state: "frozen", ySplit: 1 }],
      })

      sheet.columns = [
        { header: "ID", key: "id", width: 18 },
        { header: "Título", key: "title", width: 38 },
        { header: "Estado", key: "status", width: 16 },
        { header: "Prioridad", key: "priority", width: 14 },
        { header: "Sprint", key: "sprint", width: 26 },
        { header: "Asignado a", key: "assignedTo", width: 24 },
        { header: "Creado por", key: "createdBy", width: 24 },
        { header: "Inicio", key: "start", width: 14 },
        { header: "Vence", key: "due", width: 14 },
      ]

      sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } }
      sheet.getRow(1).alignment = { vertical: "middle", horizontal: "center" }
      sheet.getRow(1).height = 20
      for (let i = 1; i <= sheet.columnCount; i++) {
        sheet.getRow(1).getCell(i).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "111827" } }
      }
      sheet.autoFilter = {
        from: { row: 1, column: 1 },
        to: { row: 1, column: sheet.columnCount },
      }

      const statusFill: Record<string, string> = {
        pending: "FEF3C7",
        in_progress: "DBEAFE",
        in_review: "F3E8FF",
        blocked: "FEE2E2",
        done: "D1FAE5",
      }
      const statusFont: Record<string, string> = {
        pending: "92400E",
        in_progress: "1E40AF",
        in_review: "6B21A8",
        blocked: "991B1B",
        done: "065F46",
      }

      for (const t of filteredTasks) {
        const sprintName = t.sprint_id ? sprintLabelById[t.sprint_id] || t.sprint_id : "Backlog"
        const assignedTo = t.assigned_to ? memberNameByUserId[t.assigned_to] || t.assigned_to : "Sin asignar"
        const createdBy = t.created_by ? memberNameByUserId[t.created_by] || t.created_by : ""
        const start = parseIsoDate(t.start_date)
        const due = parseIsoDate(t.due_date)
        const row = sheet.addRow({
          id: t.id,
          title: t.title,
          status: TASK_STATUS_LABELS[t.status],
          priority: TASK_PRIORITY_LABELS[t.priority],
          sprint: sprintName,
          assignedTo,
          createdBy,
          start: start || "",
          due: due || "",
        })

        row.getCell("start").numFmt = "dd/mm/yyyy"
        row.getCell("due").numFmt = "dd/mm/yyyy"

        const base = t.status
        const fill = statusFill[base]
        const font = statusFont[base]
        if (fill && font) {
          const cell = row.getCell("status")
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: fill } }
          cell.font = { bold: true, color: { argb: font } }
          cell.alignment = { vertical: "middle", horizontal: "center" }
        }
        row.getCell("priority").alignment = { vertical: "middle", horizontal: "center" }
      }

      sheet.eachRow((row: any, rowNumber: number) => {
        row.alignment = row.alignment || { vertical: "middle" }
        if (rowNumber > 1) row.height = 18
      })

      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `reportes_tareas_${new Date().toISOString().slice(0, 10)}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
      toast.success("Excel descargado")
    } catch (e: any) {
      toast.error(e?.message || "No se pudo exportar a Excel")
    }
  }

  async function exportSummaryXlsx() {
    try {
      const ExcelJSImport = await import("exceljs")
      const ExcelJS: any = (ExcelJSImport as any).default || ExcelJSImport
      const workbook = new ExcelJS.Workbook()
      workbook.creator = "ProGest"
      workbook.created = new Date()

      const sheet = workbook.addWorksheet("Resumen", {
        views: [{ state: "frozen", ySplit: 3 }],
      })

      const title = `Reportes - ${session?.project?.name || "Proyecto"}`
      sheet.mergeCells("A1", "F1")
      sheet.getCell("A1").value = title
      sheet.getCell("A1").font = { bold: true, size: 16, color: { argb: "111827" } }
      sheet.getCell("A1").alignment = { vertical: "middle", horizontal: "left" }

      sheet.mergeCells("A2", "F2")
      sheet.getCell("A2").value = `Filtro: ${sprintFilter === "all" ? "Todos los sprints" : sprintFilter === "backlog" ? "Backlog" : sprintLabelById[sprintFilter] || "Sprint"}`
      sheet.getCell("A2").font = { size: 11, color: { argb: "6B7280" } }
      sheet.getCell("A2").alignment = { vertical: "middle", horizontal: "left" }

      const headerRow = sheet.addRow(["Métrica", "Valor"])
      headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } }
      headerRow.alignment = { vertical: "middle", horizontal: "left" }
      headerRow.eachCell((c: any) => {
        c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "111827" } }
      })
      sheet.columns = [{ width: 26 }, { width: 18 }, { width: 2 }, { width: 26 }, { width: 18 }, { width: 18 }]

      sheet.addRow(["Total de tareas", total])
      sheet.addRow(["Completadas", doneCount])
      sheet.addRow(["Avance (%)", `${completionPct}%`])
      sheet.addRow(["Sin asignar", unassigned])

      sheet.addRow([])
      const statusHeader = sheet.addRow(["Distribución por estado"])
      sheet.mergeCells(`A${statusHeader.number}`, `F${statusHeader.number}`)
      sheet.getCell(`A${statusHeader.number}`).font = { bold: true, color: { argb: "111827" } }

      const statusTableHeader = sheet.addRow(["Estado", "Conteo"])
      statusTableHeader.font = { bold: true, color: { argb: "FFFFFFFF" } }
      statusTableHeader.eachCell((c: any) => {
        c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "374151" } }
      })
      for (const s of statusData) {
        sheet.addRow([TASK_STATUS_LABELS[s.status as TaskStatus], s.count])
      }

      sheet.addRow([])
      const priorityHeader = sheet.addRow(["Distribución por prioridad"])
      sheet.mergeCells(`A${priorityHeader.number}`, `F${priorityHeader.number}`)
      sheet.getCell(`A${priorityHeader.number}`).font = { bold: true, color: { argb: "111827" } }

      const prHeader = sheet.addRow(["Prioridad", "Conteo"])
      prHeader.font = { bold: true, color: { argb: "FFFFFFFF" } }
      prHeader.eachCell((c: any) => {
        c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "374151" } }
      })
      for (const p of priorityData) {
        sheet.addRow([TASK_PRIORITY_LABELS[p.priority as TaskPriority], p.count])
      }

      sheet.addRow([])
      const sprintHeader = sheet.addRow(["Por sprint"])
      sheet.mergeCells(`A${sprintHeader.number}`, `F${sprintHeader.number}`)
      sheet.getCell(`A${sprintHeader.number}`).font = { bold: true, color: { argb: "111827" } }

      const spHeader = sheet.addRow(["Sprint", "Total", "Completadas"])
      spHeader.font = { bold: true, color: { argb: "FFFFFFFF" } }
      spHeader.eachCell((c: any) => {
        c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "374151" } }
      })
      for (const sp of sprintOverview) {
        sheet.addRow([sp.name, sp.total, sp.done])
      }

      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `reportes_resumen_${new Date().toISOString().slice(0, 10)}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
      toast.success("Excel descargado")
    } catch (e: any) {
      toast.error(e?.message || "No se pudo exportar a Excel")
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reportes</h1>
          <p className="text-muted-foreground">Resumen analítico del proyecto</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Select value={sprintFilter} onValueChange={setSprintFilter}>
            <SelectTrigger className="w-full sm:w-[260px]">
              <SelectValue placeholder="Filtrar por sprint" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los sprints</SelectItem>
              <SelectItem value="backlog">Backlog</SelectItem>
              {sprints.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name} ({s.status})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2" onClick={exportSummaryXlsx} disabled={loading}>
            <Download className="h-4 w-4" />
            Exportar resumen (XLSX)
          </Button>
          <Button className="gap-2" onClick={exportTasksXlsx} disabled={loading}>
            <Download className="h-4 w-4" />
            Exportar tareas (XLSX)
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-[320px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Total de tareas</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{total}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Filtro: {sprintFilter === "all" ? "Todos" : sprintFilter === "backlog" ? "Backlog" : sprintLabelById[sprintFilter] || "Sprint"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Completadas</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{doneCount}</div>
            <Progress value={completionPct} className="mt-3 h-2" />
            <p className="mt-1 text-xs text-muted-foreground">{completionPct}% de avance</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Sin asignar</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{unassigned}</div>
            <p className="mt-1 text-xs text-muted-foreground">Tareas sin responsable</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Por Estado</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-4">
            <ChartContainer config={statusChartConfig} className="h-[220px]">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent nameKey="status" />} />
                <Pie data={statusData} dataKey="count" nameKey="status" innerRadius={60} outerRadius={90} strokeWidth={2}>
                  {statusData.map((entry) => (
                    <Cell key={entry.status} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="flex flex-col gap-3">
              {statusData.map((s) => (
                <div key={s.status} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className={TASK_STATUS_COLORS[s.status]}>{TASK_STATUS_LABELS[s.status]}</Badge>
                    <span className="text-sm font-medium">{s.count} ({total > 0 ? Math.round((s.count / total) * 100) : 0}%)</span>
                  </div>
                  <Progress value={total > 0 ? (s.count / total) * 100 : 0} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Por Prioridad</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-4">
            <ChartContainer config={priorityChartConfig} className="h-[220px]">
              <BarChart data={priorityData} margin={{ left: 0, right: 0 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="priority" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip content={<ChartTooltipContent nameKey="priority" />} />
                <Bar dataKey="count" radius={6}>
                  {priorityData.map((entry) => (
                    <Cell key={entry.priority} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
            <div className="flex flex-col gap-3">
              {priorityData.map((p) => (
                <div key={p.priority} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className={TASK_PRIORITY_COLORS[p.priority]}>{TASK_PRIORITY_LABELS[p.priority]}</Badge>
                    <span className="text-sm font-medium">{p.count}</span>
                  </div>
                  <Progress value={total > 0 ? (p.count / total) * 100 : 0} className="h-2" />
                </div>
              ))}
            </div>
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

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Por Sprint</CardTitle></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {sprintOverview.map((sp) => (
            <div key={sp.key} className="rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{sp.name}</p>
                <p className="text-xs text-muted-foreground">{sp.done}/{sp.total} completadas</p>
              </div>
              <Progress value={sp.total > 0 ? (sp.done / sp.total) * 100 : 0} className="mt-2 h-2" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
