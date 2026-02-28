"use client"

import { useEffect, useState } from "react"
import { useAuthStore } from "@/stores/authStore"
import { useDataStore } from "@/stores/dataStore"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { TASK_STATUS_LABELS, TASK_PRIORITY_COLORS, TASK_PRIORITY_LABELS } from "@/lib/constants"
import type { TaskStatus, Task, Membership } from "@/mock/types"
import Link from "next/link"
import { fetchTasks, updateTaskStatus } from "@/services/taskService"
import { listMembers } from "@/services/memberService"
import { toast } from "@/hooks/use-toast"

const COLUMNS: TaskStatus[] = ["pending", "in_progress", "blocked", "done"]

export default function BoardPage() {
  const session = useAuthStore((s) => s.session)
  const tasks = useDataStore((s) => s.tasks)
  const setTasks = useDataStore((s) => s.setTasks)
  const users = useDataStore((s) => s.users)
  const setUsers = useDataStore((s) => s.setUsers)
  const updateTask = useDataStore((s) => s.updateTask)

  const [isLoading, setIsLoading] = useState(true)
  const [members, setMembers] = useState<Membership[]>([])
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>("")

  const projectId = session?.project?.id

  // Helper function to detect network errors
  const isNetworkError = (error: any): boolean => {
    // Check for network connectivity issues
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      return true
    }
    // Check for timeout errors
    if (error.message?.includes('timeout') || error.message?.includes('timed out')) {
      return true
    }
    // Check if server is unreachable
    if (error.message?.includes('Network request failed') || error.message?.includes('ERR_CONNECTION')) {
      return true
    }
    return false
  }

  // Helper function to get appropriate error message
  const getErrorMessage = (error: any): string => {
    if (isNetworkError(error)) {
      if (error.message?.includes('timeout') || error.message?.includes('timed out')) {
        return "La solicitud ha excedido el tiempo de espera. Por favor, intenta de nuevo."
      }
      if (error.message === 'Failed to fetch' || error.message?.includes('ERR_CONNECTION')) {
        return "No se puede conectar con el servidor. Por favor, verifica tu conexión e intenta más tarde."
      }
      return "Error de red. Por favor, verifica tu conexión."
    }
    return error.message || "Error al cargar datos del tablero"
  }

  // Fetch initial data on mount
  const loadData = async () => {
    if (!projectId) return

    setIsLoading(true)
    setHasError(false)
    setErrorMessage("")

    try {
      // Fetch tasks and members in parallel
      const [tasksData, membersResponse] = await Promise.all([
        fetchTasks(projectId),
        listMembers()
      ])

      // Update Zustand store with fetched data
      setTasks(tasksData)
      
      if (membersResponse.success && membersResponse.members) {
        setMembers(membersResponse.members)
        // Update users in store for assignee display
        const usersData = membersResponse.members.map(m => m.user)
        setUsers(usersData)
      } else {
        const errorMsg = membersResponse.error || "Error al cargar miembros"
        setErrorMessage(errorMsg)
        setHasError(true)
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive"
        })
      }
    } catch (error: any) {
      console.error("Error loading board data:", error)
      const errorMsg = getErrorMessage(error)
      setErrorMessage(errorMsg)
      setHasError(true)
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [projectId, setTasks, setUsers])

  const projectTasks = tasks.filter((t) => t.project_id === projectId)

  // Handle drag and drop with optimistic updates and rollback
  async function handleDrop(taskId: string, newStatus: TaskStatus) {
    // Find the task being moved
    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    // Store previous state for potential rollback
    const previousStatus = task.status
    const previousUpdatedAt = task.updated_at

    // Apply optimistic update immediately
    updateTask(taskId, { status: newStatus, updated_at: new Date().toISOString() })

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
      updateTask(taskId, { 
        status: previousStatus, 
        updated_at: previousUpdatedAt 
      })

      // Handle 403 permission errors specifically
      if (error.response?.status === 403) {
        toast({
          title: "Permiso denegado",
          description: "Solo puedes cambiar el estado de tareas asignadas a ti",
          variant: "destructive",
          duration: 5000
        })
      } else if (isNetworkError(error)) {
        // Handle network errors
        toast({
          title: "Error de red",
          description: getErrorMessage(error),
          variant: "destructive",
          duration: 5000
        })
      } else {
        // Handle other errors
        const errorMsg = error.response?.data?.error?.message || error.message || "Error al actualizar el estado de la tarea"
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive",
          duration: 5000
        })
      }
    }
  }

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="flex flex-col gap-2">
      {[1, 2, 3].map((i) => (
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
    <div className="col-span-full flex flex-col items-center justify-center py-12 px-4">
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
        <h1 className="text-2xl font-bold tracking-tight">Board</h1>
        <p className="text-muted-foreground">Arrastra las tareas entre columnas para cambiar su estado</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {hasError ? (
          <EmptyStateWithRetry />
        ) : (
          COLUMNS.map((status) => {
            const columnTasks = projectTasks.filter((t) => t.status === status)
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
                  <Badge variant="secondary" className="text-xs">
                    {isLoading ? "-" : columnTasks.length}
                  </Badge>
                </div>
                
                {isLoading ? (
                  <LoadingSkeleton />
                ) : (
                  <div className="flex flex-col gap-2">
                    {columnTasks.map((t) => {
                      const assignee = users.find((u) => u.id === t.assigned_to)
                      return (
                        <Card
                          key={t.id}
                          draggable
                          onDragStart={(e) => e.dataTransfer.setData("taskId", t.id)}
                          className="cursor-grab active:cursor-grabbing"
                        >
                          <CardContent className="p-3">
                            <Link href={`/app/tasks/${t.id}`} className="text-sm font-medium hover:underline">
                              {t.title}
                            </Link>
                            <div className="mt-2 flex flex-wrap items-center gap-1">
                              <Badge variant="outline" className={`text-[10px] ${TASK_PRIORITY_COLORS[t.priority]}`}>
                                {TASK_PRIORITY_LABELS[t.priority]}
                              </Badge>
                              {t.assigned_to && (
                                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[8px] font-bold text-primary-foreground">
                                    {assignee ? assignee.name.charAt(0) : '?'}
                                  </span>
                                  {assignee ? assignee.name.split(" ")[0] : 'Sin asignar'}
                                </span>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
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
