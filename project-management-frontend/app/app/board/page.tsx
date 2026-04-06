"use client"

import { useEffect, useMemo, useState } from "react"
import { useAuthStore } from "@/stores/authStore"
import { useDataStore } from "@/stores/dataStore"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { TASK_STATUS_LABELS, TASK_PRIORITY_COLORS, TASK_PRIORITY_LABELS } from "@/lib/constants"
import type { TaskStatus, Task, Membership, User } from "@/mock/types"
import Link from "next/link"
import { fetchTasks, updateTaskStatus } from "@/services/taskService"
import { listMembers } from "@/services/memberService"
import { toast } from "@/hooks/use-toast"
import { getProjectSettingsService } from "@/services/projectService"
import { listSprints } from "@/services/sprintService"
import type { Sprint } from "@/mock/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { normalizeAvatarUrl } from "@/lib/avatars"
import { SPRINT_COLOR_CLASS } from "@/lib/sprintColors"
import { cn } from "@/lib/utils"

const COLUMNS: TaskStatus[] = ["pending", "in_progress", "in_review", "blocked", "done"]

export default function BoardPage() {
  const session = useAuthStore((s) => s.session)
  const setProject = useAuthStore((s) => s.setProject)
  const tasks = useDataStore((s) => s.tasks)
  const setTasks = useDataStore((s) => s.setTasks)
  const users = useDataStore((s) => s.users)
  const setUsers = useDataStore((s) => s.setUsers)
  const updateTask = useDataStore((s) => s.updateTask)

  const [isLoading, setIsLoading] = useState(true)
  const [members, setMembers] = useState<Membership[]>([])
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [sprintFilter, setSprintFilter] = useState<string>("all")

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
      const settingsResult = await getProjectSettingsService()
      if (settingsResult.success && settingsResult.project) {
        setProject(settingsResult.project as any)
      }

      const sprintEnabled = !!(settingsResult.success ? settingsResult.project?.sprint_enabled : session?.project?.sprint_enabled)

      if (sprintEnabled) {
        const sprintsResult = await listSprints()
        if (sprintsResult.success && sprintsResult.sprints) {
          setSprints(sprintsResult.sprints)
          if (sprintFilter === "all") {
            const active = sprintsResult.sprints.find((s) => s.status === "active")
            if (active) setSprintFilter(active.id)
          }
        }
      } else {
        setSprints([])
        setSprintFilter("all")
      }

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
        const usersData = membersResponse.members
          .map((m) => m.user)
          .filter((u): u is User => !!u)
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

  const sprintEnabled = !!session?.project?.sprint_enabled
  const projectTasks = tasks
    .filter((t) => t.project_id === projectId)
    .filter((t) => {
      if (!sprintEnabled) return true
      if (sprintFilter === "all") return true
      if (sprintFilter === "backlog") return !t.sprint_id
      return t.sprint_id === sprintFilter
    })

  const sprintNameById = useMemo(() => {
    const map = new Map<string, string>()
    for (const s of sprints) map.set(s.id, s.name)
    return map
  }, [sprints])

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
    <div className="flex flex-col gap-[24px] relative z-[1]">
      <div className="flex flex-wrap items-center justify-between gap-[16px]">
        <div>
          <h1 className="text-[36px] font-[600] mb-[10px] text-admin-dark">Board</h1>
          <ul className="flex items-center gap-[16px]">
            <li><Link href="/app/dashboard" className="text-admin-dark-grey hover:opacity-80 transition-opacity">Dashboard</Link></li>
            <li><span className="text-admin-dark-grey">{'>'}</span></li>
            <li><span className="text-admin-blue font-medium">Board</span></li>
          </ul>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {sprintEnabled ? (
            <div className="max-w-sm">
              <Select value={sprintFilter} onValueChange={setSprintFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por sprint" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="backlog">Backlog (sin sprint)</SelectItem>
                  {sprints.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} ({s.status})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}
        </div>
      </div>

      <p className="text-admin-dark-grey mb-4 font-medium">Arrastra las tareas entre columnas para cambiar su estado.</p>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-5">
        {hasError ? (
          <EmptyStateWithRetry />
        ) : (
          COLUMNS.map((status) => {
            const columnTasks = projectTasks.filter((t) => t.status === status)
            return (
              <div
                key={status}
                className={cn(
                  "min-w-0 flex flex-col rounded-xl border border-white/40 bg-white/20 backdrop-blur-md shadow-sm p-3 transition-colors hover:bg-white/30",
                  status === "pending" && "border-t-4 border-t-admin-dark-grey/40",
                  status === "in_progress" && "border-t-4 border-t-admin-blue",
                  status === "in_review" && "border-t-4 border-t-admin-yellow",
                  status === "blocked" && "border-t-4 border-t-admin-red",
                  status === "done" && "border-t-4 border-t-admin-green"
                )}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  const taskId = e.dataTransfer.getData("taskId")
                  if (taskId) handleDrop(taskId, status)
                }}
              >
                <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-2">
                  <h3 className="text-[12px] font-bold text-admin-dark/80 tracking-wide uppercase">{TASK_STATUS_LABELS[status]}</h3>
                  <Badge variant="secondary" className="text-[10px]">
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
                          className="cursor-grab active:cursor-grabbing bg-admin-blue border-none shadow-md transition-transform hover:scale-[1.02] relative group overflow-hidden"
                        >
                          <div className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="h-1.5 w-1.5 rounded-full bg-white/50" />
                          </div>
                          <CardContent className="p-3">
                            <Link href={`/app/tasks/${t.id}`} className="block truncate text-[12px] font-semibold text-white hover:underline mb-2">
                              {t.title}
                            </Link>
                            <div className="mt-2 flex flex-wrap items-center gap-1.5">
                              <Badge variant="outline" className={cn("text-[10px] bg-white/10 border-white/20 text-white", TASK_PRIORITY_COLORS[t.priority])}>
                                {TASK_PRIORITY_LABELS[t.priority]}
                              </Badge>
                              {sprintEnabled && t.sprint_id ? (
                                <Badge variant="secondary" className="max-w-[120px] truncate text-[9px] bg-white/20 text-white border-none">
                                  {sprintNameById.get(t.sprint_id) || "Sprint"}
                                </Badge>
                              ) : null}
                              {t.assigned_to && (
                                <span className="flex items-center gap-1.5 text-[10px] text-white/80 mt-1">
                                  <img alt="" src={normalizeAvatarUrl(assignee?.avatar)} className="h-4 w-4 rounded-full border border-white/30 bg-white/10" />
                                  <span className="truncate">{assignee ? assignee.name.split(" ")[0] : "Sin asignar"}</span>
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
