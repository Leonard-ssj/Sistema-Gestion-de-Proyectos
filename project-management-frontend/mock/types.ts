// Frontend types (lowercase para UI)
export type Role = "owner" | "employee" | "superadmin"
export type TaskStatus = "pending" | "in_progress" | "blocked" | "done"
export type TaskPriority = "low" | "medium" | "high" | "urgent"
export type InviteStatus = "pending" | "accepted" | "expired" | "cancelled"
export type MembershipStatus = "active" | "inactive"
export type TenantStatus = "active" | "disabled"
export type UserStatus = "active" | "disabled"
export type EmployeeShift = "morning" | "afternoon" | "night" | "flexible"

// Backend types (uppercase para API)
export type BackendRole = "OWNER" | "EMPLOYEE" | "SUPERADMIN"
export type BackendTaskStatus = "pending" | "in_progress" | "completed" | "cancelled"

export interface User {
  id: string
  email: string
  password: string
  name: string
  role: Role
  avatar?: string
  job_title?: string
  description?: string
  responsibilities?: string
  skills?: string
  shift?: EmployeeShift
  department?: string
  phone?: string
  status: UserStatus
  created_at: string
}

export interface Project {
  id: string
  name: string
  description: string
  category: string
  owner_id: string
  status: TenantStatus
  created_at: string
  updated_at: string
}

export interface Membership {
  id: string
  user_id: string
  project_id: string
  role: Role
  status: MembershipStatus
  joined_at: string
  user?: User
}

export interface Task {
  id: string
  project_id: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  assigned_to: string | null
  created_by: string
  due_date: string | null
  start_date: string | null
  tags: string[]
  checklist?: ChecklistItem[]
  comments: Comment[]
  created_at: string
  updated_at: string
}

export interface ChecklistItem {
  id: string
  text: string
  completed: boolean
}

export interface Comment {
  id: string
  task_id: string
  user_id: string
  user_name: string
  text: string
  created_at: string
}

export interface Invite {
  id: string
  project_id: string
  email: string
  token: string
  status: InviteStatus
  invited_by: string
  resend_count?: number
  job_title?: string
  description?: string
  responsibilities?: string
  skills?: string
  shift?: EmployeeShift
  department?: string
  phone?: string
  created_at: string
  expires_at: string
}

export interface Notification {
  id: string
  user_id: string
  project_id: string
  type: "task_assigned" | "comment" | "invite" | "status_change" | "mention"
  title: string
  message: string
  read: boolean
  created_at: string
  link?: string
}

export interface AuditLog {
  id: string
  action: string
  user_id: string
  user_email: string
  project_id?: string
  details: string
  ip: string
  created_at: string
}

export interface HealthCheck {
  service: string
  status: "healthy" | "degraded" | "down"
  latency: number
  last_check: string
}

export interface AuthSession {
  user: User
  access_token: string
  refresh_token: string
  project?: Project
  membership?: Membership
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
  }
}

export interface AuthResponse {
  user: User
  access_token: string
  refresh_token: string
  expires_in: number
  redirect_url: string
  project?: Project
}
