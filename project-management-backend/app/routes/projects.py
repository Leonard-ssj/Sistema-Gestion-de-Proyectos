from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from marshmallow import ValidationError
from datetime import datetime
from app import db
from app.models import Project, User, AuditLog
from app.utils import get_current_user_id
from app.schemas import ProjectCreateSchema, ProjectSchema

projects_bp = Blueprint('projects', __name__, url_prefix='/api/projects')

# Instanciar schemas
project_create_schema = ProjectCreateSchema()
project_schema = ProjectSchema()


@projects_bp.route('', methods=['POST'])
@jwt_required()
def create_project():
    """
    Crear proyecto (Onboarding de Owner)
    RF-006: Onboarding de proyecto
    RF-007: Límite 1 proyecto por Owner
    """
    try:
        user_id = get_current_user_id()
        claims = get_jwt()
        user_role = claims.get('role')
        
        # Solo OWNER puede crear proyectos
        if user_role != 'OWNER':
            return jsonify({
                'success': False,
                'error': {
                    'code': 'FORBIDDEN',
                    'message': 'Solo los Owners pueden crear proyectos'
                }
            }), 403
        
        # Buscar usuario
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'USER_NOT_FOUND',
                    'message': 'Usuario no encontrado'
                }
            }), 404
        
        # Verificar que el Owner no tenga proyecto (RF-007)
        if user.owned_project:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'PROJECT_LIMIT_REACHED',
                    'message': 'Ya tienes un proyecto creado. Solo puedes tener 1 proyecto por Owner.'
                }
            }), 400
        
        data = request.get_json()
        
        # Validar con Marshmallow
        try:
            validated_data = project_create_schema.load(data)
        except ValidationError as err:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'VALIDATION_ERROR',
                    'message': 'Errores de validación',
                    'details': err.messages
                }
            }), 400
        
        name = validated_data['name']
        description = validated_data.get('description')
        category = validated_data.get('category')
        
        # Crear proyecto
        new_project = Project(
            name=name,
            description=description,
            category=category,
            owner_id=user_id,
            status='active'
        )
        
        db.session.add(new_project)
        db.session.commit()
        
        # Crear audit log
        audit_log = AuditLog(
            user_id=user_id,
            project_id=new_project.id,
            action='project_created',
            entity_type='project',
            entity_id=new_project.id,
            details={'name': name, 'category': category},
            ip_address=request.remote_addr,
            user_agent=request.headers.get('User-Agent')
        )
        db.session.add(audit_log)
        db.session.commit()
        
        # Serializar respuesta
        project_data = project_schema.dump(new_project)
        
        return jsonify({
            'success': True,
            'data': {
                'project': project_data
            }
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


@projects_bp.route('/my-project', methods=['GET'])
@jwt_required()
def get_my_project():
    """
    Obtener proyecto del Owner actual
    """
    try:
        user_id = get_current_user_id()
        claims = get_jwt()
        user_role = claims.get('role')
        
        # Solo OWNER puede obtener su proyecto
        if user_role != 'OWNER':
            return jsonify({
                'success': False,
                'error': {
                    'code': 'FORBIDDEN',
                    'message': 'Solo los Owners pueden acceder a esta información'
                }
            }), 403
        
        # Buscar usuario
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'USER_NOT_FOUND',
                    'message': 'Usuario no encontrado'
                }
            }), 404
        
        # Verificar que tenga proyecto
        if not user.owned_project:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'NO_PROJECT',
                    'message': 'No tienes un proyecto creado. Completa el onboarding primero.'
                }
            }), 404
        
        project = user.owned_project
        
        # Contar miembros activos
        from app.models import Membership
        active_members = Membership.query.filter_by(
            project_id=project.id,
            status='active'
        ).count()
        
        # Contar tareas
        from app.models import Task
        total_tasks = Task.query.filter_by(project_id=project.id).count()
        pending_tasks = Task.query.filter_by(project_id=project.id, status='pending').count()
        in_progress_tasks = Task.query.filter_by(project_id=project.id, status='in_progress').count()
        completed_tasks = Task.query.filter_by(project_id=project.id, status='done').count()
        
        # Preparar respuesta
        project_data = {
            'id': project.id,
            'name': project.name,
            'description': project.description,
            'category': project.category,
            'owner_id': project.owner_id,
            'status': project.status,
            'created_at': project.created_at.isoformat() if project.created_at else None,
            'stats': {
                'active_members': active_members,
                'total_tasks': total_tasks,
                'pending_tasks': pending_tasks,
                'in_progress_tasks': in_progress_tasks,
                'completed_tasks': completed_tasks
            }
        }
        
        return jsonify({
            'success': True,
            'data': {
                'project': project_data
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
