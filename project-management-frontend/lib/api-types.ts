// ============================================
// TIPOS GENERICOS DE RESPUESTA
// ============================================

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: ApiError
}

export interface ApiError {
  code: string
  message: string
}

// ============================================
// TIPOS DE AUTENTICACION
// ============================================

export interface LoginResponse {
  user: BackendUser
  access_token: string
  refresh_token: string
  expires_in: number
  redirect_url: string
  project?: BackendProject
}

export interface RegisterResponse {
  user: BackendUser
  access_token: string
  refresh_token: string
  expires_in: number
  redirect_url: string
}

export interface RefreshTokenResponse {
  access_token: string
}

export interface MeResponse {
  user: BackendUser
}

// ============================================
// TIPOS DE USUARIO
// ============================================

export type BackendRole = "OWNER" | "EMPLOYEE" | "SUPERADMIN"
export type BackendUserStatus = "active" | "disabled"

export interface BackendUser {
  id: string
  email: string
  name: string
  role: BackendRole
  avatar: string | null
  job_title?: string
  description?: string
  responsibilities?: string
  skills?: string
  shift?: BackendEmployeeShift
  department?: string
  phone?: string
  status: BackendUserStatus
  created_at: string
  updated_at?: string
  project_id?: string
  project?: BackendProject
}

// ============================================
// TIPOS DE PROYECTO
// ============================================

export type BackendProjectStatus = "active" | "disabled"

export interface BackendProject {
  id: string
  name: string
  description: string
  category: string
  owner_id: string
  status: BackendProjectStatus
  created_at: string
  updated_at: string
}

// ============================================
// TIPOS DE TAREA
// ============================================

export type BackendTaskStatus = "pending" | "in_progress" | "blocked" | "done"
export type BackendTaskPriority = "low" | "medium" | "high" | "urgent"

export interface BackendTask {
  id: string
  project_id: string
  title: string
  description: string | null
  status: BackendTaskStatus
  priority: BackendTaskPriority
  assigned_to: string | null
  created_by: string
  due_date: string | null
  start_date: string | null
  completed_at: string | null
  tags: string[] | null
  created_at: string
  updated_at: string
  // Campos adicionales del endpoint GET /tasks/<id>
  creator_name?: string
  assignee_name?: string
  comments_count?: number
}

export interface TaskStatsResponse {
  total: number
  by_status: {
    pending: number
    in_progress: number
    blocked: number
    done: number
  }
  by_priority: {
    low: number
    medium: number
    high: number
    urgent: number
  }
  overdue: number
  due_today: number
  due_this_week: number
  unassigned: number
}

// ============================================
// TIPOS DE INVITACION
// ============================================

export type BackendInviteStatus = "pending" | "accepted" | "expired" | "cancelled"
export type BackendEmployeeShift = "morning" | "afternoon" | "night" | "flexible"

export interface BackendInvite {
  id: string
  project_id: string
  email: string
  token: string
  status: BackendInviteStatus
  invited_by: string
  resend_count?: number
  job_title?: string
  description?: string
  responsibilities?: string
  skills?: string
  shift?: BackendEmployeeShift
  department?: string
  phone?: string
  created_at: string
  expires_at: string
  updated_at?: string
}

// ============================================
// TIPOS DE NOTIFICACION
// ============================================

export interface BackendNotification {
  id: string
  user_id: string
  project_id: string
  type: "task_assigned" | "comment" | "invite" | "status_change" | "mention"
  title: string
  message: string
  is_read: boolean
  created_at: string
  link?: string
}

export interface UnreadCountResponse {
  unread_count: number
}

// ============================================
// TIPOS DE COMENTARIO
// ============================================

export interface BackendComment {
  id: string
  task_id: string
  user_id: string
  user_name: string
  text?: string
  content?: string // Backend devuelve 'content' en algunos casos
  created_at: string
  updated_at?: string
}

// ============================================
// TIPOS DE MIEMBRO
// ============================================

export type BackendMembershipStatus = "active" | "inactive"

export interface BackendMembership {
  id: string
  user_id: string
  project_id: string
  role: BackendRole
  status: BackendMembershipStatus
  joined_at: string
  user?: BackendUser
}

// ============================================
// TIPOS DE ADMIN
// ============================================

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  per_page: number
  total_pages: number
  has_next: boolean
  has_prev: boolean
}

export interface UsersListResponse {
  users: BackendUser[]
  pagination: {
    total: number
    page: number
    per_page: number
    total_pages: number
    has_next: boolean
    has_prev: boolean
  }
}

export interface ProjectsListResponse {
  projects: BackendProject[]
  pagination: {
    total: number
    page: number
    per_page: number
    total_pages: number
    has_next: boolean
    has_prev: boolean
  }
}

export interface BackendAuditLog {
  id: string
  action: string
  user_id: string
  user_email: string
  project_id?: string
  details: string
  ip: string
  created_at: string
}

export interface AuditLogsResponse {
  logs: BackendAuditLog[]
  pagination: {
    total: number
    page: number
    per_page: number
    total_pages: number
    has_next: boolean
    has_prev: boolean
  }
}

export interface GlobalStatsResponse {
  users: {
    total: number
    active: number
    disabled: number
    by_role: {
      owner: number
      employee: number
      superadmin: number
    }
    new_last_30_days: number
  }
  projects: {
    total: number
    active: number
    disabled: number
    new_last_30_days: number
  }
  tasks: {
    total: number
    by_status: {
      pending: number
      in_progress: number
      completed: number
      cancelled: number
    }
    by_priority: {
      low: number
      medium: number
      high: number
      urgent: number
    }
  }
}

export interface HealthCheckResponse {
  status: "healthy" | "degraded" | "down"
  database: {
    status: "healthy" | "down"
    latency: number
  }
  timestamp: string
}
