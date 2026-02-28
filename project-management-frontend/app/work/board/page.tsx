"use client"

import { useAuthStore } from "@/stores/authStore"
import { useDataStore } from "@/stores/dataStore"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TASK_STATUS_LABELS, TASK_PRIORITY_COLORS, TASK_PRIORITY_LABELS } from "@/lib/constants"
import type { TaskStatus } from "@/mock/types"
import Link from "next/link"

const COLUMNS: TaskStatus[] = ["pending", "in_progress", "blocked", "done"]

export default function WorkBoardPage() {
  const session = useAuthStore((s) => s.session)
  const tasks = useDataStore((s) => s.tasks)
  const updateTask = useDataStore((s) => s.updateTask)

  const userId = session?.user?.id
  const myTasks = tasks.filter((t) => t.assigned_to === userId)

  function handleDrop(taskId: string, newStatus: TaskStatus) {
    updateTask(taskId, { status: newStatus, updated_at: new Date().toISOString() })
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mi Board</h1>
        <p className="text-muted-foreground">Vista Kanban de tus tareas asignadas</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {COLUMNS.map((status) => {
          const columnTasks = myTasks.filter((t) => t.status === status)
          return (
            <div
              key={status}
              className="flex flex-col rounded-xl border bg-muted/30 p-3"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                const taskId = e.dataTransfer.getData("taskId")
                if (taskId) handleDrop(taskId, status)
              }}
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold">{TASK_STATUS_LABELS[status]}</h3>
                <Badge variant="secondary" className="text-xs">{columnTasks.length}</Badge>
              </div>
              <div className="flex flex-col gap-2">
                {columnTasks.map((t) => (
                  <Card
                    key={t.id}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData("taskId", t.id)}
                    className="cursor-grab active:cursor-grabbing"
                  >
                    <CardContent className="p-3">
                      <Link href={`/work/my-tasks/${t.id}`} className="text-sm font-medium hover:underline">{t.title}</Link>
                      <div className="mt-2 flex flex-wrap items-center gap-1">
                        <Badge variant="outline" className={`text-[10px] ${TASK_PRIORITY_COLORS[t.priority]}`}>
                          {TASK_PRIORITY_LABELS[t.priority]}
                        </Badge>
                        {t.due_date && (
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(t.due_date).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {columnTasks.length === 0 && (
                  <p className="py-8 text-center text-xs text-muted-foreground">Sin tareas</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
