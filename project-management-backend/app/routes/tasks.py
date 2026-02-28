from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from marshmallow import ValidationError
from datetime import datetime
from app import db
from app.models import Task, User, Project, Membership, Notification, AuditLog
from app.services import TaskService
from app.utils import get_current_user_id
from app.schemas import (
    TaskCreateSchema,
    TaskUpdateSchema,
    TaskSchema,
    TaskWithDetailsSchema
)

tasks_bp = Blueprint('tasks', __name__, url_prefix='/api/tasks')

# Instanciar schemas
task_create_schema = TaskCreateSchema()
task_update_schema = TaskUpdateSchema()
task_schema = TaskSchema()
task_with_details_schema = TaskWithDetailsSchema()


@tasks_bp.route('', methods=['POST'])
@jwt_required()
def create_task():
    """
    Crear tarea (Owner)
    RF-010: CRUD de tareas
    """
    try:
        user_id = get_current_user_id()
        claims = get_jwt()
        user_role = claims.get('role')
        
        # Solo OWNER puede crear tareas
        if user_role != 'OWNER':
            return jsonify({
                'success': False,
                'error': {
                    'code': 'FORBIDDEN',
                    'message': 'Solo los Owners pueden crear tareas'
                }
            }), 403
        
        # Obtener proyecto del Owner
        user = User.query.get(user_id)
        if not user or not user.owned_project:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'NO_PROJECT',
                    'message': 'No tienes un proyecto'
                }
            }), 400
        
        project_id = user.owned_project.id
        
        # Validar con Marshmallow
        data = request.get_json()
        try:
            validated_data = task_create_schema.load(data)
        except ValidationError as err:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'VALIDATION_ERROR',
                    'message': 'Errores de validación',
                    'details': err.messages
                }
            }), 400
        
        # Validar assigned_to (si existe)
        assigned_to = validated_data.get('assigned_to')
        if assigned_to:
            # Verificar que el usuario sea miembro del proyecto
            membership = Membership.query.filter_by(
                user_id=assigned_to,
                project_id=project_id,
                status='active'
            ).first()
            
            if not membership:
                return jsonify({
                    'success': False,
                    'error': {
                        'code': 'INVALID_ASSIGNEE',
                        'message': 'El usuario no es miembro del proyecto'
                    }
                }), 400
        
        # Crear tarea
        new_task = TaskService.create_task(project_id, validated_data, user_id)
        
        # Crear notificación si está asignada
        if assigned_to:
            TaskService.create_task_notification(
                new_task,
                'task_assigned',
                assigned_to,
                f'{user.name} te asignó la tarea "{new_task.title}"'
            )
        
        # Crear audit log
        audit_log = AuditLog(
            user_id=user_id,
            project_id=project_id,
            action='task_created',
            entity_type='task',
            entity_id=new_task.id,
            details={'title': new_task.title, 'assigned_to': assigned_to},
            ip_address=request.remote_addr,
            user_agent=request.headers.get('User-Agent')
        )
        db.session.add(audit_log)
        
        db.session.commit()
        
        # Serializar respuesta
        task_data = task_schema.dump(new_task)
        
        return jsonify({
            'success': True,
            'data': {
                'task': task_data
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


@tasks_bp.route('', methods=['GET'])
@jwt_required()
def list_tasks():
    """
    Listar tareas
    RF-010: CRUD de tareas
    RF-015: Vista 'My Tasks'
    """
    try:
        user_id = get_current_user_id()
        claims = get_jwt()
        user_role = claims.get('role')
        
        # Obtener project_id según rol
        if user_role == 'OWNER':
            user = User.query.get(user_id)
            if not user or not user.owned_project:
                return jsonify({
                    'success': False,
                    'error': {
                        'code': 'NO_PROJECT',
                        'message': 'No tienes un proyecto'
                    }
                }), 400
            project_id = user.owned_project.id
        
        elif user_role == 'EMPLOYEE':
            # Obtener project_id de la membresía activa
            membership = Membership.query.filter_by(
                user_id=user_id,
                status='active'
            ).first()
            
            if not membership:
                return jsonify({
                    'success': False,
                    'error': {
                        'code': 'NO_MEMBERSHIP',
                        'message': 'No perteneces a ningún proyecto'
                    }
                }), 400
            project_id = membership.project_id
        
        else:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'FORBIDDEN',
                    'message': 'Rol no autorizado'
                }
            }), 403
        
        # Obtener filtros de query params
        filters = {
            'status': request.args.get('status'),
            'priority': request.args.get('priority'),
            'assigned_to': request.args.get('assigned_to'),
            'search': request.args.get('search'),
            'sort_by': request.args.get('sort_by', 'created_at'),
            'sort_order': request.args.get('sort_order', 'desc')
        }
        
        # Listar tareas con filtros
        tasks = TaskService.list_tasks(project_id, filters, user_id, user_role)
        
        # Serializar respuesta
        tasks_data = task_schema.dump(tasks, many=True)
        
        return jsonify({
            'success': True,
            'data': {
                'tasks': tasks_data,
                'total': len(tasks_data)
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


@tasks_bp.route('/<task_id>', methods=['GET'])
@jwt_required()
def get_task(task_id):
    """
    Obtener detalle de tarea
    RF-011: Detalle de tarea
    """
    try:
        user_id = get_current_user_id()
        claims = get_jwt()
        user_role = claims.get('role')
        
        # Obtener tarea con validación de permisos
        task = TaskService.get_task_by_id(task_id, user_id, user_role)
        
        if not task:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'TASK_NOT_FOUND',
                    'message': 'Tarea no encontrada o no tienes acceso'
                }
            }), 404
        
        # Obtener información adicional
        creator = User.query.get(task.created_by)
        assignee = User.query.get(task.assigned_to) if task.assigned_to else None
        
        # Serializar respuesta
        task_data = task_schema.dump(task)
        task_data['creator_name'] = creator.name if creator else None
        task_data['assignee_name'] = assignee.name if assignee else None
        task_data['comments_count'] = len(task.comments) if task.comments else 0
        
        return jsonify({
            'success': True,
            'data': {
                'task': task_data
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


@tasks_bp.route('/<task_id>', methods=['PATCH'])
@jwt_required()
def update_task(task_id):
    """
    Actualizar tarea
    RF-010: CRUD de tareas
    RF-014: Permisos Employee en tarea
    """
    try:
        user_id = get_current_user_id()
        claims = get_jwt()
        user_role = claims.get('role')
        
        # Validar con Marshmallow
        data = request.get_json()
        try:
            validated_data = task_update_schema.load(data)
        except ValidationError as err:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'VALIDATION_ERROR',
                    'message': 'Errores de validación',
                    'details': err.messages
                }
            }), 400
        
        # Actualizar tarea con validación de permisos
        task = TaskService.update_task(task_id, validated_data, user_id, user_role)
        
        if not task:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'TASK_NOT_FOUND',
                    'message': 'Tarea no encontrada o no tienes permisos'
                }
            }), 404
        
        # Crear audit log
        audit_log = AuditLog(
            user_id=user_id,
            project_id=task.project_id,
            action='task_updated',
            entity_type='task',
            entity_id=task.id,
            details={'fields': list(validated_data.keys())},
            ip_address=request.remote_addr,
            user_agent=request.headers.get('User-Agent')
        )
        db.session.add(audit_log)
        
        db.session.commit()
        
        # Serializar respuesta
        task_data = task_schema.dump(task)
        
        return jsonify({
            'success': True,
            'data': {
                'task': task_data
            }
        }), 200
    
    except PermissionError as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': {
                'code': 'CHECKLIST_PERMISSION_DENIED',
                'message': str(e)
            }
        }), 403
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': {
                'code': 'SERVER_ERROR',
                'message': str(e)
            }
        }), 500


