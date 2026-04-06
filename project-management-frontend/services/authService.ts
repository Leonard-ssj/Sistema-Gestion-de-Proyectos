import { api } from '@/lib/api'
import { mapUserFromBackend, mapRoleToBackend } from '@/lib/mappers'
import type { LoginResponse, RegisterResponse, MeResponse } from '@/lib/api-types'
import type { User, AuthSession } from '@/mock/types'

// ============================================
// LOGIN
// ============================================

export async function loginService(
  email: string, 
  password: string
): Promise<{ success: boolean; session?: AuthSession; error?: string }> {
  try {
    const response = await api.post<LoginResponse>('/auth/login', {
      email,
      password
    })
    
    // Guardar tokens en localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', response.access_token)
      localStorage.setItem('refresh_token', response.refresh_token)
    }
    
    // Mapear usuario del backend al formato frontend
    const user = mapUserFromBackend(response.user)
    
    // Mapear proyecto si existe (viene del backend)
    const project = response.project ? {
      id: response.project.id,
      name: response.project.name,
      description: response.project.description,
      category: response.project.category,
      timezone: (response.project as any).timezone,
      date_format: (response.project as any).date_format,
      state: (response.project as any).state ?? null,
      tasks_retention_days: (response.project as any).tasks_retention_days,
      sprint_enabled: (response.project as any).sprint_enabled,
      sprint_length_days: (response.project as any).sprint_length_days,
      owner_id: response.project.owner_id,
      status: response.project.status,
      created_at: response.project.created_at,
      updated_at: response.project.updated_at,
    } : undefined
    
    // Crear sesión completa
    const session: AuthSession = {
      user,
      access_token: response.access_token,
      refresh_token: response.refresh_token,
      project,
    }
    
    // Si hay proyecto, crear membership automáticamente para OWNER
    if (project && user.role === 'owner') {
      session.membership = {
        id: `mem-${project.id}`,
        user_id: user.id,
        project_id: project.id.toString(),
        role: 'owner',
        status: 'active',
        joined_at: new Date().toISOString(),
      }
    }
    
    // Si hay proyecto, crear membership automáticamente para EMPLOYEE
    if (project && user.role === 'employee') {
      session.membership = {
        id: `mem-${project.id}`,
        user_id: user.id,
        project_id: project.id.toString(),
        role: 'employee',
        status: 'active',
        joined_at: new Date().toISOString(),
      }
    }
    
    return {
      success: true,
      session
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Error al iniciar sesión'
    }
  }
}

// ============================================
// REGISTER
// ============================================

export async function registerService(data: {
  name: string
  email: string
  password: string
  role?: string
}): Promise<{ success: boolean; user?: User; session?: AuthSession; error?: string; fieldErrors?: Record<string, string> }> {
  try {
    // Convertir rol a formato backend si se proporciona
    const roleToSend = data.role ? mapRoleToBackend(data.role as any) : 'OWNER'
    
    const response = await api.post<RegisterResponse>('/auth/register', {
      name: data.name,
      email: data.email,
      password: data.password,
      role: roleToSend
    })
    
    // Guardar tokens en localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', response.access_token)
      localStorage.setItem('refresh_token', response.refresh_token)
    }
    
    // Mapear usuario del backend al formato frontend
    const user = mapUserFromBackend(response.user)
    
    return {
      success: true,
      user,
      session: {
        user,
        access_token: response.access_token,
        refresh_token: response.refresh_token,
      }
    }
  } catch (error: any) {
    const responseData = error?.response?.data
    const backendError = responseData?.error
    const details = backendError?.details
    const errorMessage = backendError?.message || error.message || 'Error al registrar usuario'
    
    if (details && typeof details === 'object' && !Array.isArray(details)) {
      const fieldErrors: Record<string, string> = {}
      for (const [key, value] of Object.entries(details)) {
        if (Array.isArray(value) && typeof value[0] === 'string') {
          fieldErrors[key] = value[0]
        } else if (typeof value === 'string') {
          fieldErrors[key] = value
        }
      }
      return {
        success: false,
        error: errorMessage,
        fieldErrors
      }
    }
    
    return {
      success: false,
      error: errorMessage
    }
  }
}

// ============================================
// GET ME (Obtener usuario actual)
// ============================================

export async function getMeService(): Promise<User | null> {
  try {
    const response = await api.get<MeResponse>('/auth/me')
    return mapUserFromBackend(response.user)
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

export async function updateMeService(data: { name?: string; avatar?: string; preferred_theme?: string }): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const response = await api.patch<{ user: any }>('/auth/me', data)
    return { success: true, user: mapUserFromBackend(response.user) }
  } catch (error: any) {
    const responseData = error?.response?.data
    const backendError = responseData?.error
    return {
      success: false,
      error: backendError?.message || error.message || 'Error al actualizar perfil'
    }
  }
}

// ============================================
// REFRESH TOKEN
// ============================================

export async function refreshTokenService(): Promise<string | null> {
  try {
    if (typeof window === 'undefined') return null
    
    const refreshToken = localStorage.getItem('refresh_token')
    if (!refreshToken) return null
    
    const response = await api.post<{ access_token: string }>('/auth/refresh', {})
    
    if (response.access_token) {
      localStorage.setItem('access_token', response.access_token)
      return response.access_token
    }
    
    return null
  } catch (error) {
    console.error('Error refreshing token:', error)
    // Si falla el refresh, limpiar tokens
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    }
    return null
  }
}

// ============================================
// LOGOUT
// ============================================

export async function logoutService(): Promise<void> {
  try {
    await api.post('/auth/logout', {})
  } catch (error) {
    // Ignorar errores de logout en el backend
    console.error('Error during logout:', error)
  } finally {
    // Siempre limpiar tokens locales
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    }
  }
}

// ============================================
// ACCEPT INVITE
// ============================================

export async function acceptInviteService(
  token: string,
  password: string,
  name: string,
  avatar?: string
): Promise<{ success: boolean; session?: AuthSession; error?: string }> {
  try {
    const response = await api.post<LoginResponse>('/auth/accept-invite', {
      token,
      password,
      name,
      avatar
    })
    
    // Guardar tokens en localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', response.access_token)
      localStorage.setItem('refresh_token', response.refresh_token)
    }
    
    // Mapear usuario del backend al formato frontend
    const user = mapUserFromBackend(response.user)
    
    // Mapear proyecto si existe
    const project = response.project ? {
      id: response.project.id,
      name: response.project.name,
      description: response.project.description,
      category: response.project.category,
      owner_id: response.project.owner_id,
      status: response.project.status,
      created_at: response.project.created_at,
      updated_at: response.project.updated_at,
    } : undefined
    
    // Crear sesión completa
    const session: AuthSession = {
      user,
      access_token: response.access_token,
      refresh_token: response.refresh_token,
      project,
    }
    
    // Si hay proyecto, crear membership automáticamente para EMPLOYEE
    if (project && user.role === 'employee') {
      session.membership = {
        id: `mem-${project.id}`,
        user_id: user.id,
        project_id: project.id.toString(),
        role: 'employee',
        status: 'active',
        joined_at: new Date().toISOString(),
      }
    }
    
    return {
      success: true,
      session
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Error al aceptar invitación'
    }
  }
}

// ============================================
// FORGOT PASSWORD (Placeholder - no implementado en backend aún)
// ============================================

export async function forgotPasswordService(email: string): Promise<{ success: boolean; message: string }> {
  // TODO: Implementar cuando el backend tenga este endpoint
  return { 
    success: true, 
    message: "Si el email existe, se envió un enlace de recuperación." 
  }
}
