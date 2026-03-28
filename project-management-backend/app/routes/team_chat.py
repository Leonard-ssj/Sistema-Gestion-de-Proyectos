from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from marshmallow import ValidationError
from app import db
from app.models.user import User
from app.services.team_chat_service import TeamChatService
from app.utils import get_current_user_id
from app.schemas.team_message_schema import TeamMessageCreateSchema

team_chat_bp = Blueprint('team_chat', __name__, url_prefix='/api/projects')

message_create_schema = TeamMessageCreateSchema()

@team_chat_bp.route('/<project_id>/chat', methods=['GET'])
@jwt_required()
def list_messages(project_id):
    """
    Obtener mensajes del chat de un proyecto
    """
    try:
        user_id = get_current_user_id()
        claims = get_jwt()
        user_role = claims.get('role')
        
        limit = request.args.get('limit', 50, type=int)
        
        messages, error = TeamChatService.get_project_messages(project_id, user_id, user_role, limit)
        
        if error:
            error_messages = {
                'PROJECT_NOT_FOUND': 'Proyecto no encontrado',
                'FORBIDDEN': 'No tienes acceso al chat de este proyecto',
                'CHAT_DISABLED': 'El propietario ha deshabilitado tu acceso al chat'
            }
            return jsonify({
                'success': False,
                'error': {
                    'code': error,
                    'message': error_messages.get(error, 'Error desconocido')
                }
            }), 404 if error == 'PROJECT_NOT_FOUND' else 403
            
        return jsonify({
            'success': True,
            'data': messages
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': {
                'code': 'SERVER_ERROR',
                'message': str(e)
            }
        }), 500


@team_chat_bp.route('/<project_id>/chat', methods=['POST'])
@jwt_required()
def create_message(project_id):
    """
    Enviar un mensaje al chat del proyecto
    """
    try:
        user_id = get_current_user_id()
        claims = get_jwt()
        user_role = claims.get('role')
        
        data = request.get_json()
        try:
            validated_data = message_create_schema.load(data)
        except ValidationError as err:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'VALIDATION_ERROR',
                    'message': 'Errores de validación',
                    'details': err.messages
                }
            }), 400
            
        message, error = TeamChatService.create_message(
            project_id,
            user_id,
            user_role,
            validated_data['content'],
            validated_data.get('task_id'),
            validated_data.get('mentioned_user_id')
        )
        
        if error:
            error_messages = {
                'PROJECT_NOT_FOUND': 'Proyecto no encontrado',
                'FORBIDDEN': 'No tienes acceso al chat de este proyecto',
                'CHAT_DISABLED': 'El propietario ha deshabilitado tu acceso al chat'
            }
            return jsonify({
                'success': False,
                'error': {
                    'code': error,
                    'message': error_messages.get(error, str(error))
                }
            }), 404 if error == 'PROJECT_NOT_FOUND' else 403
            
        db.session.commit()
        
        user = User.query.get(user_id)
        msg_dict = message.to_dict()
        msg_dict['user_name'] = user.name if user else 'Desconocido'
        msg_dict['user_email'] = user.email if user else ''
        msg_dict['user_avatar'] = user.avatar if user else None
        msg_dict['task_title'] = message.task.title if message.task else None
        msg_dict['mentioned_user_name'] = message.mentioned_user.name if message.mentioned_user else None
        
        return jsonify({
            'success': True,
            'data': msg_dict,
            'message': 'Mensaje enviado'
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