@tasks_bp.route('/<task_id>', methods=['DELETE'])
@jwt_required()
def delete_task(task_id):
    """
    Eliminar tarea (Owner)
    RF-010: CRUD de tareas
    """
    try:
        user_id = get_current_user_id()
        claims = get_jwt()
        user_role = claims.get('role')
        
        # Solo OWNER puede eliminar tareas
        if user_role != 'OWNER':
            return jsonify({
                'success': False,
                'error': {
                    'code': 'FORBIDDEN',
                    'message': 'Solo los Owners pueden eliminar tareas'
                }
            }), 403
        
        # Obtener tarea antes de eliminar (para audit log)
        task = Task.query.get(task_id)
        if task:
            task_title = task.title
            project_id = task.project_id
        
        # Eliminar tarea
        success = TaskService.delete_task(task_id, user_id)
        
        if not success:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'TASK_NOT_FOUND',
                    'message': 'Tarea no encontrada o no tienes permisos'
                }
            }), 404
        
        # Crear audit log
        audit_log = AuditLog(
            user_id=user_id,
            project_id=project_id,
            action='task_deleted',
            entity_type='task',
            entity_id=task_id,
            details={'title': task_title},
            ip_address=request.remote_addr,
            user_agent=request.headers.get('User-Agent')
        )
        db.session.add(audit_log)
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Tarea eliminada exitosamente'
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


