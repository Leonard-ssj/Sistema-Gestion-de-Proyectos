"use client"
import { create } from "zustand"

interface UIState {
  sidebarOpen: boolean
  desktopCollapsed: boolean
  setSidebarOpen: (v: boolean) => void
  toggleSidebar: () => void
  toggleDesktopSidebar: () => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  desktopCollapsed: false,
  setSidebarOpen: (v) => set({ sidebarOpen: v }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  toggleDesktopSidebar: () => set((s) => ({ desktopCollapsed: !s.desktopCollapsed })),
}))
