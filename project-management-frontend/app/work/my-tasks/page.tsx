"use client"

import { useState } from "react"
import { useAuthStore } from "@/stores/authStore"
import { useDataStore } from "@/stores/dataStore"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"
import Link from "next/link"
import { TASK_STATUS_LABELS, TASK_STATUS_COLORS, TASK_PRIORITY_LABELS, TASK_PRIORITY_COLORS } from "@/lib/constants"

export default function MyTasksPage() {
  const session = useAuthStore((s) => s.session)
  const tasks = useDataStore((s) => s.tasks)
  const updateTask = useDataStore((s) => s.updateTask)

  const userId = session?.user?.id
  const myTasks = tasks.filter((t) => t.assigned_to === userId)

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const filtered = myTasks.filter((t) => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false
    if (statusFilter !== "all" && t.status !== statusFilter) return false
    return true
  })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mis Tareas</h1>
        <p className="text-muted-foreground">{filtered.length} tareas asignadas</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar tareas..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Estado" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {Object.entries(TASK_STATUS_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-3">
        {filtered.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">No tienes tareas asignadas.</CardContent></Card>
        ) : (
          filtered.map((t) => (
            <Card key={t.id} className="transition-shadow hover:shadow-md">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex-1 min-w-0">
                  <Link href={`/work/my-tasks/${t.id}`} className="text-sm font-medium hover:underline">{t.title}</Link>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className={TASK_STATUS_COLORS[t.status]}>{TASK_STATUS_LABELS[t.status]}</Badge>
                    <Badge variant="outline" className={TASK_PRIORITY_COLORS[t.priority]}>{TASK_PRIORITY_LABELS[t.priority]}</Badge>
                    {t.due_date && (
                      <span className="text-xs text-muted-foreground">
                        Vence: {new Date(t.due_date).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                      </span>
                    )}
                  </div>
                </div>
                <Select value={t.status} onValueChange={(v) => updateTask(t.id, { status: v as any, updated_at: new Date().toISOString() })}>
                  <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(TASK_STATUS_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
