"""
Middleware de Permisos y Auditoría
Clases para verificar permisos y registrar accesos
"""

from app.config.permissions import ROLE_PERMISSIONS, RESOURCE_PERMISSIONS, get_role_level
from app import db


class PermissionChecker:
    """Clase para verificar permisos de usuario"""
    
    @staticmethod
    def has_permission(user_role, permission):
        """
        Verifica si un rol tiene un permiso específico
        
        Args:
            user_role: Rol del usuario (OWNER, EMPLOYEE, SUPERADMIN)
            permission: Permiso a verificar (ej: 'task:create')
        
        Returns:
            bool: True si tiene permiso, False si no
        
        Ejemplos:
            has_permission('OWNER', 'task:create') -> True
            has_permission('EMPLOYEE', 'task:create') -> False
            has_permission('SUPERADMIN', 'anything:anything') -> True
        """
        # SuperAdmin tiene todos los permisos
        if user_role == 'SUPERADMIN':
            return True
        
        # Obtener permisos del rol
        user_permissions = ROLE_PERMISSIONS.get(user_role, [])
        
        # Verificar permiso exacto
        if permission in user_permissions:
            return True
        
        # Verificar wildcard (ej: 'task:*' cubre 'task:create')
        if ':' in permission:
            resource, action = permission.split(':', 1)
            wildcard = f'{resource}:*'
            if wildcard in user_permissions:
                return True
        
        # Verificar wildcard total
        if '*:*' in user_permissions:
            return True
        
        return False
    
    @staticmethod
    def has_resource_access(user_id, user_role, resource_type, resource_id):
        """
        Verifica si un usuario tiene acceso a un recurso específico
        
        Args:
            user_id: ID del usuario
            user_role: Rol del usuario
            resource_type: Tipo de recurso (task, comment, project, etc.)
            resource_id: ID del recurso
        
        Returns:
            bool: True si tiene acceso, False si no
        
        Ejemplos:
            # Owner del proyecto puede ver cualquier tarea del proyecto
            has_resource_access('user123', 'OWNER', 'task', 'task456') -> True
            
            # Employee solo puede ver tareas asignadas a él
            has_resource_access('user123', 'EMPLOYEE', 'task', 'task456') -> True/False
        """
        # SuperAdmin tiene acceso a todo
        if user_role == 'SUPERADMIN':
            return True
        
        # Lógica específica por tipo de recurso
        if resource_type == 'task':
            return PermissionChecker._check_task_access(user_id, user_role, resource_id)
        
        elif resource_type == 'comment':
            return PermissionChecker._check_comment_access(user_id, user_role, resource_id)
        
        elif resource_type == 'project':
            return PermissionChecker._check_project_access(user_id, user_role, resource_id)
        
        elif resource_type == 'notification':
            return PermissionChecker._check_notification_access(user_id, user_role, resource_id)
        
        return False
    
    @staticmethod
    def _check_task_access(user_id, user_role, task_id):
        """Verifica acceso a una tarea"""
        from app.models import Task, Project
        
        task = Task.query.get(task_id)
        if not task:
            return False
        
        # Owner del proyecto tiene acceso
        if user_role == 'OWNER':
            project = Project.query.get(task.project_id)
            if not project:
                return False
            return project.owner_id == user_id
        
        # Employee solo si está asignado a la tarea
        if user_role == 'EMPLOYEE':
            return task.assigned_to == user_id
        
        return False
    
    @staticmethod
    def _check_comment_access(user_id, user_role, comment_id):
        """Verifica acceso a un comentario"""
        from app.models import Comment, Task, Project
        
        comment = Comment.query.get(comment_id)
        if not comment:
            return False
        
        task = Task.query.get(comment.task_id)
        if not task:
            return False
        
        # Owner del proyecto tiene acceso
        if user_role == 'OWNER':
            project = Project.query.get(task.project_id)
            if not project:
                return False
            return project.owner_id == user_id
        
        # Employee si está asignado a la tarea o es autor del comentario
        if user_role == 'EMPLOYEE':
            return task.assigned_to == user_id or comment.user_id == user_id
        
        return False
    
    @staticmethod
    def _check_project_access(user_id, user_role, project_id):
        """Verifica acceso a un proyecto"""
        from app.models import Project, Membership
        
        project = Project.query.get(project_id)
        if not project:
            return False
        
        # Owner del proyecto
        if user_role == 'OWNER':
            return project.owner_id == user_id
        
        # Employee si es miembro activo
        if user_role == 'EMPLOYEE':
            membership = Membership.query.filter_by(
                user_id=user_id,
                project_id=project_id,
                status='active'
            ).first()
            return membership is not None
        
        return False
    
    @staticmethod
    def _check_notification_access(user_id, user_role, notification_id):
        """Verifica acceso a una notificación"""
        from app.models import Notification
        
        notification = Notification.query.get(notification_id)
        if not notification:
            return False
        
        # Solo el usuario dueño de la notificación puede acceder
        return notification.user_id == user_id
    
    @staticmethod
    def is_resource_owner(user_id, resource_type, resource_id):
        """
        Verifica si el usuario es el dueño/creador del recurso
        
        Args:
            user_id: ID del usuario
            resource_type: Tipo de recurso
            resource_id: ID del recurso
        
        Returns:
            bool: True si es el dueño, False si no
        
        Ejemplos:
            # Verificar si el usuario creó el comentario
            is_resource_owner('user123', 'comment', 'comment456') -> True/False
        """
        if resource_type == 'comment':
            from app.models import Comment
            comment = Comment.query.get(resource_id)
            return comment and comment.user_id == user_id
        
        elif resource_type == 'task':
            from app.models import Task
            task = Task.query.get(resource_id)
            return task and task.created_by == user_id
        
        elif resource_type == 'project':
            from app.models import Project
            project = Project.query.get(resource_id)
            return project and project.owner_id == user_id
        
        elif resource_type == 'notification':
            from app.models import Notification
            notification = Notification.query.get(resource_id)
            return notification and notification.user_id == user_id
        
        return False
    
    @staticmethod
    def can_perform_action(user_role, resource_type, action):
        """
        Verifica si un rol puede realizar una acción en un tipo de recurso
        
        Args:
            user_role: Rol del usuario
            resource_type: Tipo de recurso
            action: Acción a realizar
        
        Returns:
            bool: True si puede, False si no
        
        Ejemplos:
            can_perform_action('OWNER', 'task', 'create') -> True
            can_perform_action('EMPLOYEE', 'task', 'create') -> False
        """
        # SuperAdmin puede todo
        if user_role == 'SUPERADMIN':
            return True
        
        # Obtener permisos del recurso
        resource_perms = RESOURCE_PERMISSIONS.get(resource_type, {})
        allowed_roles = resource_perms.get(action, [])
        
        return user_role in allowed_roles