@tasks_bp.route('/my-tasks', methods=['GET'])
@jwt_required()
def get_my_tasks():
    """
    Obtener mis tareas (Employee)
    RF-015: Vista 'My Tasks'
    """
    try:
        user_id = get_current_user_id()
        claims = get_jwt()
        user_role = claims.get('role')
        
        # Solo EMPLOYEE puede usar este endpoint
        if user_role != 'EMPLOYEE':
            return jsonify({
                'success': False,
                'error': {
                    'code': 'FORBIDDEN',
                    'message': 'Este endpoint es solo para Employees'
                }
            }), 403
        
        # Obtener tareas del usuario
        tasks = TaskService.get_my_tasks(user_id)
        
        # Serializar respuesta
        tasks_data = task_schema.dump(tasks, many=True)
        
        return jsonify({
            'success': True,
            'data': {
                'tasks': tasks_data,
                'total': len(tasks_data)
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


@tasks_bp.route('/<task_id>/assign', methods=['PATCH'])
@jwt_required()
def assign_task(task_id):
    """
    Asignar tarea (Owner)
    RF-012: Asignación de tareas
    """
    try:
        user_id = get_current_user_id()
        claims = get_jwt()
        user_role = claims.get('role')
        
        # Solo OWNER puede asignar tareas
        if user_role != 'OWNER':
            return jsonify({
                'success': False,
                'error': {
                    'code': 'FORBIDDEN',
                    'message': 'Solo los Owners pueden asignar tareas'
                }
            }), 403
        
        # Obtener assigned_to del body
        data = request.get_json()
        assignee_id = data.get('assigned_to')
        
        if not assignee_id:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'VALIDATION_ERROR',
                    'message': 'El campo assigned_to es requerido'
                }
            }), 400
        
        # Asignar tarea
        task, old_assigned_to = TaskService.assign_task(task_id, assignee_id, user_id)
        
        if not task:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'ASSIGNMENT_FAILED',
                    'message': old_assigned_to  # old_assigned_to contiene el mensaje de error
                }
            }), 400
        
        # Obtener usuario asignador
        assigner = User.query.get(user_id)
        
        # Crear notificación para el nuevo asignado
        TaskService.create_task_notification(
            task,
            'task_assigned',
            assignee_id,
            f'{assigner.name} te asignó la tarea "{task.title}"'
        )
        
        # Si había un asignado anterior, notificarle
        if old_assigned_to and old_assigned_to != assignee_id:
            TaskService.create_task_notification(
                task,
                'task_unassigned',
                old_assigned_to,
                f'La tarea "{task.title}" fue reasignada'
            )
        
        # Crear audit log
        audit_log = AuditLog(
            user_id=user_id,
            project_id=task.project_id,
            action='task_assigned',
            entity_type='task',
            entity_id=task.id,
            details={'assigned_to': assignee_id, 'old_assigned_to': old_assigned_to},
            ip_address=request.remote_addr,
            user_agent=request.headers.get('User-Agent')
        )
        db.session.add(audit_log)
        
        db.session.commit()
        
        # Serializar respuesta
        task_data = task_schema.dump(task)
        assignee = User.query.get(assignee_id)
        task_data['assignee_name'] = assignee.name if assignee else None
        
        return jsonify({
            'success': True,
            'data': {
                'task': task_data
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


@tasks_bp.route('/<task_id>/status', methods=['PATCH'])
@jwt_required()
def change_task_status(task_id):
    """
    Cambiar estado de tarea
    RF-013: Estados de tarea
    """
    try:
        user_id = get_current_user_id()
        claims = get_jwt()
        user_role = claims.get('role')
        
        # Obtener nuevo status del body
        data = request.get_json()
        new_status = data.get('status')
        
        if not new_status:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'VALIDATION_ERROR',
                    'message': 'El campo status es requerido'
                }
            }), 400
        
        # Validar status
        valid_statuses = ['pending', 'in_progress', 'blocked', 'done']
        if new_status not in valid_statuses:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'INVALID_STATUS',
                    'message': f'Status inválido. Opciones: {", ".join(valid_statuses)}'
                }
            }), 400
        
        # Cambiar status
        task = TaskService.change_status(task_id, new_status, user_id, user_role)
        
        if not task:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'TASK_NOT_FOUND',
                    'message': 'Tarea no encontrada o no tienes permisos'
                }
            }), 404
        
        # Crear notificación si la tarea está asignada y no es el asignado quien cambió el estado
        if task.assigned_to and task.assigned_to != user_id:
            changer = User.query.get(user_id)
            TaskService.create_task_notification(
                task,
                'status_change',
                task.assigned_to,
                f'{changer.name} cambió el estado de "{task.title}" a {new_status}'
            )
        
        # Crear audit log
        audit_log = AuditLog(
            user_id=user_id,
            project_id=task.project_id,
            action='task_status_changed',
            entity_type='task',
            entity_id=task.id,
            details={'new_status': new_status},
            ip_address=request.remote_addr,
            user_agent=request.headers.get('User-Agent')
        )
        db.session.add(audit_log)
        
        db.session.commit()
        
        # Serializar respuesta
        task_data = task_schema.dump(task)
        
        return jsonify({
            'success': True,
            'data': {
                'task': task_data
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


@tasks_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_task_stats():
    """
    Obtener estadísticas de tareas
    RF-028: Reportes (solo Owner)
    """
    try:
        user_id = get_current_user_id()
        claims = get_jwt()
        user_role = claims.get('role')
        
        # Solo OWNER puede ver estadísticas del proyecto
        if user_role != 'OWNER':
            return jsonify({
                'success': False,
                'error': {
                    'code': 'FORBIDDEN',
                    'message': 'Solo los Owners pueden ver estadísticas'
                }
            }), 403
        
        # Obtener proyecto del Owner
        user = User.query.get(user_id)
        if not user or not user.owned_project:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'NO_PROJECT',
                    'message': 'No tienes un proyecto'
                }
            }), 400
        
        project_id = user.owned_project.id
        
        # Obtener estadísticas
        stats = TaskService.get_project_stats(project_id)
        
        return jsonify({
            'success': True,
            'data': {
                'stats': stats
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
