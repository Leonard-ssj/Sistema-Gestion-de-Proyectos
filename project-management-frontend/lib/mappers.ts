import type { Role, TaskStatus, User, Task, Project } from "@/mock/types"

// ============================================
// MAPEO DE ROLES
// ============================================

/**
 * Convierte rol del backend (uppercase) a formato frontend (lowercase)
 * Backend: "OWNER", "EMPLOYEE", "SUPERADMIN"
 * Frontend: "owner", "employee", "superadmin"
 */
export function mapRoleFromBackend(role: string): Role {
  return role.toLowerCase() as Role
}

/**
 * Convierte rol del frontend (lowercase) a formato backend (uppercase)
 * Frontend: "owner", "employee", "superadmin"
 * Backend: "OWNER", "EMPLOYEE", "SUPERADMIN"
 */
export function mapRoleToBackend(role: Role): string {
  return role.toUpperCase()
}

// ============================================
// MAPEO DE ESTADOS DE TAREA
// ============================================

/**
 * Convierte estado de tarea del backend a formato frontend
 * Backend y Frontend usan los mismos valores: pending, in_progress, blocked, done
 */
export function mapTaskStatusFromBackend(status: string): TaskStatus {
  return status as TaskStatus
}

/**
 * Convierte estado de tarea del frontend a formato backend
 * Backend y Frontend usan los mismos valores: pending, in_progress, blocked, done
 */
export function mapTaskStatusToBackend(status: TaskStatus): string {
  return status
}

// ============================================
// MAPEO DE OBJETOS COMPLETOS
// ============================================

/**
 * Mapea usuario del backend a formato frontend
 */
export function mapUserFromBackend(user: any): User {
  return {
    id: user.id,
    email: user.email,
    password: '', // No exponemos password en frontend
    name: user.name,
    role: mapRoleFromBackend(user.role),
    avatar: user.avatar || '',
    status: user.status,
    created_at: user.created_at,
  }
}

/**
 * Mapea tarea del backend a formato frontend
 */
export function mapTaskFromBackend(task: any): Task {
  return {
    id: task.id,
    project_id: task.project_id,
    title: task.title,
    description: task.description || "",
    status: mapTaskStatusFromBackend(task.status),
    priority: task.priority,
    assigned_to: task.assigned_to,
    created_by: task.created_by,
    due_date: task.due_date,
    start_date: task.start_date || null,
    tags: task.tags || [],
    checklist: task.checklist || [],
    comments: [], // Se cargan por separado
    created_at: task.created_at,
    updated_at: task.updated_at,
  }
}

/**
 * Mapea proyecto del backend a formato frontend
 */
export function mapProjectFromBackend(project: any): Project {
  return {
    id: project.id,
    name: project.name,
    description: project.description,
    category: project.category,
    owner_id: project.owner_id,
    status: project.status,
    created_at: project.created_at,
    updated_at: project.updated_at,
  }
}

/**
 * Mapea tarea del frontend a formato backend para envío
 */
export function mapTaskToBackend(task: Partial<Task>): any {
  const backendTask: any = {}
  
  if (task.title !== undefined) backendTask.title = task.title
  if (task.description !== undefined) backendTask.description = task.description
  if (task.status !== undefined) backendTask.status = mapTaskStatusToBackend(task.status)
  if (task.priority !== undefined) backendTask.priority = task.priority
  if (task.assigned_to !== undefined) backendTask.assigned_to = task.assigned_to
  if (task.due_date !== undefined) backendTask.due_date = task.due_date
  if (task.tags !== undefined) backendTask.tags = task.tags
  if (task.checklist !== undefined) backendTask.checklist = task.checklist || []
  
  return backendTask
}
