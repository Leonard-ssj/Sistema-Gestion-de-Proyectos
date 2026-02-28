"""
Admin Service
Lógica de negocio para el panel de administración (SUPERADMIN)
"""

from app import db
from app.models import User, Project, Task, Membership, AuditLog
from sqlalchemy import func, desc
from datetime import datetime, timedelta


class AdminService:
    """Servicio para operaciones de administración"""
    
    @staticmethod
    def get_all_users(page=1, per_page=20, search=None, status=None):
        """
        Obtener todos los usuarios con paginación y filtros
        
        Args:
            page: Número de página
            per_page: Usuarios por página
            search: Búsqueda por nombre o email
            status: Filtrar por estado (active, inactive)
        
        Returns:
            dict: Usuarios paginados con metadata
        """
        query = User.query
        
        # Filtro de búsqueda
        if search:
            search_filter = f"%{search}%"
            query = query.filter(
                db.or_(
                    User.name.ilike(search_filter),
                    User.email.ilike(search_filter)
                )
            )
        
        # Filtro de estado
        if status:
            query = query.filter_by(status=status)
        
        # Ordenar por fecha de creación (más recientes primero)
        query = query.order_by(desc(User.created_at))
        
        # Paginación
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        
        return {
            'users': pagination.items,
            'total': pagination.total,
            'page': page,
            'per_page': per_page,
            'total_pages': pagination.pages,
            'has_next': pagination.has_next,
            'has_prev': pagination.has_prev
        }
    
    @staticmethod
    def get_all_projects(page=1, per_page=20, search=None, status=None):
        """
        Obtener todos los proyectos con paginación y filtros
        
        Args:
            page: Número de página
            per_page: Proyectos por página
            search: Búsqueda por nombre
            status: Filtrar por estado (active, inactive)
        
        Returns:
            dict: Proyectos paginados con metadata
        """
        query = Project.query
        
        # Filtro de búsqueda
        if search:
            search_filter = f"%{search}%"
            query = query.filter(Project.name.ilike(search_filter))
        
        # Filtro de estado
        if status:
            query = query.filter_by(status=status)
        
        # Ordenar por fecha de creación (más recientes primero)
        query = query.order_by(desc(Project.created_at))
        
        # Paginación
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        
        return {
            'projects': pagination.items,
            'total': pagination.total,
            'page': page,
            'per_page': per_page,
            'total_pages': pagination.pages,
            'has_next': pagination.has_next,
            'has_prev': pagination.has_prev
        }
    
    @staticmethod
    def get_audit_logs(page=1, per_page=50, user_id=None, action=None, days=7):
        """
        Obtener logs de auditoría con filtros
        
        Args:
            page: Número de página
            per_page: Logs por página
            user_id: Filtrar por usuario
            action: Filtrar por acción
            days: Últimos N días (default: 7)
        
        Returns:
            dict: Logs paginados con metadata
        """
        query = AuditLog.query
        
        # Filtro de fecha (últimos N días)
        if days:
            date_from = datetime.utcnow() - timedelta(days=days)
            query = query.filter(AuditLog.created_at >= date_from)
        
        # Filtro de usuario
        if user_id:
            query = query.filter_by(user_id=user_id)
        
        # Filtro de acción
        if action:
            query = query.filter(AuditLog.action.ilike(f"%{action}%"))
        
        # Ordenar por fecha (más recientes primero)
        query = query.order_by(desc(AuditLog.created_at))
        
        # Paginación
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        
        return {
            'logs': pagination.items,
            'total': pagination.total,
            'page': page,
            'per_page': per_page,
            'total_pages': pagination.pages,
            'has_next': pagination.has_next,
            'has_prev': pagination.has_prev
        }
    
    @staticmethod
    def update_user_status(user_id, new_status):
        """
        Activar o desactivar un usuario
        
        Args:
            user_id: ID del usuario
            new_status: 'active' o 'disabled'
        
        Returns:
            User: Usuario actualizado
        """
        user = User.query.get_or_404(user_id)
        
        # No permitir desactivar SUPERADMIN
        if user.role == 'SUPERADMIN' and new_status == 'disabled':
            raise ValueError('No se puede desactivar un SUPERADMIN')
        
        user.status = new_status
        user.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return user
    
    @staticmethod
    def update_project_status(project_id, new_status):
        """
        Activar o desactivar un proyecto
        
        Args:
            project_id: ID del proyecto
            new_status: 'active' o 'disabled'
        
        Returns:
            Project: Proyecto actualizado
        """
        project = Project.query.get_or_404(project_id)
        
        project.status = new_status
        project.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return project
    
    @staticmethod
    def get_global_stats():
        """
        Obtener estadísticas globales de la plataforma
        
        Returns:
            dict: Estadísticas globales
        """
        # Contar usuarios
        total_users = User.query.count()
        active_users = User.query.filter_by(status='active').count()
        users_by_role = db.session.query(
            User.role,
            func.count(User.id)
        ).group_by(User.role).all()
        
        # Contar proyectos
        total_projects = Project.query.count()
        active_projects = Project.query.filter_by(status='active').count()
        
        # Contar tareas
        total_tasks = Task.query.count()
        tasks_by_status = db.session.query(
            Task.status,
            func.count(Task.id)
        ).group_by(Task.status).all()
        
        # Contar membresías
        total_memberships = Membership.query.count()
        active_memberships = Membership.query.filter_by(status='active').count()
        
        # Usuarios nuevos (últimos 30 días)
        date_30_days_ago = datetime.utcnow() - timedelta(days=30)
        new_users_30d = User.query.filter(
            User.created_at >= date_30_days_ago
        ).count()
        
        # Proyectos nuevos (últimos 30 días)
        new_projects_30d = Project.query.filter(
            Project.created_at >= date_30_days_ago
        ).count()
        
        # Tareas creadas (últimos 30 días)
        new_tasks_30d = Task.query.filter(
            Task.created_at >= date_30_days_ago
        ).count()
        
        return {
            'users': {
                'total': total_users,
                'active': active_users,
                'inactive': total_users - active_users,
                'by_role': {role: count for role, count in users_by_role},
                'new_last_30_days': new_users_30d
            },
            'projects': {
                'total': total_projects,
                'active': active_projects,
                'inactive': total_projects - active_projects,
                'new_last_30_days': new_projects_30d
            },
            'tasks': {
                'total': total_tasks,
                'by_status': {status: count for status, count in tasks_by_status},
                'new_last_30_days': new_tasks_30d
            },
            'memberships': {
                'total': total_memberships,
                'active': active_memberships,
                'inactive': total_memberships - active_memberships
            }
        }
    
    @staticmethod
    def get_health_check():
        """
        Health check del sistema
        
        Returns:
            dict: Estado del sistema
        """
        try:
            # Verificar conexión a la base de datos
            db.session.execute(db.text('SELECT 1'))
            db_status = 'healthy'
            db_message = 'Database connection OK'
        except Exception as e:
            db_status = 'unhealthy'
            db_message = f'Database error: {str(e)}'
        
        # Información del sistema
        return {
            'status': db_status,
            'timestamp': datetime.utcnow().isoformat(),
            'database': {
                'status': db_status,
                'message': db_message
            },
            'version': '1.0.0'
        }