class AuditLogger:
    """Clase para registrar acciones en audit logs"""
    
    @staticmethod
    def log_permission_denied(user_id, action, resource_type, resource_id=None, details=None):
        """
        Registra un intento de acceso denegado
        
        Args:
            user_id: ID del usuario
            action: Acción que intentó realizar
            resource_type: Tipo de recurso
            resource_id: ID del recurso (opcional)
            details: Detalles adicionales (opcional)
        
        Ejemplos:
            log_permission_denied('user123', 'create', 'task')
            log_permission_denied('user123', 'delete', 'comment', 'comment456')
        """
        from app.models import AuditLog
        from flask import request
        
        try:
            audit_details = {
                'reason': 'insufficient_permissions',
                'attempted_action': action,
                'resource_type': resource_type
            }
            
            if details:
                audit_details.update(details)
            
            audit_log = AuditLog(
                user_id=user_id,
                action=f'permission_denied_{action}',
                entity_type=resource_type,
                entity_id=resource_id,
                details=audit_details,
                ip_address=request.remote_addr if request else None,
                user_agent=request.headers.get('User-Agent') if request else None
            )
            
            db.session.add(audit_log)
            db.session.commit()
        except Exception as e:
            # No fallar si el log falla
            print(f"Error logging permission denied: {str(e)}")
            db.session.rollback()
    
    @staticmethod
    def log_access_granted(user_id, action, resource_type, resource_id=None, details=None):
        """
        Registra un acceso exitoso (opcional, para auditoría completa)
        
        Args:
            user_id: ID del usuario
            action: Acción realizada
            resource_type: Tipo de recurso
            resource_id: ID del recurso (opcional)
            details: Detalles adicionales (opcional)
        """
        from app.models import AuditLog
        from flask import request
        
        try:
            audit_details = {
                'action': action,
                'resource_type': resource_type
            }
            
            if details:
                audit_details.update(details)
            
            audit_log = AuditLog(
                user_id=user_id,
                action=f'{action}_{resource_type}',
                entity_type=resource_type,
                entity_id=resource_id,
                details=audit_details,
                ip_address=request.remote_addr if request else None,
                user_agent=request.headers.get('User-Agent') if request else None
            )
            
            db.session.add(audit_log)
            db.session.commit()
        except Exception as e:
            # No fallar si el log falla
            print(f"Error logging access granted: {str(e)}")
            db.session.rollback()
