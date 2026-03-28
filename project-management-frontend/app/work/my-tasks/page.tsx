"use client"

import { useState, useEffect } from "react"
import { useAuthStore } from "@/stores/authStore"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"
import Link from "next/link"
import { TASK_STATUS_LABELS, TASK_STATUS_COLORS, TASK_PRIORITY_LABELS, TASK_PRIORITY_COLORS } from "@/lib/constants"
import { fetchMyTasks, updateTaskStatus } from "@/services/taskService"
import { toast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import type { Task, TaskStatus } from "@/mock/types"

export default function MyTasksPage() {
  const session = useAuthStore((s) => s.session)
  const currentUserId = session?.user?.id

  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>("")

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const loadData = async () => {
    setIsLoading(true)
    setHasError(false)
    setErrorMessage("")

    try {
      const tasksData = await fetchMyTasks()
      const assignedTasks = currentUserId 
        ? tasksData.filter((t: Task) => t.assigned_to === currentUserId) 
        : tasksData
      setTasks(assignedTasks)
    } catch (error: any) {
      console.error("Error loading my tasks data:", error)
      setErrorMessage(error.message || "Error al cargar las tareas asignadas")
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

  async function handleStatusChange(taskId: string, newStatus: TaskStatus) {
    const taskIndex = tasks.findIndex(t => t.id === taskId)
    if (taskIndex === -1) return
    
    const task = tasks[taskIndex]
    if (task.status === newStatus) return

    const previousStatus = task.status
    const updatedTasks = [...tasks]
    updatedTasks[taskIndex] = { ...task, status: newStatus, updated_at: new Date().toISOString() }
    setTasks(updatedTasks)

    try {
      await updateTaskStatus(taskId, newStatus)
      toast({
        title: "Estado actualizado",
        description: `La tarea pasó a ${TASK_STATUS_LABELS[newStatus]}`,
        duration: 3000
      })
    } catch (error: any) {
      const rollbackTasks = [...updatedTasks]
      rollbackTasks[taskIndex] = { ...task, status: previousStatus }
      setTasks(rollbackTasks)
      
      const errorMsg = error.response?.data?.error?.message || error.message || "Error al cambiar estado"
      toast({
        title: "Error cambiando estado",
        description: errorMsg,
        variant: "destructive",
        duration: 5000
      })
    }
  }

  // Filter tasks in frontend (0-120 chars restriction in search logic if needed, here we just filter)
  const filtered = tasks.filter((t) => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false
    if (statusFilter !== "all" && t.status !== statusFilter) return false
    return true
  })

  const LoadingSkeleton = () => (
    <div className="flex flex-col gap-3">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex-1 min-w-0">
              <Skeleton className="h-5 w-3/4 mb-2" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <Skeleton className="h-10 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const EmptyStateWithRetry = () => (
    <div className="flex flex-col items-center justify-center py-12 px-4 border rounded-xl bg-muted/10">
      <div className="text-center space-y-4 max-w-md">
        <div className="text-4xl mb-2">⚠️</div>
        <h3 className="text-lg font-semibold">Error de conexión</h3>
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
        <h1 className="text-2xl font-bold tracking-tight">Mis Tareas</h1>
        <p className="text-muted-foreground">{isLoading ? "Cargando..." : `${filtered.length} tareas asignadas`}</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Buscar tareas..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            maxLength={120}
            className="pl-9" 
            disabled={isLoading || hasError}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter} disabled={isLoading || hasError}>
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
        {hasError ? (
          <EmptyStateWithRetry />
        ) : isLoading ? (
          <LoadingSkeleton />
        ) : filtered.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">No tienes tareas asignadas que coincidan con la búsqueda.</CardContent></Card>
        ) : (
          filtered.map((t) => (
            <Card key={t.id} className="transition-shadow hover:shadow-md">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex-1 min-w-0">
                  <Link href={`/work/my-tasks/${t.id}`} className="text-sm font-medium hover:underline block truncate">
                    {t.title}
                  </Link>
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
                <Select value={t.status} onValueChange={(v) => handleStatusChange(t.id, v as TaskStatus)}>
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

