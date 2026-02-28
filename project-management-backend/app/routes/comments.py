from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from marshmallow import ValidationError
from app import db
from app.models import User
from app.services.comment_service import CommentService
from app.utils import get_current_user_id
from app.schemas.comment_schema import (
    CommentCreateSchema,
    CommentUpdateSchema,
    CommentSchema,
    CommentWithUserSchema
)

comments_bp = Blueprint('comments', __name__, url_prefix='/api/tasks')

# Instanciar schemas
comment_create_schema = CommentCreateSchema()
comment_update_schema = CommentUpdateSchema()
comment_schema = CommentSchema()
comment_with_user_schema = CommentWithUserSchema()


@comments_bp.route('/<task_id>/comments', methods=['GET'])
@jwt_required()
def list_comments(task_id):
    """
    Listar comentarios de una tarea
    RF-016: Sistema de comentarios
    """
    try:
        user_id = get_current_user_id()
        claims = get_jwt()
        user_role = claims.get('role')
        
        # Obtener comentarios (ya vienen con user_name del service)
        comments = CommentService.get_task_comments(task_id, user_id, user_role)
        
        if comments is None:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'TASK_NOT_FOUND_OR_FORBIDDEN',
                    'message': 'Tarea no encontrada o no tienes acceso'
                }
            }), 404
        
        # Devolver directamente el array de comentarios (sin wrapper)
        return jsonify({
            'success': True,
            'data': comments
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': {
                'code': 'SERVER_ERROR',
                'message': str(e)
            }
        }), 500


@comments_bp.route('/<task_id>/comments', methods=['POST'])
@jwt_required()
def create_comment(task_id):
    """
    Crear comentario en una tarea
    RF-016: Sistema de comentarios
    """
    try:
        user_id = get_current_user_id()
        claims = get_jwt()
        user_role = claims.get('role')
        
        # Validar con Marshmallow
        data = request.get_json()
        try:
            validated_data = comment_create_schema.load(data)
        except ValidationError as err:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'VALIDATION_ERROR',
                    'message': 'Errores de validación',
                    'details': err.messages
                }
            }), 400
        
        # Crear comentario
        comment, error = CommentService.create_comment(
            task_id,
            user_id,
            user_role,
            validated_data['content']
        )
        
        if error:
            error_messages = {
                'TASK_NOT_FOUND': 'Tarea no encontrada',
                'FORBIDDEN': 'No tienes permiso para comentar en esta tarea'
            }
            return jsonify({
                'success': False,
                'error': {
                    'code': error,
                    'message': error_messages.get(error, 'Error desconocido')
                }
            }), 403 if error == 'FORBIDDEN' else 404
        
        db.session.commit()
        
        # Enriquecer comentario con información del usuario
        user = User.query.get(user_id)
        comment_data = comment.to_dict()
        comment_data['user_name'] = user.name if user else 'Usuario desconocido'
        comment_data['user_email'] = user.email if user else ''
        comment_data['user_avatar'] = user.avatar if user else None
        
        return jsonify({
            'success': True,
            'data': comment_data,
            'message': 'Comentario creado exitosamente'
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': {
                'code': 'SERVER_ERROR',
                'message': str(e)
            }
        }), 500


@comments_bp.route('/<task_id>/comments/<comment_id>', methods=['PATCH'])
@jwt_required()
def update_comment(task_id, comment_id):
    """
    Actualizar comentario
    RF-016: Sistema de comentarios
    Solo el autor puede editar
    """
    try:
        user_id = get_current_user_id()
        
        # Validar con Marshmallow
        data = request.get_json()
        try:
            validated_data = comment_update_schema.load(data)
        except ValidationError as err:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'VALIDATION_ERROR',
                    'message': 'Errores de validación',
                    'details': err.messages
                }
            }), 400
        
        # Actualizar comentario
        comment, error = CommentService.update_comment(
            comment_id,
            user_id,
            validated_data['content']
        )
        
        if error:
            return jsonify({
                'success': False,
                'error': {
                    'code': error,
                    'message': 'Comentario no encontrado o no tienes permiso para editarlo'
                }
            }), 404
        
        db.session.commit()
        
        # Enriquecer comentario con información del usuario
        user = User.query.get(user_id)
        comment_data = comment.to_dict()
        comment_data['user_name'] = user.name if user else 'Usuario desconocido'
        comment_data['user_email'] = user.email if user else ''
        comment_data['user_avatar'] = user.avatar if user else None
        
        return jsonify({
            'success': True,
            'data': comment_data,
            'message': 'Comentario actualizado exitosamente'
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


@comments_bp.route('/<task_id>/comments/<comment_id>', methods=['DELETE'])
@jwt_required()
def delete_comment(task_id, comment_id):
    """
    Eliminar comentario
    RF-016: Sistema de comentarios
    El autor o el Owner pueden eliminar
    """
    try:
        user_id = get_current_user_id()
        claims = get_jwt()
        user_role = claims.get('role')
        
        # Eliminar comentario
        success, error = CommentService.delete_comment(comment_id, user_id, user_role)
        
        if not success:
            error_messages = {
                'COMMENT_NOT_FOUND': 'Comentario no encontrado',
                'FORBIDDEN': 'No tienes permiso para eliminar este comentario'
            }
            return jsonify({
                'success': False,
                'error': {
                    'code': error,
                    'message': error_messages.get(error, 'Error desconocido')
                }
            }), 403 if error == 'FORBIDDEN' else 404
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Comentario eliminado exitosamente'
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
