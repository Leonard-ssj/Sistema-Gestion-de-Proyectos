# Rutas de la API

from .auth import auth_bp
from .projects import projects_bp
from .invites import invites_bp
from .members import members_bp
from .tasks import tasks_bp
from .notifications import notifications_bp
from .comments import comments_bp
from .admin import admin_bp

__all__ = ['auth_bp', 'projects_bp', 'invites_bp', 'members_bp', 'tasks_bp', 'notifications_bp', 'comments_bp', 'admin_bp']
