import { api } from '@/lib/api'
import type { BackendNotification, UnreadCountResponse } from '@/lib/api-types'
import type { Notification } from '@/mock/types'

// ============================================
// MAPEO DE NOTIFICACIÓN
// ============================================

function mapNotificationFromBackend(notification: BackendNotification): Notification {
  return {
    id: notification.id,
    user_id: notification.user_id,
    project_id: notification.project_id,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    read: notification.is_read,
    created_at: notification.created_at,
    link: notification.link,
  }
}

// ============================================
// LIST NOTIFICATIONS (Listar notificaciones)
// ============================================

export async function fetchNotifications(
  userId?: string,
  isRead?: boolean
): Promise<Notification[]> {
  try {
    const query = isRead !== undefined ? `?is_read=${isRead}` : ''
    const response = await api.get<BackendNotification[]>(`/notifications${query}`)
    return response.map(mapNotificationFromBackend)
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return []
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
