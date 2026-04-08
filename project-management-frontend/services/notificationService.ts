import { api } from '@/lib/api'
import type { BackendNotification, UnreadCountResponse } from '@/lib/api-types'
import type { Notification } from '@/mock/types'

// ============================================
// MAPEO DE NOTIFICACIÓN
// ============================================

function getTitleForNotification(type: string) {
  if (type === "task_assigned") return "Tarea asignada"
  if (type === "comment") return "Nuevo comentario"
  if (type === "status_change") return "Cambio de estado"
  if (type === "task_updated") return "Tarea actualizada"
  if (type === "invite_accepted") return "Invitación aceptada"
  if (type === "invite") return "Invitación"
  if (type === "mention") return "Mención"
  return "Notificación"
}

function getLinkForNotification(notification: BackendNotification): string | undefined {
  if (notification.entity_type === "task" && notification.entity_id) {
    return `/app/tasks/${notification.entity_id}`
  }
  return undefined
}

function mapNotificationFromBackend(notification: BackendNotification): Notification {
  return {
    id: notification.id,
    user_id: notification.user_id,
    project_id: notification.project_id,
    type: notification.type as any,
    title: notification.title || getTitleForNotification(notification.type),
    message: notification.message,
    read: notification.read !== undefined ? notification.read : !!notification.is_read,
    created_at: notification.created_at,
    link: notification.link || getLinkForNotification(notification) || (notification.type === 'chat_mention' ? '/work/chat' : undefined),
  }
}

// ============================================
// LIST NOTIFICATIONS (Listar notificaciones)
// ============================================

export async function fetchNotifications(
  options?: { unreadOnly?: boolean; limit?: number; offset?: number }
): Promise<{ notifications: Notification[]; total: number }> {
  try {
    const params = new URLSearchParams()
    if (options?.unreadOnly !== undefined) params.set('unread_only', String(options.unreadOnly))
    if (options?.limit !== undefined) params.set('limit', String(options.limit))
    if (options?.offset !== undefined) params.set('offset', String(options.offset))

    const query = params.toString() ? `?${params.toString()}` : ''
    const response = await api.get<{ notifications: BackendNotification[]; total: number }>(`/notifications${query}`)
    return { notifications: response.notifications.map(mapNotificationFromBackend), total: response.total }
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return { notifications: [], total: 0 }
  }
}

// ============================================
// MARK AS READ (Marcar como leída)
// ============================================

export async function markAsRead(notificationId: string): Promise<boolean> {
  try {
    await api.patch(`/notifications/${notificationId}/read`, {})
    return true
  } catch (error) {
    console.error('Error marking notification as read:', error)
    return false
  }
}

// ============================================
// MARK ALL AS READ (Marcar todas como leídas)
// ============================================

export async function markAllAsRead(): Promise<boolean> {
  try {
    await api.patch('/notifications/read-all', {})
    return true
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
    return false
  }
}

// ============================================
// DELETE NOTIFICATION (Eliminar notificación)
// ============================================

export async function deleteNotification(notificationId: string): Promise<boolean> {
  try {
    await api.delete(`/notifications/${notificationId}`)
    return true
  } catch (error) {
    console.error('Error deleting notification:', error)
    return false
  }
}

// ============================================
// GET UNREAD COUNT (Obtener contador de no leídas)
// ============================================

export async function getUnreadCount(): Promise<number> {
  try {
    const response = await api.get<UnreadCountResponse>('/notifications/unread-count')
    return response.unread_count
  } catch (error) {
    console.error('Error getting unread count:', error)
    return 0
  }
}
