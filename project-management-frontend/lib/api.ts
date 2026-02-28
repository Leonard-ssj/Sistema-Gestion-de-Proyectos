const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
  }
}

let isRefreshing = false
let refreshSubscribers: ((token: string) => void)[] = []

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb)
}

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token))
  refreshSubscribers = []
}

async function refreshAccessToken(): Promise<string | null> {
  try {
    const refreshToken = localStorage.getItem('refresh_token')
    if (!refreshToken) return null

    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${refreshToken}`,
      },
    })

    if (!response.ok) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      return null
    }

    const data: ApiResponse<{ access_token: string }> = await response.json()
    
    if (data.success && data.data?.access_token) {
      localStorage.setItem('access_token', data.data.access_token)
      return data.data.access_token
    }

    return null
  } catch (error) {
    console.error('Error refreshing token:', error)
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    return null
  }
}

async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // 1. Obtener token
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
  
  // 2. Configurar headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  
  if (options.headers) {
    Object.entries(options.headers).forEach(([key, value]) => {
      if (value) headers[key] = String(value)
    })
  }
  
  if (token && !endpoint.includes('/auth/refresh')) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  // 3. Hacer peticion
  let response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  })
  
  // 4. Manejar 401 (token expirado) - intentar refresh
  if (response.status === 401 && !endpoint.includes('/auth/refresh') && !endpoint.includes('/auth/login')) {
    if (!isRefreshing) {
      isRefreshing = true
      const newToken = await refreshAccessToken()
      isRefreshing = false
      
      if (newToken) {
        onTokenRefreshed(newToken)
        
        // Reintentar peticion original con nuevo token
        headers['Authorization'] = `Bearer ${newToken}`
        response = await fetch(`${API_URL}${endpoint}`, {
          ...options,
          headers,
        })
      } else {
        // Refresh fallo, redirigir a login
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login'
        }
        throw new Error('Session expired')
      }
    } else {
      // Esperar a que termine el refresh en curso
      const newToken = await new Promise<string>((resolve) => {
        subscribeTokenRefresh((token) => resolve(token))
      })
      
      // Reintentar con nuevo token
      headers['Authorization'] = `Bearer ${newToken}`
      response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      })
    }
  }
  
  // 5. Parsear respuesta
  const data: ApiResponse<T> = await response.json()
  
  // 6. Validar estructura de respuesta (Requirement 15.4, 15.5, 16.1)
  if (typeof data !== 'object' || data === null) {
    console.warn(`[API] Unexpected response format from ${endpoint}:`, data)
    throw new Error('Formato de datos inesperado recibido del servidor')
  }
  
  // Validar que tenga el campo success (Requirement 16.1)
  if (typeof data.success !== 'boolean') {
    console.warn(`[API] Response missing 'success' field from ${endpoint}:`, data)
    // Intentar inferir success basado en status code
    data.success = response.ok
  }
  
  // 7. Manejar errores (Requirement 16.2, 16.3, 16.4, 16.5)
  if (!response.ok || data.success === false) {
    // Extraer mensaje de error del campo error (Requirement 16.3, 16.4)
    let errorMessage = `Error ${response.status}`
    
    if (data.error) {
      // Manejar error.message si existe (Requirement 16.4)
      if (typeof data.error === 'object' && 'message' in data.error) {
        errorMessage = data.error.message || errorMessage
      } else if (typeof data.error === 'string') {
        errorMessage = data.error
      }
    }
    
    // Crear error con información adicional
    const error = new Error(errorMessage) as any
    error.response = {
      status: response.status,
      data: data
    }
    
    throw error
  }
  
  // 8. Validar que tenga el campo data cuando success es true (Requirement 16.2)
  if (data.success && !('data' in data)) {
    console.warn(`[API] Successful response missing 'data' field from ${endpoint}:`, data)
  }
  
  // 9. Retornar data (Requirement 16.2)
  return data.data as T
}

export const api = {
  get: <T>(endpoint: string) => 
    apiClient<T>(endpoint, { method: 'GET' }),
  
  post: <T>(endpoint: string, data?: any) => 
    apiClient<T>(endpoint, { 
      method: 'POST', 
      body: data ? JSON.stringify(data) : undefined 
    }),
  
  patch: <T>(endpoint: string, data?: any) => 
    apiClient<T>(endpoint, { 
      method: 'PATCH', 
      body: data ? JSON.stringify(data) : undefined 
    }),
  
  delete: <T>(endpoint: string) => 
    apiClient<T>(endpoint, { method: 'DELETE' }),
}
