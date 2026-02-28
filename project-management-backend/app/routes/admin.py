"""
Admin Routes
Endpoints para el panel de administración (solo SUPERADMIN)
"""

from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from app.services.admin_service import AdminService
from app.schemas import UserSchema, ProjectSchema, AuditLogSchema
from app.utils.decorators import require_roles
from marshmallow import ValidationError

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

# Schemas
user_schema = UserSchema()
users_schema = UserSchema(many=True)
project_schema = ProjectSchema()
projects_schema = ProjectSchema(many=True)
audit_log_schema = AuditLogSchema()
audit_logs_schema = AuditLogSchema(many=True)


@admin_bp.route('/users', methods=['GET'])
@jwt_required()
@require_roles('SUPERADMIN')
def get_all_users():
    """
    Listar todos los usuarios (solo SUPERADMIN)
    
    Query params:
        - page: Número de página (default: 1)
        - per_page: Usuarios por página (default: 20)
        - search: Búsqueda por nombre o email
        - status: Filtrar por estado (active, inactive)
    
    Returns:
        200: Lista de usuarios con paginación
    """
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        search = request.args.get('search', None, type=str)
        status = request.args.get('status', None, type=str)
        
        result = AdminService.get_all_users(
            page=page,
            per_page=per_page,
            search=search,
            status=status
        )
        
        return jsonify({
            'success': True,
            'data': {
                'users': users_schema.dump(result['users']),
                'pagination': {
                    'total': result['total'],
                    'page': result['page'],
                    'per_page': result['per_page'],
                    'total_pages': result['total_pages'],
                    'has_next': result['has_next'],
                    'has_prev': result['has_prev']
                }
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': {
                'code': 'INTERNAL_ERROR',
                'message': str(e)
            }
        }), 500


@admin_bp.route('/projects', methods=['GET'])
@jwt_required()
@require_roles('SUPERADMIN')
def get_all_projects():
    """
    Listar todos los proyectos (solo SUPERADMIN)
    
    Query params:
        - page: Número de página (default: 1)
        - per_page: Proyectos por página (default: 20)
        - search: Búsqueda por nombre
        - status: Filtrar por estado (active, inactive)
    
    Returns:
        200: Lista de proyectos con paginación
    """
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        search = request.args.get('search', None, type=str)
        status = request.args.get('status', None, type=str)
        
        result = AdminService.get_all_projects(
            page=page,
            per_page=per_page,
            search=search,
            status=status
        )
        
        return jsonify({
            'success': True,
            'data': {
                'projects': projects_schema.dump(result['projects']),
                'pagination': {
                    'total': result['total'],
                    'page': result['page'],
                    'per_page': result['per_page'],
                    'total_pages': result['total_pages'],
                    'has_next': result['has_next'],
                    'has_prev': result['has_prev']
                }
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': {
                'code': 'INTERNAL_ERROR',
                'message': str(e)
            }
        }), 500


@admin_bp.route('/audit-logs', methods=['GET'])
@jwt_required()
@require_roles('SUPERADMIN')
def get_audit_logs():
    """
    Ver logs de auditoría (solo SUPERADMIN)
    
    Query params:
        - page: Número de página (default: 1)
        - per_page: Logs por página (default: 50)
        - user_id: Filtrar por usuario
        - action: Filtrar por acción
        - days: Últimos N días (default: 7)
    
    Returns:
        200: Lista de logs con paginación
    """
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        user_id = request.args.get('user_id', None, type=str)
        action = request.args.get('action', None, type=str)
        days = request.args.get('days', 7, type=int)
        
        result = AdminService.get_audit_logs(
            page=page,
            per_page=per_page,
            user_id=user_id,
            action=action,
            days=days
        )
        
        return jsonify({
            'success': True,
            'data': {
                'logs': audit_logs_schema.dump(result['logs']),
                'pagination': {
                    'total': result['total'],
                    'page': result['page'],
                    'per_page': result['per_page'],
                    'total_pages': result['total_pages'],
                    'has_next': result['has_next'],
                    'has_prev': result['has_prev']
                }
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': {
                'code': 'INTERNAL_ERROR',
                'message': str(e)
            }
        }), 500


@admin_bp.route('/users/<user_id>/status', methods=['PATCH'])
@jwt_required()
@require_roles('SUPERADMIN')
def update_user_status(user_id):
    """
    Activar o desactivar un usuario (solo SUPERADMIN)
    
    Body:
        {
            "status": "active" | "disabled"
        }
    
    Returns:
        200: Usuario actualizado
        400: Datos inválidos
        404: Usuario no encontrado
    """
    try:
        data = request.get_json()
        
        if 'status' not in data:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'MISSING_FIELD',
                    'message': 'El campo status es requerido'
                }
            }), 400
        
        status = data['status']
        
        if status not in ['active', 'disabled']:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'INVALID_VALUE',
                    'message': 'status debe ser "active" o "disabled"'
                }
            }), 400
        
        user = AdminService.update_user_status(user_id, status)
        
        return jsonify({
            'success': True,
            'data': user_schema.dump(user),
            'message': f'Usuario {"activado" if status == "active" else "desactivado"} exitosamente'
        }), 200
        
    except ValueError as e:
        return jsonify({
            'success': False,
            'error': {
                'code': 'INVALID_OPERATION',
                'message': str(e)
            }
        }), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'error': {
                'code': 'INTERNAL_ERROR',
                'message': str(e)
            }
        }), 500


@admin_bp.route('/projects/<project_id>/status', methods=['PATCH'])
@jwt_required()
@require_roles('SUPERADMIN')
def update_project_status(project_id):
    """
    Activar o desactivar un proyecto (solo SUPERADMIN)
    
    Body:
        {
            "status": "active" | "disabled"
        }
    
    Returns:
        200: Proyecto actualizado
        400: Datos inválidos
        404: Proyecto no encontrado
    """
    try:
        data = request.get_json()
        
        if 'status' not in data:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'MISSING_FIELD',
                    'message': 'El campo status es requerido'
                }
            }), 400
        
        status = data['status']
        
        if status not in ['active', 'disabled']:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'INVALID_VALUE',
                    'message': 'status debe ser "active" o "disabled"'
                }
            }), 400
        
        project = AdminService.update_project_status(project_id, status)
        
        return jsonify({
            'success': True,
            'data': project_schema.dump(project),
            'message': f'Proyecto {"activado" if status == "active" else "desactivado"} exitosamente'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': {
                'code': 'INTERNAL_ERROR',
                'message': str(e)
            }
        }), 500


@admin_bp.route('/stats', methods=['GET'])
@jwt_required()
@require_roles('SUPERADMIN')
def get_global_stats():
    """
    Obtener estadísticas globales de la plataforma (solo SUPERADMIN)
    
    Returns:
        200: Estadísticas globales
    """
    try:
        stats = AdminService.get_global_stats()
        
        return jsonify({
            'success': True,
            'data': stats
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': {
                'code': 'INTERNAL_ERROR',
                'message': str(e)
            }
        }), 500


@admin_bp.route('/health', methods=['GET'])
@jwt_required()
@require_roles('SUPERADMIN')
def health_check():
    """
    Health check del sistema (solo SUPERADMIN)
    
    Returns:
        200: Estado del sistema
    """
    try:
        health = AdminService.get_health_check()
        
        status_code = 200 if health['status'] == 'healthy' else 503
        
        return jsonify({
            'success': health['status'] == 'healthy',
            'data': health
        }), status_code
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': {
                'code': 'INTERNAL_ERROR',
                'message': str(e)
            }
        }), 500
