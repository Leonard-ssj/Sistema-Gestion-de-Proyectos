import { api } from '@/lib/api'
import { mapTaskFromBackend, mapTaskStatusToBackend, mapTaskToBackend } from '@/lib/mappers'
import type { BackendTask, TaskStatsResponse } from '@/lib/api-types'
import type { Task, TaskStatus, ChecklistItem } from '@/mock/types'

// ============================================
// FETCH TASKS (Listar todas las tareas del proyecto)
// ============================================

export async function fetchTasks(projectId?: string): Promise<Task[]> {
  try {
    const response = await api.get<{ tasks: BackendTask[]; total: number }>('/tasks')
    return response.tasks.map(mapTaskFromBackend)
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return []
  }
}

// ============================================
// FETCH MY TASKS (Mis tareas asignadas)
// ============================================

export async function fetchMyTasks(): Promise<Task[]> {
  try {
    const response = await api.get<BackendTask[]>('/tasks/my-tasks')
    return response.map(mapTaskFromBackend)
  } catch (error) {
    console.error('Error fetching my tasks:', error)
    return []
  }
}

// ============================================
// GET TASK (Obtener una tarea específica)
// ============================================

export async function getTask(taskId: string): Promise<Task | null> {
  try {
    const response = await api.get<{ task: BackendTask }>(`/tasks/${taskId}`)
    return mapTaskFromBackend(response.task)
  } catch (error) {
    console.error('Error getting task:', error)
    return null
  }
}

// ============================================
// CREATE TASK
// ============================================

export async function createTask(data: {
  title: string
  description: string
  priority: string
  due_date?: string
  assigned_to?: string
  tags?: string[]
  checklist?: ChecklistItem[]
}): Promise<Task> {
  const response = await api.post<{ task: BackendTask }>('/tasks', data)
  return mapTaskFromBackend(response.task)
}

// ============================================
// UPDATE TASK
// ============================================

export async function updateTask(
  taskId: string, 
  data: Partial<Task>
): Promise<Task> {
  // Convertir datos al formato backend
  const backendData = mapTaskToBackend(data)
  
  const response = await api.patch<{ task: BackendTask }>(`/tasks/${taskId}`, backendData)
  return mapTaskFromBackend(response.task)
}

// ============================================
// DELETE TASK
// ============================================

export async function deleteTaskService(taskId: string): Promise<boolean> {
  try {
    await api.delete(`/tasks/${taskId}`)
    return true
  } catch (error) {
    console.error('Error deleting task:', error)
    return false
  }
}

// ============================================
// ASSIGN TASK
// ============================================

export async function assignTask(
  taskId: string, 
  userId: string
): Promise<Task> {
  const response = await api.patch<{ task: BackendTask }>(`/tasks/${taskId}/assign`, {
    assigned_to: userId
  })
  return mapTaskFromBackend(response.task)
}

// ============================================
// UPDATE TASK STATUS
// ============================================

export async function updateTaskStatus(
  taskId: string, 
  status: TaskStatus
): Promise<{ taskId: string; status: TaskStatus }> {
  try {
    // Convertir estado al formato backend
    const backendStatus = mapTaskStatusToBackend(status)
    
    const response = await api.patch<{ task: BackendTask }>(`/tasks/${taskId}/status`, {
      status: backendStatus
    })
    
    const updatedTask = mapTaskFromBackend(response.task)
    
    return {
      taskId: updatedTask.id,
      status: updatedTask.status
    }
  } catch (error) {
    console.error('Error updating task status:', error)
    throw error
  }
}

// ============================================
// GET TASK STATS
// ============================================

export async function getTaskStats(): Promise<TaskStatsResponse | null> {
  try {
    const response = await api.get<{ stats: TaskStatsResponse }>('/tasks/stats')
    return response.stats
  } catch (error) {
    console.error('Error getting task stats:', error)
    return null
  }
}

// ============================================
// EXPORT TASKS CSV (función local, no usa backend)
// ============================================

export async function exportTasksCSV(tasks: Task[]): Promise<string> {
  // Esta función genera el CSV localmente
  const headers = "ID,Titulo,Estado,Prioridad,Asignado,Fecha Limite\n"
  const rows = tasks.map((t) => 
    `${t.id},"${t.title}",${t.status},${t.priority},${t.assigned_to || "Sin asignar"},${t.due_date || "Sin fecha"}`
  ).join("\n")
  return headers + rows
}
