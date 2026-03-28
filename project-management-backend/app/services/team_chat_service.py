from app import db
from app.models.team_message import TeamMessage
from app.models.project import Project
from app.models.membership import Membership
from app.models.user import User
from app.models.notification import Notification

class TeamChatService:
    @staticmethod
    def _check_access(project_id, user_id, user_role):
        """
        Verifica si el usuario tiene acceso al proyecto (es Owner o Miembro activo).
        """
        project = Project.query.get(project_id)
        if not project:
            return False, 'PROJECT_NOT_FOUND'
            
        role_upper = str(user_role).upper() if user_role else ''
        
        if role_upper == 'OWNER':
            if project.owner_id != user_id:
                return False, 'FORBIDDEN'
            return True, None
            
        elif role_upper == 'EMPLOYEE':
            membership = Membership.query.filter_by(
                project_id=project_id,
                user_id=user_id,
                status='active'
            ).first()
            if not membership:
                return False, 'FORBIDDEN'
            if not getattr(membership, 'chat_enabled', True):
                return False, 'CHAT_DISABLED'
            return True, None
            
        return False, 'FORBIDDEN'

    @staticmethod
    def get_project_messages(project_id, user_id, user_role, limit=50):
        """
        Obtiene los mensajes del chat de un proyecto.
        """
        has_access, error = TeamChatService._check_access(project_id, user_id, user_role)
        if not has_access:
            return None, error
            
        # Obtener mensajes ordenados por fecha ascendente (los más antiguos primero para renderizarlos de arriba a abajo en el frontend)
        # o limitados para no sobrecargar
        messages = TeamMessage.query.filter_by(project_id=project_id)\
            .order_by(TeamMessage.created_at.desc())\
            .limit(limit).all()
            
        # Revertir para que el orden final sea cronológico
        messages.reverse()
        
        # Formatear el resultado e incluir info del usuario y de la tarea
        result = []
        for msg in messages:
            msg_dict = msg.to_dict()
            msg_dict['user_name'] = msg.user.name if msg.user else 'Desconocido'
            msg_dict['user_email'] = msg.user.email if msg.user else ''
            msg_dict['user_avatar'] = msg.user.avatar if msg.user else None
            msg_dict['task_title'] = msg.task.title if msg.task else None
            msg_dict['mentioned_user_name'] = msg.mentioned_user.name if msg.mentioned_user else None
            result.append(msg_dict)
            
        return result, None

    @staticmethod
    def create_message(project_id, user_id, user_role, content, task_id=None, mentioned_user_id=None):
        """
        Crea un nuevo mensaje en el chat del proyecto.
        """
        has_access, error = TeamChatService._check_access(project_id, user_id, user_role)
        if not has_access:
            return None, error
            
        try:
            message = TeamMessage(
                project_id=project_id,
                user_id=user_id,
                content=content,
                task_id=task_id,
                mentioned_user_id=mentioned_user_id
            )
            db.session.add(message)
            
            # If a user is mentioned, create a notification
            if mentioned_user_id:
                sender = User.query.get(user_id)
                sender_name = sender.name if sender else "Un usuario"
                notification = Notification(
                    user_id=mentioned_user_id,
                    project_id=project_id,
                    type='chat_mention',
                    message=f"{sender_name} te mencionó en el chat del equipo.",
                    entity_type='chat_message',
                    entity_id=message.id
                )
                db.session.add(notification)
                
            # No hacemos commit aquí para dejarlo al route caller (igual que otros servicios)
            return message, None
        except Exception as e:
            return None, str(e)
