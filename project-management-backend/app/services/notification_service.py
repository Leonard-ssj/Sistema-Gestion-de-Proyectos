from datetime import datetime
from app import db
from app.models import Notification


class NotificationService:
    """Servicio para gestión de notificaciones"""
    
    @staticmethod
    def get_user_notifications(user_id, project_id=None, unread_only=False, limit=None, offset=0):
        """Obtener notificaciones del usuario"""
        query = Notification.query.filter_by(user_id=user_id)
        
        if project_id:
            query = query.filter_by(project_id=project_id)
        
        if unread_only:
            query = query.filter_by(read=False)
        
        query = query.order_by(Notification.created_at.desc())
        
        if offset:
            query = query.offset(int(offset))
        if limit:
            query = query.limit(int(limit))
        
        return query.all()

    @staticmethod
    def count_user_notifications(user_id, project_id=None, unread_only=False):
        query = Notification.query.filter_by(user_id=user_id)
        if project_id:
            query = query.filter_by(project_id=project_id)
        if unread_only:
            query = query.filter_by(read=False)
        return query.count()
    
    @staticmethod
    def get_unread_count(user_id, project_id=None):
        """Obtener contador de notificaciones no leídas"""
        query = Notification.query.filter_by(
            user_id=user_id,
            read=False
        )
        
        if project_id:
            query = query.filter_by(project_id=project_id)
        
        return query.count()
    
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
    def mark_all_as_read(user_id, project_id=None):
        """Marcar todas las notificaciones como leídas"""
        query = Notification.query.filter_by(
            user_id=user_id,
            read=False
        )
        
        if project_id:
            query = query.filter_by(project_id=project_id)
        
        notifications = query.all()
        
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
