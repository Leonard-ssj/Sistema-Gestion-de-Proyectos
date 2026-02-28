from functools import wraps
from flask import jsonify, request
from flask_jwt_extended import verify_jwt_in_request, get_jwt


def role_required(*allowed_roles):
    """
    Decorador para verificar que el usuario tenga uno de los roles permitidos
    
    Uso:
        @role_required('OWNER', 'SUPERADMIN')
        def my_endpoint():
            pass
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            user_role = claims.get('role')
            
            if user_role not in allowed_roles:
                return jsonify({
                    'success': False,
                    'error': {
                        'code': 'FORBIDDEN',
                        'message': 'No tienes permisos para acceder a este recurso'
                    }
                }), 403
            
            return fn(*args, **kwargs)
        return wrapper
    return decorator


def project_member_required(fn):
    """
    Decorador para verificar que el usuario sea miembro del proyecto
    
    - SuperAdmin tiene acceso a todo
    - Owner y Employee deben tener project_id en el token
    - El project_id del request debe coincidir con el del token
    
    Uso:
        @project_member_required
        def my_endpoint(project_id):
            pass
    """
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        claims = get_jwt()
        user_role = claims.get('role')
        token_project_id = claims.get('project_id')
        
        # SuperAdmin tiene acceso a todo
        if user_role == 'SUPERADMIN':
            return fn(*args, **kwargs)
        
        # Verificar que tenga project_id en el token
        if not token_project_id:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'NO_PROJECT',
                    'message': 'No tienes un proyecto asignado'
                }
            }), 403
        
        # Obtener project_id del request (puede venir en kwargs, view_args o query params)
        request_project_id = (
            kwargs.get('project_id') or 
            request.view_args.get('project_id') if request.view_args else None
        )
        
        # Si hay project_id en el request, verificar que coincida
        if request_project_id and request_project_id != token_project_id:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'FORBIDDEN',
                    'message': 'No tienes acceso a este proyecto'
                }
            }), 403
        
        return fn(*args, **kwargs)
    return wrapper


def get_current_user_id():
    """
    Obtener el user_id del token JWT actual
    """
    from flask_jwt_extended import get_jwt_identity
    return get_jwt_identity()


def get_current_project_id():
    """
    Obtener el project_id del token JWT actual
    """
    claims = get_jwt()
    return claims.get('project_id')


def get_current_user_role():
    """
    Obtener el role del token JWT actual
    """
    claims = get_jwt()
    return claims.get('role')


# ============================================================================
# NUEVOS DECORADORES - SISTEMA DE PERMISOS AVANZADO (FASE 5)
# ============================================================================

from flask_jwt_extended import get_jwt_identity
from app.utils.permissions import PermissionChecker, AuditLogger


def require_permission(permission):
    """
    Decorador para verificar que el usuario tenga un permiso específico
    
    Verifica permisos usando el sistema centralizado de permisos.
    Registra intentos de acceso denegados en audit logs.
    
    Args:
        permission: Permiso requerido en formato 'recurso:accion'
                   Ejemplos: 'task:create', 'comment:delete', 'project:read'
    
    Uso:
        @require_permission('task:create')
        def create_task():
            pass
        
        @require_permission('comment:delete')
        def delete_comment(comment_id):
            pass
    
    Ejemplos de permisos:
        - 'task:create' - Crear tareas
        - 'task:read' - Ver tareas
        - 'task:update' - Actualizar tareas
        - 'task:delete' - Eliminar tareas
        - 'comment:create' - Crear comentarios
        - 'comment:delete' - Eliminar comentarios
        - 'project:create' - Crear proyectos
        - 'member:add' - Agregar miembros
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            user_role = claims.get('role')
            user_id = get_jwt_identity()
            
            # Verificar permiso
            if not PermissionChecker.has_permission(user_role, permission):
                # Registrar intento denegado
                resource_type = permission.split(':')[0] if ':' in permission else 'unknown'
                AuditLogger.log_permission_denied(
                    user_id=user_id,
                    action=permission,
                    resource_type=resource_type,
                    details={'required_permission': permission}
                )
                
                return jsonify({
                    'success': False,
                    'error': {
                        'code': 'FORBIDDEN',
                        'message': 'No tienes permisos para realizar esta acción'
                    }
                }), 403
            
            return fn(*args, **kwargs)
        return wrapper
    return decorator


