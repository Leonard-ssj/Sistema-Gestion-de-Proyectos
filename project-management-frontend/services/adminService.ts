import { api } from '@/lib/api'
import { mapUserFromBackend, mapProjectFromBackend } from '@/lib/mappers'
import type { 
  UsersListResponse, 
  ProjectsListResponse, 
  AuditLogsResponse,
  GlobalStatsResponse,
  HealthCheckResponse,
  BackendAuditLog
} from '@/lib/api-types'
import type { User, Project, AuditLog, HealthCheck } from '@/mock/types'

// ============================================
// TIPOS DE PAGINACIÓN
// ============================================

export interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  per_page: number
  total_pages: number
  has_next: boolean
  has_prev: boolean
}

// ============================================
// MAPEO DE AUDIT LOG
// ============================================

function mapAuditLogFromBackend(log: BackendAuditLog): AuditLog {
  return {
    id: log.id,
    action: log.action,
    user_id: log.user_id,
    user_email: log.user_email,
    project_id: log.project_id,
    details: log.details,
    ip: log.ip,
    created_at: log.created_at,
  }
}

// ============================================
// LIST ALL USERS (Listar todos los usuarios)
// ============================================

export async function fetchAllUsers(params?: {
  page?: number
  per_page?: number
  search?: string
  status?: string
}): Promise<PaginatedResult<User>> {
  try {
    const query = new URLSearchParams()
    if (params?.page) query.append('page', params.page.toString())
    if (params?.per_page) query.append('per_page', params.per_page.toString())
    if (params?.search) query.append('search', params.search)
    if (params?.status) query.append('status', params.status)
    
    const response = await api.get<UsersListResponse>(
      `/admin/users${query.toString() ? '?' + query.toString() : ''}`
    )
    
    return {
      items: response.users.map(mapUserFromBackend),
      total: response.pagination.total,
      page: response.pagination.page,
      per_page: response.pagination.per_page,
      total_pages: response.pagination.total_pages,
      has_next: response.pagination.has_next,
      has_prev: response.pagination.has_prev,
    }
  } catch (error) {
    console.error('Error fetching all users:', error)
    return {
      items: [],
      total: 0,
      page: 1,
      per_page: 20,
      total_pages: 0,
      has_next: false,
      has_prev: false,
    }
  }
}

// ============================================
// LIST ALL PROJECTS (Listar todos los proyectos)
// ============================================

export async function fetchAllTenants(params?: {
  page?: number
  per_page?: number
  search?: string
  status?: string
}): Promise<PaginatedResult<Project>> {
  try {
    const query = new URLSearchParams()
    if (params?.page) query.append('page', params.page.toString())
    if (params?.per_page) query.append('per_page', params.per_page.toString())
    if (params?.search) query.append('search', params.search)
    if (params?.status) query.append('status', params.status)
    
    const response = await api.get<ProjectsListResponse>(
      `/admin/projects${query.toString() ? '?' + query.toString() : ''}`
    )
    
    return {
      items: response.projects.map(mapProjectFromBackend),
      total: response.pagination.total,
      page: response.pagination.page,
      per_page: response.pagination.per_page,
      total_pages: response.pagination.total_pages,
      has_next: response.pagination.has_next,
      has_prev: response.pagination.has_prev,
    }
  } catch (error) {
    console.error('Error fetching all projects:', error)
    return {
      items: [],
      total: 0,
      page: 1,
      per_page: 20,
      total_pages: 0,
      has_next: false,
      has_prev: false,
    }
  }
}

// ============================================
// GET AUDIT LOGS (Obtener logs de auditoría)
// ============================================

