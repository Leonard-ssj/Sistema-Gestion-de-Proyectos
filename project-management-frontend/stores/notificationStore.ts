"use client"

import { create } from "zustand"
import type { Notification } from "@/mock/types"
import { deleteNotification, fetchNotifications, getUnreadCount, markAllAsRead, markAsRead } from "@/services/notificationService"
import { toast } from "sonner"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  const AudioContextAny = (window as any).AudioContext || (window as any).webkitAudioContext
  if (!AudioContextAny) return null
  if (!audioCtx) audioCtx = new AudioContextAny()
  return audioCtx
}

function tryPlayBeep(soundEnabled: boolean) {
  if (!soundEnabled) return
  try {
    const ctx = getAudioContext()
    if (!ctx) return
    if (ctx.state === "suspended") ctx.resume()
    const oscillator = ctx.createOscillator()
    const gain = ctx.createGain()
    oscillator.type = "sine"
    oscillator.frequency.value = 880
    gain.gain.value = 0.02
    oscillator.connect(gain)
    gain.connect(ctx.destination)
    oscillator.start()
    window.setTimeout(() => oscillator.stop(), 120)
  } catch {
  }
}

function bucketSection(type: string) {
  if (type === "task_assigned" || type === "status_change" || type === "comment" || type === "mention") return "tasks"
  if (type === "invite" || type === "invite_accepted" || type === "member_deactivated" || type === "member_reactivated") return "team"
  return "other"
}

function titleForType(type: string) {
  if (type === "task_assigned") return "Tarea asignada"
  if (type === "comment") return "Nuevo comentario"
  if (type === "status_change") return "Cambio de estado"
  if (type === "task_updated") return "Tarea actualizada"
  if (type === "invite_accepted") return "Invitación aceptada"
  if (type === "invite") return "Invitación"
  if (type === "mention") return "Mención"
  if (type === "member_deactivated") return "Acceso desactivado"
  if (type === "member_reactivated") return "Acceso reactivado"
  return "Notificación"
}

function linkForEntity(entityType?: string | null, entityId?: string | null) {
  if (entityType === "task" && entityId) return `/app/tasks/${entityId}`
  return undefined
}

function mapLinkForCurrentRole(link?: string) {
  if (!link) return link
  if (typeof window === "undefined") return link
  if (window.location.pathname.startsWith("/work")) {
    return link.replace("/app/tasks/", "/work/my-tasks/")
  }
  return link
}

let realtime: EventSource | null = null

