"use client"

import { useAuthStore } from "@/stores/authStore"
import { useDataStore } from "@/stores/dataStore"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TASK_STATUS_LABELS, TASK_STATUS_COLORS, TASK_PRIORITY_LABELS, TASK_PRIORITY_COLORS } from "@/lib/constants"
import Link from "next/link"

export default function TimelinePage() {
  const session = useAuthStore((s) => s.session)
  const tasks = useDataStore((s) => s.tasks)
  const users = useDataStore((s) => s.users)

  const projectId = session?.project?.id
  const projectTasks = tasks
    .filter((t) => t.project_id === projectId && t.start_date)
    .sort((a, b) => new Date(a.start_date!).getTime() - new Date(b.start_date!).getTime())

  const months = Array.from(new Set(projectTasks.map((t) => {
    const d = new Date(t.start_date!)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
  }))).sort()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Timeline</h1>
        <p className="text-muted-foreground">Vista cronologica de las tareas del proyecto</p>
      </div>

      {months.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No hay tareas con fecha de inicio.</CardContent></Card>
      ) : (
        <div className="relative flex flex-col gap-6">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
          {months.map((month) => {
            const [year, m] = month.split("-")
            const monthLabel = new Date(parseInt(year), parseInt(m) - 1).toLocaleString("es-ES", { month: "long", year: "numeric" })
            const monthTasks = projectTasks.filter((t) => {
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
                    const assignee = users.find((u) => u.id === t.assigned_to)
                    return (
                      <Card key={t.id}>
                        <CardContent className="flex items-center gap-4 p-3">
                          <div className="flex-1 min-w-0">
                            <Link href={`/app/tasks/${t.id}`} className="text-sm font-medium hover:underline">{t.title}</Link>
                            <div className="mt-1 flex flex-wrap items-center gap-2">
                              <Badge variant="outline" className={`text-[10px] ${TASK_STATUS_COLORS[t.status]}`}>{TASK_STATUS_LABELS[t.status]}</Badge>
                              <Badge variant="outline" className={`text-[10px] ${TASK_PRIORITY_COLORS[t.priority]}`}>{TASK_PRIORITY_LABELS[t.priority]}</Badge>
                              {assignee && <span className="text-[10px] text-muted-foreground">{assignee.name}</span>}
                            </div>
                          </div>
                          <div className="text-right text-xs text-muted-foreground shrink-0">
                            <div>{new Date(t.start_date!).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}</div>
                            {t.due_date && <div className="text-muted-foreground/60">- {new Date(t.due_date).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}</div>}
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
    </div>
  )
}
