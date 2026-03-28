"use client"

import { useEffect, useState } from "react"
import { useAuthStore } from "@/stores/authStore"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { TASK_STATUS_LABELS, TASK_PRIORITY_COLORS, TASK_PRIORITY_LABELS } from "@/lib/constants"
import type { TaskStatus, Task } from "@/mock/types"
import Link from "next/link"
import { fetchMyTasks, updateTaskStatus } from "@/services/taskService"
import { toast } from "@/hooks/use-toast"

const COLUMNS: TaskStatus[] = ["pending", "in_progress", "in_review", "blocked", "done"]

export default function WorkBoardPage() {
  const session = useAuthStore((s) => s.session)
  const currentUserId = session?.user?.id

  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>("")

  // Fetch initial data on mount
  const loadData = async () => {
    setIsLoading(true)
    setHasError(false)
    setErrorMessage("")

    try {
      const tasksData = await fetchMyTasks()
      // Filter just in case the backend returns more tasks than assigned to user
      const assignedTasks = currentUserId 
        ? tasksData.filter((t: Task) => t.assigned_to === currentUserId) 
        : tasksData
      setTasks(assignedTasks)
    } catch (error: any) {
      console.error("Error loading employee board data:", error)
      setErrorMessage(error.message || "Error al cargar datos del tablero")
      setHasError(true)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (currentUserId) {
      loadData()
    }
  }, [currentUserId])

  // Handle drag and drop with optimistic updates and rollback
  async function handleDrop(taskId: string, newStatus: TaskStatus) {
    const taskIndex = tasks.findIndex(t => t.id === taskId)
    if (taskIndex === -1) return

    const task = tasks[taskIndex]
    
    // Si el estado no cambia, no hacer nada
    if (task.status === newStatus) return

    // Store previous state for potential rollback
    const previousStatus = task.status
    const previousUpdatedAt = task.updated_at

    // Apply optimistic update immediately
    const updatedTasks = [...tasks]
    updatedTasks[taskIndex] = { ...task, status: newStatus, updated_at: new Date().toISOString() }
    setTasks(updatedTasks)

    try {
      // Call API to persist status change
      await updateTaskStatus(taskId, newStatus)
      
      // Show success toast notification
      toast({
        title: "Estado actualizado",
        description: `La tarea se movió a ${TASK_STATUS_LABELS[newStatus]}`,
        duration: 3000
      })
    } catch (error: any) {
      console.error("Error updating task status:", error)
      
      // Rollback: restore task to original column
      const rollbackTasks = [...updatedTasks]
      rollbackTasks[taskIndex] = { ...task, status: previousStatus, updated_at: previousUpdatedAt }
      setTasks(rollbackTasks)

      // Handle other errors
      const errorMsg = error.response?.data?.error?.message || error.message || "Error al actualizar el estado de la tarea"
      toast({
        title: "Error cambiando estado",
        description: errorMsg,
        variant: "destructive",
        duration: 5000
      })
    }
  }

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="flex flex-col gap-2">
      {[1, 2].map((i) => (
        <Card key={i}>
          <CardContent className="p-3">
            <Skeleton className="h-4 w-3/4 mb-2" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  // Empty state with retry button
  const EmptyStateWithRetry = () => (
    <div className="col-span-full flex flex-col items-center justify-center py-12 px-4 border rounded-xl bg-muted/10">
      <div className="text-center space-y-4 max-w-md">
        <div className="text-4xl mb-2">⚠️</div>
        <h3 className="text-lg font-semibold">No se pudieron cargar los datos</h3>
        <p className="text-sm text-muted-foreground">{errorMessage}</p>
        <button
          onClick={loadData}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Reintentar
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mi Board</h1>
        <p className="text-muted-foreground">Vista Kanban de tus tareas asignadas. Arrastra las tarjetas para cambiar su estado.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        {hasError ? (
          <EmptyStateWithRetry />
        ) : (
          COLUMNS.map((status) => {
            const columnTasks = tasks.filter((t) => t.status === status)
            return (
              <div
                key={status}
                className="flex flex-col rounded-xl border bg-muted/30 p-3 min-w-0"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  const taskId = e.dataTransfer.getData("taskId")
                  if (taskId) handleDrop(taskId, status)
                }}
              >
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-[13px] font-semibold">{TASK_STATUS_LABELS[status]}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {isLoading ? "-" : columnTasks.length}
                  </Badge>
                </div>
                
                {isLoading ? (
                  <LoadingSkeleton />
                ) : (
                  <div className="flex flex-col gap-2">
                    {columnTasks.map((t) => (
                      <Card
                        key={t.id}
                        draggable
                        onDragStart={(e) => e.dataTransfer.setData("taskId", t.id)}
                        className="cursor-grab active:cursor-grabbing"
                      >
                        <CardContent className="p-3">
                          <Link href={`/work/my-tasks/${t.id}`} className="block text-xs font-medium hover:underline truncate">
                            {t.title}
                          </Link>
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
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
