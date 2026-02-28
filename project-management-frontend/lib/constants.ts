// Frontend roles (lowercase para UI)
export const ROLES = {
  OWNER: "owner" as const,
  EMPLOYEE: "employee" as const,
  SUPERADMIN: "superadmin" as const,
}

// Backend roles (uppercase para API)
export const BACKEND_ROLES = {
  OWNER: "OWNER" as const,
  EMPLOYEE: "EMPLOYEE" as const,
  SUPERADMIN: "SUPERADMIN" as const,
}

// Frontend task statuses (para UI)
export const TASK_STATUSES = {
  PENDING: "pending" as const,
  IN_PROGRESS: "in_progress" as const,
  BLOCKED: "blocked" as const,
  DONE: "done" as const,
}

// Backend task statuses (para API)
export const BACKEND_TASK_STATUSES = {
  PENDING: "pending" as const,
  IN_PROGRESS: "in_progress" as const,
  COMPLETED: "completed" as const,
  CANCELLED: "cancelled" as const,
}

export const TASK_STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  in_progress: "En Progreso",
  blocked: "Bloqueada",
  done: "Hecha",
}

export const TASK_STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  blocked: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  done: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
}

export const PRIORITY_LABELS: Record<string, string> = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
  urgent: "Urgente",
}

export const TASK_PRIORITY_LABELS: Record<string, string> = PRIORITY_LABELS

export const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  medium: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  urgent: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
}

export const TASK_PRIORITY_COLORS: Record<string, string> = PRIORITY_COLORS

export const INVITE_STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  accepted: "Aceptada",
  expired: "Expirada",
}

export const MAX_EMPLOYEES_PER_PROJECT = 10

export const MOCK_DELAY = 400

export const CATEGORIES = [
  "Marketing",
  "Operaciones",
  "Academia",
  "Finanzas",
  "Tecnologia",
  "Recursos Humanos",
  "Ventas",
  "Legal",
]
