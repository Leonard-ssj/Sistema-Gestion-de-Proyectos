from flask import Blueprint, request, jsonify, Response, stream_with_context
from flask_jwt_extended import jwt_required, get_jwt, decode_token
import time
from app import db
from app.services.notification_service import NotificationService
from app.utils import get_current_user_id
from app.models import Membership
from app.schemas.notification_schema import NotificationSchema
from app.realtime.notifications_hub import notifications_hub

notifications_bp = Blueprint('notifications', __name__, url_prefix='/api/notifications')

# Instanciar schema
notification_schema = NotificationSchema()
notifications_schema = NotificationSchema(many=True)


@notifications_bp.route('/stream', methods=['GET'])
def stream_notifications():
    token = request.args.get('token')
    if not token:
        return jsonify({
            'success': False,
            'error': {'code': 'UNAUTHORIZED', 'message': 'Token requerido'}
        }), 401

    try:
        decoded = decode_token(token)
        user_id = decoded.get('sub')
        claims = decoded.get('claims') or {}
        role = claims.get('role')

        membership = Membership.query.filter_by(user_id=user_id, status='active').first()
        project_id = membership.project_id if membership else None
        if role == 'EMPLOYEE' and not project_id:
            return jsonify({
                'success': False,
                'error': {'code': 'MEMBERSHIP_INACTIVE', 'message': 'Tu acceso al proyecto fue desactivado por el Owner.'}
            }), 403

        q = notifications_hub.subscribe(user_id)

        def gen():
            try:
                yield 'event: init\ndata: {"ok": true}\n\n'
                last_ping = time.time()
                while True:
                    try:
                        msg = q.get(timeout=10)
                        yield f'event: notification\ndata: {msg}\n\n'
                    except queue.Empty:
                        now = time.time()
                        if now - last_ping >= 20:
                            yield ': ping\n\n'
                            last_ping = now
            finally:
                notifications_hub.unsubscribe(user_id, q)

        import queue
        return Response(stream_with_context(gen()), mimetype='text/event-stream')

    except Exception as e:
        return jsonify({
            'success': False,
            'error': {'code': 'UNAUTHORIZED', 'message': str(e)}
        }), 401


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
        limit = request.args.get('limit')
        offset = request.args.get('offset', 0)
        
        membership = Membership.query.filter_by(user_id=user_id, status='active').first()
        project_id = membership.project_id if membership else None
        claims = get_jwt()
        role = claims.get('role')
        if role == 'EMPLOYEE' and not project_id:
            return jsonify({
                'success': False,
                'error': {'code': 'MEMBERSHIP_INACTIVE', 'message': 'Tu acceso al proyecto fue desactivado por el Owner.'}
            }), 403
        
        # Obtener notificaciones
        total = NotificationService.count_user_notifications(
            user_id=user_id,
            project_id=project_id,
            unread_only=unread_only
        )
        notifications = NotificationService.get_user_notifications(
            user_id=user_id,
            project_id=project_id,
            unread_only=unread_only,
            limit=limit,
            offset=offset
        )
        
        # Serializar respuesta
        notifications_data = notifications_schema.dump(notifications)
        
        return jsonify({
            'success': True,
            'data': {
                'notifications': notifications_data,
                'total': total
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
        membership = Membership.query.filter_by(user_id=user_id, status='active').first()
        project_id = membership.project_id if membership else None
        claims = get_jwt()
        role = claims.get('role')
        if role == 'EMPLOYEE' and not project_id:
            return jsonify({
                'success': False,
                'error': {'code': 'MEMBERSHIP_INACTIVE', 'message': 'Tu acceso al proyecto fue desactivado por el Owner.'}
            }), 403
        count = NotificationService.get_unread_count(user_id, project_id=project_id)
        
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
        membership = Membership.query.filter_by(user_id=user_id, status='active').first()
        project_id = membership.project_id if membership else None
        claims = get_jwt()
        role = claims.get('role')
        if role == 'EMPLOYEE' and not project_id:
            return jsonify({
                'success': False,
                'error': {'code': 'MEMBERSHIP_INACTIVE', 'message': 'Tu acceso al proyecto fue desactivado por el Owner.'}
            }), 403
        count = NotificationService.mark_all_as_read(user_id, project_id=project_id)
        
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
