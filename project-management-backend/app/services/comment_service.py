from datetime import datetime
from app import db
from app.models import Comment, Task, User, Notification, Membership, Project


class CommentService:
    """Servicio para gestión de comentarios en tareas"""
    
    @staticmethod
    def get_task_comments(task_id, user_id, user_role):
        """
        Obtener comentarios de una tarea
        Valida que el usuario tenga acceso a la tarea
        """
        # Verificar que el usuario tenga acceso a la tarea
        task = Task.query.get(task_id)
        
        if not task:
            return None
        
        # Validar acceso según rol
        if user_role == 'OWNER':
            # Owner debe ser dueño del proyecto
            project = Project.query.get(task.project_id)
            if project.owner_id != user_id:
                return None
        
        elif user_role == 'EMPLOYEE':
            # Employee debe estar asignado a la tarea
            if task.assigned_to != user_id:
                return None
        
        # Obtener comentarios con información del usuario
        comments = Comment.query.filter_by(task_id=task_id).order_by(Comment.created_at.asc()).all()
        
        # Enriquecer comentarios con información del usuario
        comments_with_user = []
        for comment in comments:
            user = User.query.get(comment.user_id)
            comment_dict = comment.to_dict()
            comment_dict['user_name'] = user.name if user else 'Usuario desconocido'
            comment_dict['user_email'] = user.email if user else ''
            comment_dict['user_avatar'] = user.avatar if user else None
            comments_with_user.append(comment_dict)
        
        return comments_with_user
    
    @staticmethod
    def create_comment(task_id, user_id, user_role, content):
        """
        Crear comentario en una tarea
        Valida permisos y crea notificación
        """
        # Verificar que la tarea existe
        task = Task.query.get(task_id)
        
        if not task:
            return None, 'TASK_NOT_FOUND'
        
        # Validar acceso según rol
        if user_role == 'OWNER':
            # Owner debe ser dueño del proyecto
            project = Project.query.get(task.project_id)
            if project.owner_id != user_id:
                return None, 'FORBIDDEN'
        
        elif user_role == 'EMPLOYEE':
            # Employee debe estar asignado a la tarea
            if task.assigned_to != user_id:
                return None, 'FORBIDDEN'
        
        # Crear comentario
        new_comment = Comment(
            task_id=task_id,
            user_id=user_id,
            content=content
        )
        
        db.session.add(new_comment)
        db.session.flush()
        
        # Crear notificación para el asignado (si no es él quien comenta)
        if task.assigned_to and task.assigned_to != user_id:
            user = User.query.get(user_id)
            notification = Notification(
                user_id=task.assigned_to,
                project_id=task.project_id,
                type='comment',
                message=f'{user.name} comentó en la tarea "{task.title}"',
                entity_type='task',
                entity_id=task.id
            )
            db.session.add(notification)
        
        # Si el que comenta es el asignado, notificar al creador
        elif task.created_by and task.created_by != user_id:
            user = User.query.get(user_id)
            notification = Notification(
                user_id=task.created_by,
                project_id=task.project_id,
                type='comment',
                message=f'{user.name} comentó en la tarea "{task.title}"',
                entity_type='task',
                entity_id=task.id
            )
            db.session.add(notification)
        
        return new_comment, None
    
    @staticmethod
    def update_comment(comment_id, user_id, content):
        """
        Actualizar comentario
        Solo el autor puede editar su comentario
        """
        comment = Comment.query.filter_by(
            id=comment_id,
            user_id=user_id
        ).first()
        
        if not comment:
            return None, 'COMMENT_NOT_FOUND'
        
        comment.content = content
        comment.updated_at = datetime.utcnow()
        
        return comment, None
    
    @staticmethod
    def delete_comment(comment_id, user_id, user_role):
        """
        Eliminar comentario
        El autor o el Owner del proyecto pueden eliminar
        """
        comment = Comment.query.get(comment_id)
        
        if not comment:
            return False, 'COMMENT_NOT_FOUND'
        
        # Verificar permisos
        task = Task.query.get(comment.task_id)
        
        if user_role == 'OWNER':
            # Owner debe ser dueño del proyecto
            project = Project.query.get(task.project_id)
            if project.owner_id != user_id:
                return False, 'FORBIDDEN'
        
        elif user_role == 'EMPLOYEE':
            # Employee solo puede eliminar sus propios comentarios
            if comment.user_id != user_id:
                return False, 'FORBIDDEN'
        
        db.session.delete(comment)
        return True, None
    
    @staticmethod
    def can_user_access_task(task_id, user_id, user_role):
        """Verificar si el usuario tiene acceso a la tarea"""
        task = Task.query.get(task_id)
        
        if not task:
            return False
        
        if user_role == 'OWNER':
            project = Project.query.get(task.project_id)
            return project.owner_id == user_id
        
        elif user_role == 'EMPLOYEE':
            return task.assigned_to == user_id
        
        return False
