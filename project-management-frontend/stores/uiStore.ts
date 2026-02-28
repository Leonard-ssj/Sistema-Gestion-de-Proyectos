"use client"
import { create } from "zustand"

interface UIState {
  sidebarOpen: boolean
  devPanelOpen: boolean
  setSidebarOpen: (v: boolean) => void
  toggleSidebar: () => void
  setDevPanelOpen: (v: boolean) => void
  toggleDevPanel: () => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  devPanelOpen: false,
  setSidebarOpen: (v) => set({ sidebarOpen: v }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setDevPanelOpen: (v) => set({ devPanelOpen: v }),
  toggleDevPanel: () => set((s) => ({ devPanelOpen: !s.devPanelOpen })),
}))
