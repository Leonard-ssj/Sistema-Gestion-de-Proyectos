"use client"
import { create } from "zustand"
import type { User, Project, Membership, AuthSession, Role } from "@/mock/types"
import { getMeService, logoutService } from "@/services/authService"

interface AuthState {
  session: AuthSession | null
  hydrated: boolean
  isLoading: boolean
  hydrate: () => void
  login: (session: AuthSession) => void
  logout: () => void
  setLoading: (v: boolean) => void
  switchUser: (session: AuthSession) => void
  getRole: () => Role | null
  getUser: () => User | null
  getProject: () => Project | null
  getMembership: () => Membership | null
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  hydrated: false,
  isLoading: false,
  
  // ============================================
  // HYDRATE - Cargar sesión desde localStorage
  // ============================================
  hydrate: async () => {
    if (get().hydrated) return
    
    try {
      if (typeof window === 'undefined') {
        set({ session: null, hydrated: true })
        return
      }
      
      // Verificar si hay tokens
      const accessToken = localStorage.getItem('access_token')
      const refreshToken = localStorage.getItem('refresh_token')
      
      if (!accessToken || !refreshToken) {
        set({ session: null, hydrated: true })
        return
      }
      
      // Obtener datos del usuario desde el backend
      const user = await getMeService()
      
      if (user) {
        // Intentar recuperar proyecto y membership del localStorage
        const storedSession = localStorage.getItem('session_data')
        let project: Project | undefined
        let membership: Membership | undefined
        
        if (storedSession) {
          try {
            const parsed = JSON.parse(storedSession)
            project = parsed.project
            membership = parsed.membership
          } catch {}
        }
        
        set({
          session: {
            user,
            access_token: accessToken,
            refresh_token: refreshToken,
            project,
            membership,
          },
          hydrated: true
        })
      } else {
        // Si no se puede obtener el usuario, limpiar tokens
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('session_data')
        set({ session: null, hydrated: true })
      }
    } catch (error) {
      console.error('Error hydrating session:', error)
      set({ session: null, hydrated: true })
    }
  },
  
  // ============================================
  // LOGIN - Guardar sesión
  // ============================================
  login: (session) => {
    if (typeof window !== 'undefined') {
      // Guardar tokens
      localStorage.setItem('access_token', session.access_token)
      localStorage.setItem('refresh_token', session.refresh_token)
      
      // Guardar datos adicionales de la sesión (proyecto y membership)
      const sessionData = {
        project: session.project,
        membership: session.membership,
      }
      localStorage.setItem('session_data', JSON.stringify(sessionData))
    }
    
    set({ session, hydrated: true })
  },
  
  // ============================================
  // LOGOUT - Limpiar sesión
  // ============================================
  logout: async () => {
    // Llamar al servicio de logout
    await logoutService()
    
    // Limpiar localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('session_data')
    }
    
    set({ session: null })
  },
  
  // ============================================
  // SET LOADING
  // ============================================
  setLoading: (v) => set({ isLoading: v }),
  
  // ============================================
  // SWITCH USER (para testing/admin)
  // ============================================
  switchUser: (session) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', session.access_token)
      localStorage.setItem('refresh_token', session.refresh_token)
      
      const sessionData = {
        project: session.project,
        membership: session.membership,
      }
      localStorage.setItem('session_data', JSON.stringify(sessionData))
    }
    
    set({ session, hydrated: true })
  },
  
  // ============================================
  // GETTERS
  // ============================================
  getRole: () => get().session?.user?.role ?? null,
  getUser: () => get().session?.user ?? null,
  getProject: () => get().session?.project ?? null,
  getMembership: () => get().session?.membership ?? null,
}))
