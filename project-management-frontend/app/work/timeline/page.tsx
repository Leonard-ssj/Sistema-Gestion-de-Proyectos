"use client"

import { useEffect, useState, useMemo } from "react"
import { useAuthStore } from "@/stores/authStore"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { TASK_STATUS_LABELS, TASK_STATUS_COLORS, TASK_PRIORITY_LABELS, TASK_PRIORITY_COLORS } from "@/lib/constants"
import type { Task } from "@/mock/types"
import Link from "next/link"
import { fetchMyTasks } from "@/services/taskService"

export default function WorkTimelinePage() {
  const session = useAuthStore((s) => s.session)
  const currentUserId = session?.user?.id

  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>("")

  // Fetch data on mount
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
      console.error("Error loading employee timeline data:", error)
      setErrorMessage(error.message || "Error al cargar datos del cronograma")
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

  // Filter tasks with start_date and sort them chronologically
  const scheduledTasks = useMemo(() => {
    return tasks
      .filter((t) => !!t.start_date)
      .sort((a, b) => new Date(a.start_date!).getTime() - new Date(b.start_date!).getTime())
  }, [tasks])

  // Group scheduled tasks by Month-Year
  const months = useMemo(() => {
    return Array.from(new Set(scheduledTasks.map((t) => {
      const d = new Date(t.start_date!)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    }))).sort()
  }, [scheduledTasks])

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="relative flex flex-col gap-6">
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
      {[1, 2].map((month) => (
        <div key={month}>
          <div className="relative mb-3 flex items-center gap-3 pl-8">
            <div className="absolute left-2.5 h-3 w-3 rounded-full border-2 border-primary bg-background" />
            <Skeleton className="h-5 w-32" />
          </div>
          <div className="flex flex-col gap-2 pl-10">
            {[1, 2].map((card) => (
              <Card key={`${month}-${card}`}>
                <CardContent className="flex items-center gap-4 p-3">
                  <div className="flex-1 min-w-0">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-20" />
                    </div>
                  </div>
                  <div className="shrink-0 flex flex-col gap-1 items-end">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  )

  // Empty state with retry button for server errors
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
        <h1 className="text-2xl font-bold tracking-tight">Mi Timeline</h1>
        <p className="text-muted-foreground">Cronologia de tus tareas asignadas que ya tienen una fecha de inicio</p>
      </div>

      {hasError ? (
        <EmptyStateWithRetry />
      ) : isLoading ? (
        <LoadingSkeleton />
      ) : months.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No tienes tareas asignadas con una fecha de inicio fijada.</CardContent></Card>
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
                  {monthTasks.map((t) => (
                    <Card key={t.id}>
                      <CardContent className="flex items-center gap-4 p-3 hover:bg-muted/10 transition-colors">
                        <div className="flex-1 min-w-0">
                          <Link href={`/work/my-tasks/${t.id}`} className="text-sm font-medium hover:underline truncate block">
                            {t.title}
                          </Link>
                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className={`text-[10px] ${TASK_STATUS_COLORS[t.status]}`}>
                              {TASK_STATUS_LABELS[t.status]}
                            </Badge>
                            <Badge variant="outline" className={`text-[10px] ${TASK_PRIORITY_COLORS[t.priority]}`}>
                              {TASK_PRIORITY_LABELS[t.priority]}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right text-xs text-muted-foreground shrink-0 flex flex-col justify-center">
                          <div className="font-medium text-foreground">
                            {new Date(t.start_date!).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                          </div>
                          {t.due_date && (
                            <div className="opacity-70">
                              - {new Date(t.due_date).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