def require_project_access(fn):
    """
    Decorador para verificar que el usuario tenga acceso al proyecto del recurso
    
    Extrae automáticamente el ID del recurso (task_id, project_id, comment_id)
    y verifica que el usuario tenga acceso al proyecto asociado.
    
    Reglas:
        - SUPERADMIN: Acceso a todo
        - OWNER: Acceso si es owner del proyecto
        - EMPLOYEE: Acceso si es miembro del proyecto o está asignado al recurso
    
    Uso:
        @require_project_access
        def get_task(task_id):
            pass
        
        @require_project_access
        def get_comment(comment_id):
            pass
        
        @require_project_access
        def get_project(project_id):
            pass
    
    El decorador detecta automáticamente el tipo de recurso basándose en
    los parámetros de la función (task_id, project_id, comment_id, etc.)
    """
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        claims = get_jwt()
        user_role = claims.get('role')
        user_id = get_jwt_identity()
        
        # SuperAdmin tiene acceso a todo
        if user_role == 'SUPERADMIN':
            return fn(*args, **kwargs)
        
        # Obtener resource_id del request
        resource_id = (
            kwargs.get('task_id') or
            kwargs.get('project_id') or
            kwargs.get('comment_id') or
            kwargs.get('notification_id')
        )
        
        if not resource_id:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'BAD_REQUEST',
                    'message': 'ID de recurso no proporcionado'
                }
            }), 400
        
        # Determinar tipo de recurso
        resource_type = None
        if 'task_id' in kwargs:
            resource_type = 'task'
        elif 'project_id' in kwargs:
            resource_type = 'project'
        elif 'comment_id' in kwargs:
            resource_type = 'comment'
        elif 'notification_id' in kwargs:
            resource_type = 'notification'
        
        if not resource_type:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'BAD_REQUEST',
                    'message': 'Tipo de recurso no identificado'
                }
            }), 400
        
        # Verificar acceso
        if not PermissionChecker.has_resource_access(
            user_id, user_role, resource_type, resource_id
        ):
            AuditLogger.log_permission_denied(
                user_id=user_id,
                action='access',
                resource_type=resource_type,
                resource_id=resource_id,
                details={'reason': 'no_project_access'}
            )
            
            return jsonify({
                'success': False,
                'error': {
                    'code': 'FORBIDDEN',
                    'message': 'No tienes acceso a este recurso'
                }
            }), 403
        
        return fn(*args, **kwargs)
    return wrapper


def require_resource_owner(resource_type):
    """
    Decorador para verificar que el usuario sea el dueño/creador del recurso
    
    Útil para operaciones que solo el creador puede realizar (editar/eliminar).
    
    Reglas:
        - SUPERADMIN: Siempre puede
        - OWNER del proyecto: Siempre puede
        - Creador del recurso: Siempre puede
        - Otros: No pueden
    
    Args:
        resource_type: Tipo de recurso ('comment', 'task', 'project', etc.)
    
    Uso:
        @require_resource_owner('comment')
        def update_comment(comment_id):
            pass
        
        @require_resource_owner('comment')
        def delete_comment(comment_id):
            pass
        
        @require_resource_owner('task')
        def delete_task(task_id):
            pass
    
    Casos de uso comunes:
        - Editar comentario: Solo el autor o el owner del proyecto
        - Eliminar comentario: Solo el autor o el owner del proyecto
        - Editar tarea: Solo el creador o el owner del proyecto
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            user_role = claims.get('role')
            user_id = get_jwt_identity()
            
            # SuperAdmin y Owner del proyecto pueden modificar cualquier recurso
            if user_role in ['SUPERADMIN', 'OWNER']:
                return fn(*args, **kwargs)
            
            # Obtener resource_id
            resource_id = kwargs.get(f'{resource_type}_id')
            
            if not resource_id:
                return jsonify({
                    'success': False,
                    'error': {
                        'code': 'BAD_REQUEST',
                        'message': 'ID de recurso no proporcionado'
                    }
                }), 400
            
            # Verificar que sea el dueño del recurso
            if not PermissionChecker.is_resource_owner(
                user_id, resource_type, resource_id
            ):
                AuditLogger.log_permission_denied(
                    user_id=user_id,
                    action='modify',
                    resource_type=resource_type,
                    resource_id=resource_id,
                    details={'reason': 'not_resource_owner'}
                )
                
                return jsonify({
                    'success': False,
                    'error': {
                        'code': 'FORBIDDEN',
                        'message': 'Solo el autor puede modificar este recurso'
                    }
                }), 403
            
            return fn(*args, **kwargs)
        return wrapper
    return decorator


def require_roles(*allowed_roles):
    """
    Decorador mejorado para verificar múltiples roles permitidos
    
    Similar a role_required pero con mejor logging y mensajes de error.
    
    Args:
        *allowed_roles: Roles permitidos ('OWNER', 'EMPLOYEE', 'SUPERADMIN')
    
    Uso:
        @require_roles('OWNER', 'SUPERADMIN')
        def admin_only_endpoint():
            pass
        
        @require_roles('OWNER', 'EMPLOYEE')
        def member_endpoint():
            pass
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            user_role = claims.get('role')
            user_id = get_jwt_identity()
            
            if user_role not in allowed_roles:
                AuditLogger.log_permission_denied(
                    user_id=user_id,
                    action='access',
                    resource_type='endpoint',
                    details={
                        'required_roles': list(allowed_roles),
                        'user_role': user_role
                    }
                )
                
                return jsonify({
                    'success': False,
                    'error': {
                        'code': 'FORBIDDEN',
                        'message': 'No tienes permisos para acceder a este recurso'
                    }
                }), 403
            
            return fn(*args, **kwargs)
        return wrapper
    return decorator