type NotificationState = {
  unreadCount: number
  preview: Notification[]
  items: Notification[]
  total: number
  sectionCounts: Record<string, number>
  hasPolledOnce: boolean
  soundEnabled: boolean
  realtimeConnected: boolean
  isLoadingPreview: boolean
  isLoadingList: boolean
  error: string | null

  enableSound: () => void
  setSoundEnabled: (v: boolean) => void
  startRealtime: (accessToken: string) => void
  stopRealtime: () => void
  refreshUnreadCount: () => Promise<void>
  refreshSectionCounts: () => Promise<void>
  loadPreview: () => Promise<void>
  loadList: (options?: { unreadOnly?: boolean; limit?: number; offset?: number; append?: boolean }) => Promise<void>
  markRead: (id: string) => Promise<void>
  markAllRead: () => Promise<void>
  remove: (id: string) => Promise<boolean>
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  unreadCount: 0,
  preview: [],
  items: [],
  total: 0,
  sectionCounts: {},
  hasPolledOnce: false,
  soundEnabled: typeof window !== "undefined" ? localStorage.getItem("notifications_sound") === "true" : false,
  realtimeConnected: false,
  isLoadingPreview: false,
  isLoadingList: false,
  error: null,

  enableSound: () => {
    try {
      const ctx = getAudioContext()
      if (!ctx) return
      if (ctx.state === "suspended") ctx.resume()
      localStorage.setItem("notifications_sound", "true")
      set({ soundEnabled: true })
    } catch {
    }
  },

  setSoundEnabled: (v) => {
    try {
      localStorage.setItem("notifications_sound", v ? "true" : "false")
    } catch {
    }
    if (v) get().enableSound()
    else set({ soundEnabled: false })
  },

  startRealtime: (accessToken: string) => {
    if (realtime) return
    const base = API_URL.replace(/\/$/, "")
    const url = `${base}/notifications/stream?token=${encodeURIComponent(accessToken)}`
    const connect = () => {
      if (realtime) return
      const es = new EventSource(url)
      realtime = es
      set({ realtimeConnected: true })
      es.addEventListener("notification", (evt: any) => {
        try {
          const payload = JSON.parse(String(evt.data))
          const raw = payload?.notification
          if (!raw?.id) return
          const mappedLink = mapLinkForCurrentRole(linkForEntity(raw.entity_type, raw.entity_id))
          const notif: Notification = {
            id: raw.id,
            user_id: raw.user_id,
            project_id: raw.project_id,
            type: raw.type,
            title: titleForType(String(raw.type)),
            message: raw.message,
            read: !!raw.read,
            created_at: raw.created_at,
            link: mappedLink,
          }
          set((s) => {
            const unreadInc = notif.read ? 0 : 1
            const nextPreview = [notif, ...s.preview].slice(0, 5)
            const nextItems = s.items.length > 0 ? [notif, ...s.items] : s.items
            const key = bucketSection(String(notif.type))
            const nextSectionCounts = { ...s.sectionCounts }
            if (!notif.read) nextSectionCounts[key] = (nextSectionCounts[key] || 0) + 1
            return {
              preview: nextPreview,
              items: nextItems,
              unreadCount: s.unreadCount + unreadInc,
              sectionCounts: nextSectionCounts,
              hasPolledOnce: true,
            }
          })
          if (document.visibilityState === "visible") {
            tryPlayBeep(get().soundEnabled)
            const onNotificationsPage = window.location.pathname.includes("/notifications")
            if (!onNotificationsPage) {
              toast(notif.title, {
                description: notif.message,
                action: notif.link
                  ? {
                      label: "Ver",
                      onClick: () => {
                        window.location.href = notif.link as string
                      },
                    }
                  : undefined,
              })
            }
          }
        } catch {
        }
      })
      es.onerror = () => {
        try {
          es.close()
        } catch {}
        realtime = null
        set({ realtimeConnected: false })
        window.setTimeout(() => connect(), 5000)
      }
    }
    connect()
  },

  stopRealtime: () => {
    if (!realtime) return
    try {
      realtime.close()
    } catch {}
    realtime = null
    set({ realtimeConnected: false })
  },

  refreshUnreadCount: async () => {
    try {
      const prev = get().unreadCount
      const hasPolledOnce = get().hasPolledOnce
      const count = await getUnreadCount()
      set({ unreadCount: count, hasPolledOnce: true })
      if (hasPolledOnce && count > prev && document.visibilityState === "visible") {
        tryPlayBeep(get().soundEnabled)
      }
    } catch (e: any) {
      set({ error: e?.message || "Error cargando contador" })
    }
  },

  refreshSectionCounts: async () => {
    try {
      const res = await fetchNotifications({ unreadOnly: true, limit: 200, offset: 0 })
      const counts: Record<string, number> = {}
      for (const n of res.notifications) {
        const key = bucketSection(String(n.type))
        counts[key] = (counts[key] || 0) + 1
      }
      set({ sectionCounts: counts })
    } catch (e: any) {
      set({ error: e?.message || "Error cargando badges" })
    }
  },

  loadPreview: async () => {
    set({ isLoadingPreview: true, error: null })
    try {
      const res = await fetchNotifications({ unreadOnly: false, limit: 5, offset: 0 })
      set({ preview: res.notifications })
      await get().refreshUnreadCount()
      await get().refreshSectionCounts()
    } catch (e: any) {
      set({ error: e?.message || "Error cargando preview" })
    } finally {
      set({ isLoadingPreview: false })
    }
  },

  loadList: async (options) => {
    set({ isLoadingList: true, error: null })
    try {
      const res = await fetchNotifications({ unreadOnly: options?.unreadOnly, limit: options?.limit, offset: options?.offset })
      set((s) => ({
        items: options?.append ? [...s.items, ...res.notifications] : res.notifications,
        total: res.total,
      }))
      await get().refreshUnreadCount()
      await get().refreshSectionCounts()
    } catch (e: any) {
      set({ error: e?.message || "Error cargando notificaciones" })
    } finally {
      set({ isLoadingList: false })
    }
  },

  markRead: async (id) => {
    set((s) => ({
      preview: s.preview.map((n) => (n.id === id ? { ...n, read: true } : n)),
      items: s.items.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }))
    try {
      await markAsRead(id)
    } finally {
      await get().refreshUnreadCount()
      await get().refreshSectionCounts()
    }
  },

  markAllRead: async () => {
    set((s) => ({
      preview: s.preview.map((n) => ({ ...n, read: true })),
      items: s.items.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }))
    try {
      await markAllAsRead()
    } finally {
      await get().refreshUnreadCount()
      await get().refreshSectionCounts()
    }
  },

  remove: async (id) => {
    set((s) => ({
      preview: s.preview.filter((n) => n.id !== id),
      items: s.items.filter((n) => n.id !== id),
    }))
    try {
      const ok = await deleteNotification(id)
      return ok
    } finally {
      await get().refreshUnreadCount()
      await get().refreshSectionCounts()
    }
  },
}))
