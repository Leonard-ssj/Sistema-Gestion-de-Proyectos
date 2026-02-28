import bcrypt
from flask_jwt_extended import create_access_token, create_refresh_token
from app.models import User, Project, Membership, Invite
from app import db


class AuthService:
    
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash password con bcrypt (cost factor 12)"""
        return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt(12)).decode('utf-8')
    
    @staticmethod
    def verify_password(password: str, hashed: str) -> bool:
        """Verificar password con bcrypt"""
        return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
    
    @staticmethod
    def validate_password(password: str) -> tuple[bool, str]:
        """
        Validar fortaleza de password
        Returns: (is_valid, error_message)
        """
        if len(password) < 8:
            return False, 'Password debe tener al menos 8 caracteres'
        
        if not any(c.isupper() for c in password):
            return False, 'Password debe tener al menos una mayúscula'
        
        if not any(c.isdigit() for c in password):
            return False, 'Password debe tener al menos un número'
        
        return True, ''
    
    @staticmethod
    def generate_tokens(user: User) -> dict:
        """
        Generar access y refresh tokens con claims personalizados
        """
        # Datos adicionales en el token
        additional_claims = {
            'email': user.email,
            'role': user.role
        }
        
        # Agregar project_id si es OWNER o EMPLOYEE
        if user.role == 'OWNER' and user.owned_project:
            additional_claims['project_id'] = user.owned_project.id
        elif user.role == 'EMPLOYEE':
            # Obtener project_id de la membresía activa
            membership = Membership.query.filter_by(
                user_id=user.id,
                status='active'
            ).first()
            if membership:
                additional_claims['project_id'] = membership.project_id
        
        access_token = create_access_token(
            identity=user.id,
            additional_claims=additional_claims
        )
        
        refresh_token = create_refresh_token(identity=user.id)
        
        return {
            'access_token': access_token,
            'refresh_token': refresh_token,
            'expires_in': 900  # 15 minutos en segundos
        }
    
    @staticmethod
    def get_redirect_url(user: User) -> str:
        """
        Obtener URL de redirección según rol del usuario
        """
        if user.role == 'OWNER':
            # Verificar si tiene proyecto
            if user.owned_project:
                return '/app/dashboard'
            else:
                return '/app/onboarding'  # Crear proyecto
        elif user.role == 'EMPLOYEE':
            return '/work/my-tasks'
        elif user.role == 'SUPERADMIN':
            return '/admin'
        
        return '/'
    
    @staticmethod
    def get_user_data(user: User) -> dict:
        """
        Obtener datos del usuario para respuesta
        """
        user_data = {
            'id': user.id,
            'email': user.email,
            'name': user.name,
            'role': user.role,
            'avatar': user.avatar,
            'status': user.status,
            'created_at': user.created_at.isoformat() if user.created_at else None
        }
        
        # Agregar project_id si aplica
        if user.role == 'OWNER' and user.owned_project:
            user_data['project_id'] = user.owned_project.id
            user_data['project'] = {
                'id': user.owned_project.id,
                'name': user.owned_project.name,
                'category': user.owned_project.category
            }
        elif user.role == 'EMPLOYEE':
            membership = Membership.query.filter_by(
                user_id=user.id,
                status='active'
            ).first()
            if membership:
                user_data['project_id'] = membership.project_id
                user_data['project'] = {
                    'id': membership.project.id,
                    'name': membership.project.name,
                    'category': membership.project.category
                }
        
        return user_data
