from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app import db
from app.services.notification_service import NotificationService
from app.utils import get_current_user_id
from app.schemas.notification_schema import NotificationSchema

notifications_bp = Blueprint('notifications', __name__, url_prefix='/api/notifications')

# Instanciar schema
notification_schema = NotificationSchema()
notifications_schema = NotificationSchema(many=True)


@notifications_bp.route('', methods=['GET'])
@jwt_required()
def list_notifications():
    """
    Listar notificaciones del usuario
    RF-027: Sistema de notificaciones
    """
    try:
        user_id = get_current_user_id()
        
        # Obtener parámetro de query
        unread_only = request.args.get('unread_only', 'false').lower() == 'true'
        
        # Obtener notificaciones
        notifications = NotificationService.get_user_notifications(user_id, unread_only)
        
        # Serializar respuesta
        notifications_data = notifications_schema.dump(notifications)
        
        return jsonify({
            'success': True,
            'data': {
                'notifications': notifications_data,
                'total': len(notifications_data)
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': {
                'code': 'SERVER_ERROR',
                'message': str(e)
            }
        }), 500


@notifications_bp.route('/unread-count', methods=['GET'])
@jwt_required()
def get_unread_count():
    """
    Obtener contador de notificaciones no leídas
    RF-027: Sistema de notificaciones
    """
    try:
        user_id = get_current_user_id()
        
        # Obtener contador
        count = NotificationService.get_unread_count(user_id)
        
        return jsonify({
            'success': True,
            'data': {
                'unread_count': count
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': {
                'code': 'SERVER_ERROR',
                'message': str(e)
            }
        }), 500


@notifications_bp.route('/<notification_id>/read', methods=['PATCH'])
@jwt_required()
def mark_as_read(notification_id):
    """
    Marcar notificación como leída
    RF-027: Sistema de notificaciones
    """
    try:
        user_id = get_current_user_id()
        
        # Marcar como leída
        notification = NotificationService.mark_as_read(notification_id, user_id)
        
        if not notification:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'NOTIFICATION_NOT_FOUND',
                    'message': 'Notificación no encontrada'
                }
            }), 404
        
        db.session.commit()
        
        # Serializar respuesta
        notification_data = notification_schema.dump(notification)
        
        return jsonify({
            'success': True,
            'data': {
                'notification': notification_data
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': {
                'code': 'SERVER_ERROR',
                'message': str(e)
            }
        }), 500


@notifications_bp.route('/read-all', methods=['PATCH'])
@jwt_required()
def mark_all_as_read():
    """
    Marcar todas las notificaciones como leídas
    RF-027: Sistema de notificaciones
    """
    try:
        user_id = get_current_user_id()
        
        # Marcar todas como leídas
        count = NotificationService.mark_all_as_read(user_id)
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'data': {
                'marked_count': count
            },
            'message': f'{count} notificaciones marcadas como leídas'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': {
                'code': 'SERVER_ERROR',
                'message': str(e)
            }
        }), 500


@notifications_bp.route('/<notification_id>', methods=['DELETE'])
@jwt_required()
def delete_notification(notification_id):
    """
    Eliminar notificación
    RF-027: Sistema de notificaciones
    """
    try:
        user_id = get_current_user_id()
        
        # Eliminar notificación
        success = NotificationService.delete_notification(notification_id, user_id)
        
        if not success:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'NOTIFICATION_NOT_FOUND',
                    'message': 'Notificación no encontrada'
                }
            }), 404
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Notificación eliminada exitosamente'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': {
                'code': 'SERVER_ERROR',
                'message': str(e)
            }
        }), 500