export async function fetchAuditLogs(params?: {
  page?: number
  per_page?: number
  user_id?: string
  action?: string
  days?: number
}): Promise<PaginatedResult<AuditLog>> {
  try {
    const query = new URLSearchParams()
    if (params?.page) query.append('page', params.page.toString())
    if (params?.per_page) query.append('per_page', params.per_page.toString())
    if (params?.user_id) query.append('user_id', params.user_id)
    if (params?.action) query.append('action', params.action)
    if (params?.days) query.append('days', params.days.toString())
    
    const response = await api.get<AuditLogsResponse>(
      `/admin/audit-logs${query.toString() ? '?' + query.toString() : ''}`
    )
    
    return {
      items: response.logs.map(mapAuditLogFromBackend),
      total: response.pagination.total,
      page: response.pagination.page,
      per_page: response.pagination.per_page,
      total_pages: response.pagination.total_pages,
      has_next: response.pagination.has_next,
      has_prev: response.pagination.has_prev,
    }
  } catch (error) {
    console.error('Error fetching audit logs:', error)
    return {
      items: [],
      total: 0,
      page: 1,
      per_page: 20,
      total_pages: 0,
      has_next: false,
      has_prev: false,
    }
  }
}

// ============================================
// UPDATE USER STATUS (Activar/Desactivar usuario)
// ============================================

export async function toggleUserStatus(
  userId: string,
  status: 'active' | 'disabled'
): Promise<boolean> {
  try {
    await api.patch(`/admin/users/${userId}/status`, { status })
    return true
  } catch (error) {
    console.error('Error updating user status:', error)
    return false
  }
}

// ============================================
// UPDATE PROJECT STATUS (Activar/Desactivar proyecto)
// ============================================

export async function toggleTenantStatus(
  projectId: string,
  status: 'active' | 'disabled'
): Promise<boolean> {
  try {
    await api.patch(`/admin/projects/${projectId}/status`, { status })
    return true
  } catch (error) {
    console.error('Error updating project status:', error)
    return false
  }
}

// ============================================
// GET GLOBAL STATS (Obtener estadísticas globales)
// ============================================

export async function getGlobalStats(): Promise<GlobalStatsResponse | null> {
  try {
    const response = await api.get<GlobalStatsResponse>('/admin/stats')
    return response
  } catch (error) {
    console.error('Error getting global stats:', error)
    return null
  }
}

// ============================================
// HEALTH CHECK (Verificar salud del sistema)
// ============================================

export async function fetchHealthChecks(): Promise<HealthCheck[]> {
  try {
    const response = await api.get<HealthCheckResponse>('/admin/health')
    
    // Convertir la respuesta del backend al formato esperado por el frontend
    return [
      {
        service: 'API',
        status: response.status,
        latency: 0,
        last_check: response.timestamp,
      },
      {
        service: 'Database',
        status: response.database.status,
        latency: response.database.latency,
        last_check: response.timestamp,
      }
    ]
  } catch (error) {
    console.error('Error fetching health checks:', error)
    return [
      {
        service: 'API',
        status: 'down',
        latency: 0,
        last_check: new Date().toISOString(),
      },
      {
        service: 'Database',
        status: 'down',
        latency: 0,
        last_check: new Date().toISOString(),
      }
    ]
  }
}

// ============================================
// HELPERS
// ============================================

/**
 * Obtener usuarios activos
 */
export async function getActiveUsers(page = 1, per_page = 20): Promise<PaginatedResult<User>> {
  return fetchAllUsers({ page, per_page, status: 'active' })
}

/**
 * Obtener usuarios desactivados
 */
export async function getDisabledUsers(page = 1, per_page = 20): Promise<PaginatedResult<User>> {
  return fetchAllUsers({ page, per_page, status: 'disabled' })
}

/**
 * Obtener proyectos activos
 */
export async function getActiveProjects(page = 1, per_page = 20): Promise<PaginatedResult<Project>> {
  return fetchAllTenants({ page, per_page, status: 'active' })
}

/**
 * Obtener proyectos desactivados
 */
export async function getDisabledProjects(page = 1, per_page = 20): Promise<PaginatedResult<Project>> {
  return fetchAllTenants({ page, per_page, status: 'disabled' })
}
