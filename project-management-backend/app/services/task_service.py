from datetime import datetime
from app import db
from app.models import Task, User, Project, Membership, Notification, AuditLog
from sqlalchemy import or_


class TaskService:
    """Servicio para gestión de tareas"""
    
    @staticmethod
    def validate_checklist_modification(user, old_checklist, new_checklist):
        """
        Valida si el usuario puede modificar el checklist.
        
        Args:
            user: Usuario que intenta modificar el checklist
            old_checklist: Lista de items del checklist anterior
            new_checklist: Lista de items del checklist nuevo
        
        Returns:
            True si solo se modificó el campo 'completed' (toggle)
            False si se modificó estructura (agregar/eliminar/editar text)
        """
        # Si el usuario es Owner, permitir cualquier cambio
        if user.role.upper() == 'OWNER':
            return True
        
        # Si el usuario es Employee, solo permitir toggle de completed
        # Verificar que no se agregaron o eliminaron items
        if len(old_checklist or []) != len(new_checklist or []):
            return False  # Se agregaron o eliminaron items
        
        # Verificar que cada item solo cambió en el campo 'completed'
        old_list = old_checklist or []
        new_list = new_checklist or []
        
        for old_item, new_item in zip(old_list, new_list):
            if old_item.get('id') != new_item.get('id'):
                return False  # Se reordenaron items
            if old_item.get('text') != new_item.get('text'):
                return False  # Se editó el texto
            # Permitir cambio en 'completed'
        
        return True
    
    @staticmethod
    def create_task(project_id, data, creator_id):
        """Crear una nueva tarea"""
        new_task = Task(
            project_id=project_id,
            created_by=creator_id,
            **data
        )
        
        db.session.add(new_task)
        db.session.flush()
        
        return new_task
    
    @staticmethod
    def get_task_by_id(task_id, user_id, user_role):
        """Obtener tarea por ID con validación de permisos"""
        task = Task.query.get(task_id)
        
        if not task:
            return None
        
        # Verificar permisos según rol
        if user_role == 'OWNER':
            # Owner debe ser dueño del proyecto
            project = Project.query.get(task.project_id)
            if not project or project.owner_id != user_id:
                return None
        
        elif user_role == 'EMPLOYEE':
            # Employee debe estar asignado a la tarea
            if task.assigned_to != user_id:
                return None
        
        return task
    
    @staticmethod
    def update_task(task_id, data, user_id, user_role):
        """Actualizar tarea con validación de permisos"""
        task = TaskService.get_task_by_id(task_id, user_id, user_role)
        
        if not task:
            return None
        
        # Obtener el usuario para validación de permisos de checklist
        user = User.query.get(user_id)
        if not user:
            return None
        
        # Validar permisos de checklist si se está modificando
        if 'checklist' in data:
            old_checklist = task.checklist or []
            new_checklist = data['checklist']
            
            if not TaskService.validate_checklist_modification(user, old_checklist, new_checklist):
                raise PermissionError('Solo el Owner puede modificar la estructura del checklist')
        
        # Employee puede cambiar status y checklist (solo toggle)
        if user_role == 'EMPLOYEE':
            # Permitir cambio de status
            if 'status' in data:
                task.status = data['status']
            
            # Permitir cambio de checklist (solo toggle, ya validado arriba)
            if 'checklist' in data:
                task.checklist = data['checklist']
            
            task.updated_at = datetime.utcnow()
            return task
        
        # Owner puede cambiar todo
        for key, value in data.items():
            if hasattr(task, key):
                setattr(task, key, value)
        
        task.updated_at = datetime.utcnow()
        
        return task
    
    @staticmethod
    def delete_task(task_id, user_id):
        """Eliminar tarea (solo Owner)"""
        task = Task.query.get(task_id)
        
        if not task:
            return False
        
        # Verificar que el usuario sea el owner del proyecto
        project = Project.query.get(task.project_id)
        if not project or project.owner_id != user_id:
            return False
        
        db.session.delete(task)
        return True
    
    @staticmethod
    def list_tasks(project_id, filters, user_id, user_role):
        """Listar tareas con filtros"""
        query = Task.query.filter_by(project_id=project_id)
        
        # Filtro por rol
        if user_role == 'EMPLOYEE':
            query = query.filter_by(assigned_to=user_id)
        
        # Filtros opcionales
        if filters.get('status'):
            query = query.filter_by(status=filters['status'])
        
        if filters.get('priority'):
            query = query.filter_by(priority=filters['priority'])
        
        if filters.get('assigned_to'):
            query = query.filter_by(assigned_to=filters['assigned_to'])
        
        # Búsqueda por texto
        if filters.get('search'):
            search = f"%{filters['search']}%"
            query = query.filter(
                or_(
                    Task.title.ilike(search),
                    Task.description.ilike(search)
                )
            )
        
        # Ordenamiento
        sort_by = filters.get('sort_by', 'created_at')
        sort_order = filters.get('sort_order', 'desc')
        
        if hasattr(Task, sort_by):
            if sort_order == 'asc':
                query = query.order_by(getattr(Task, sort_by).asc())
            else:
                query = query.order_by(getattr(Task, sort_by).desc())
        
        return query.all()
    
    @staticmethod
    def get_my_tasks(user_id):
        """Obtener tareas asignadas al usuario"""
        # Obtener project_id del usuario
        membership = Membership.query.filter_by(
            user_id=user_id,
            status='active'
        ).first()
        
        if not membership:
            return []
        
        tasks = Task.query.filter_by(
            project_id=membership.project_id,
            assigned_to=user_id
        ).order_by(Task.created_at.desc()).all()
        
        return tasks
    
    @staticmethod
    def assign_task(task_id, assignee_id, assigner_id):
        """Asignar tarea a un usuario"""
        task = Task.query.get(task_id)
        
        if not task:
            return None, 'Tarea no encontrada'
        
        # Verificar que el assigner sea el owner
        project = Project.query.get(task.project_id)
        if not project or project.owner_id != assigner_id:
            return None, 'No tienes permisos para asignar tareas'
        
        # Verificar que el assignee sea miembro del proyecto
        membership = Membership.query.filter_by(
            user_id=assignee_id,
            project_id=task.project_id,
            status='active'
        ).first()
        
        if not membership:
            return None, 'El usuario no es miembro del proyecto'
        
        old_assigned_to = task.assigned_to
        task.assigned_to = assignee_id
        task.updated_at = datetime.utcnow()
        
        return task, old_assigned_to
    
    @staticmethod
    def change_status(task_id, new_status, user_id, user_role):
        """Cambiar estado de tarea"""
        task = TaskService.get_task_by_id(task_id, user_id, user_role)
        
        if not task:
            return None
        
        old_status = task.status
        task.status = new_status
        task.updated_at = datetime.utcnow()
        
        # Si se marca como done, guardar fecha de completado
        if new_status == 'done' and old_status != 'done':
            task.completed_at = datetime.utcnow()
        
        return task
    
    @staticmethod
    def can_user_access_task(task_id, user_id, user_role):
        """Verificar si el usuario puede acceder a la tarea"""
        task = Task.query.get(task_id)
        
        if not task:
            return False
        
        if user_role == 'OWNER':
            project = Project.query.get(task.project_id)
            return project and project.owner_id == user_id
        
        elif user_role == 'EMPLOYEE':
            return task.assigned_to == user_id
        
        return False
    
    @staticmethod
    def can_user_modify_task(task_id, user_id, user_role):
        """Verificar si el usuario puede modificar la tarea"""
        return TaskService.can_user_access_task(task_id, user_id, user_role)
    
    @staticmethod
    def get_project_stats(project_id):
        """Obtener estadísticas del proyecto"""
        tasks = Task.query.filter_by(project_id=project_id).all()
        
        stats = {
            'total': len(tasks),
            'by_status': {
                'pending': 0,
                'in_progress': 0,
                'blocked': 0,
                'done': 0
            },
            'by_priority': {
                'low': 0,
                'medium': 0,
                'high': 0,
                'urgent': 0
            },
            'overdue': 0,
            'due_this_week': 0,
            'unassigned': 0
        }
        
        now = datetime.utcnow()
        week_from_now = datetime.utcnow().replace(hour=23, minute=59, second=59)
        from datetime import timedelta
        week_from_now = now + timedelta(days=7)
        
        for task in tasks:
            # Por estado
            stats['by_status'][task.status] += 1
            
            # Por prioridad
            stats['by_priority'][task.priority] += 1
            
            # Vencidas
            if task.due_date and task.due_date < now and task.status != 'done':
                stats['overdue'] += 1
            
            # Vencen esta semana
            if task.due_date and now <= task.due_date <= week_from_now and task.status != 'done':
                stats['due_this_week'] += 1
            
            # Sin asignar
            if not task.assigned_to:
                stats['unassigned'] += 1
        
        return stats
    
    @staticmethod
    def get_user_stats(user_id):
        """Obtener estadísticas del usuario"""
        tasks = Task.query.filter_by(assigned_to=user_id).all()
        
        stats = {
            'total': len(tasks),
            'by_status': {
                'pending': 0,
                'in_progress': 0,
                'blocked': 0,
                'done': 0
            },
            'overdue': 0,
            'due_this_week': 0
        }
        
        now = datetime.utcnow()
        from datetime import timedelta
        week_from_now = now + timedelta(days=7)
        
        for task in tasks:
            stats['by_status'][task.status] += 1
            
            if task.due_date and task.due_date < now and task.status != 'done':
                stats['overdue'] += 1
            
            if task.due_date and now <= task.due_date <= week_from_now and task.status != 'done':
                stats['due_this_week'] += 1
        
        return stats
    
    @staticmethod
    def create_task_notification(task, notification_type, user_id, message):
        """Crear notificación relacionada con tarea"""
        notification = Notification(
            user_id=user_id,
            project_id=task.project_id,
            type=notification_type,
            message=message,
            entity_type='task',
            entity_id=task.id
        )
        db.session.add(notification)
        return notification
