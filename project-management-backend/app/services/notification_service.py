from datetime import datetime
from app import db
from app.models import Notification


class NotificationService:
    """Servicio para gestión de notificaciones"""
    
    @staticmethod
    def get_user_notifications(user_id, unread_only=False):
        """Obtener notificaciones del usuario"""
        query = Notification.query.filter_by(user_id=user_id)
        
        if unread_only:
            query = query.filter_by(read=False)
        
        return query.order_by(Notification.created_at.desc()).all()
    
    @staticmethod
    def get_unread_count(user_id):
        """Obtener contador de notificaciones no leídas"""
        return Notification.query.filter_by(
            user_id=user_id,
            read=False
        ).count()
    
    @staticmethod
    def mark_as_read(notification_id, user_id):
        """Marcar notificación como leída"""
        notification = Notification.query.filter_by(
            id=notification_id,
            user_id=user_id
        ).first()
        
        if not notification:
            return None
        
        notification.mark_as_read()
        return notification
    
    @staticmethod
    def mark_all_as_read(user_id):
        """Marcar todas las notificaciones como leídas"""
        notifications = Notification.query.filter_by(
            user_id=user_id,
            read=False
        ).all()
        
        for notification in notifications:
            notification.mark_as_read()
        
        return len(notifications)
    
    @staticmethod
    def delete_notification(notification_id, user_id):
        """Eliminar notificación"""
        notification = Notification.query.filter_by(
            id=notification_id,
            user_id=user_id
        ).first()
        
        if not notification:
            return False
        
        db.session.delete(notification)
        return True
