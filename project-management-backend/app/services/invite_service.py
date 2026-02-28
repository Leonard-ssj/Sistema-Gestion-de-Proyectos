import secrets
from datetime import datetime, timedelta
from app import db
from app.models import Invite, Membership, User

class InviteService:
    
    @staticmethod
    def generate_token() -> str:
        """Generar token único para invitación"""
        return secrets.token_urlsafe(32)
    
    @staticmethod
    def count_active_employees(project_id: str) -> int:
        """Contar employees activos en un proyecto"""
        return Membership.query.filter_by(
            project_id=project_id,
            role='EMPLOYEE',
            status='active'
        ).count()
    
    @staticmethod
    def check_employee_limit(project_id: str) -> tuple[bool, str]:
        """
        Verificar límite de 10 employees por proyecto (RF-024)
        Cuenta employees activos + invitaciones pendientes
        Retorna: (puede_invitar, mensaje_error)
        """
        # Contar employees activos
        active_count = InviteService.count_active_employees(project_id)
        
        # Contar invitaciones pendientes
        pending_invites = InviteService.check_pending_invites(project_id)
        
        # Total = activos + pendientes
        total_count = active_count + pending_invites
        
        if total_count >= 10:
            return False, f'El proyecto ha alcanzado el límite de 10 employees ({active_count} activos + {pending_invites} pendientes = {total_count}/10)'
        
        return True, ''
    
    @staticmethod
    def check_pending_invites(project_id: str) -> int:
        """Contar invitaciones pendientes"""
        return Invite.query.filter_by(
            project_id=project_id,
            status='pending'
        ).count()
    
    @staticmethod
    def is_email_already_invited(project_id: str, email: str) -> bool:
        """Verificar si el email ya tiene invitación pendiente"""
        existing_invite = Invite.query.filter_by(
            project_id=project_id,
            email=email,
            status='pending'
        ).first()
        
        return existing_invite is not None
    
    @staticmethod
    def is_email_already_member(project_id: str, email: str) -> bool:
        """Verificar si el email ya es miembro del proyecto"""
        user = User.query.filter_by(email=email).first()
        
        if not user:
            return False
        
        membership = Membership.query.filter_by(
            project_id=project_id,
            user_id=user.id,
            status='active'
        ).first()
        
        return membership is not None
    
    @staticmethod
    def create_invite(project_id: str, email: str, invited_by: str, enrichment_data: dict = None) -> Invite:
        """Crear nueva invitación con datos enriquecidos opcionales"""
        token = InviteService.generate_token()
        expires_at = datetime.utcnow() + timedelta(days=7)
        
        invite = Invite(
            project_id=project_id,
            email=email.strip().lower(),
            token=token,
            invited_by=invited_by,
            status='pending',
            expires_at=expires_at
        )
        
        # Agregar datos enriquecidos si se proporcionan
        if enrichment_data:
            invite.job_title = enrichment_data.get('job_title')
            invite.description = enrichment_data.get('description')
            invite.responsibilities = enrichment_data.get('responsibilities')
            invite.skills = enrichment_data.get('skills')
            invite.shift = enrichment_data.get('shift')
            invite.department = enrichment_data.get('department')
            invite.phone = enrichment_data.get('phone')
        
        db.session.add(invite)
        db.session.commit()
        
        return invite
    
    @staticmethod
    def resend_invite(invite: Invite) -> Invite:
        """Reenviar invitación (nuevo token y nueva fecha de expiración)"""
        invite.token = InviteService.generate_token()
        invite.expires_at = datetime.utcnow() + timedelta(days=7)
        invite.status = 'pending'
        invite.resend_count = (invite.resend_count or 0) + 1
        invite.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return invite
    
    @staticmethod
    def cancel_invite(invite: Invite) -> None:
        """Cancelar invitación"""
        invite.status = 'cancelled'
        invite.updated_at = datetime.utcnow()
        
        db.session.commit()
    
    @staticmethod
    def get_invite_summary(invite: Invite) -> dict:
        """Obtener resumen de invitación para respuesta"""
        return {
            'id': invite.id,
            'email': invite.email,
            'token': invite.token,
            'status': invite.status,
            'invited_by': invite.invited_by,
            'resend_count': invite.resend_count or 0,
            'job_title': invite.job_title,
            'description': invite.description,
            'responsibilities': invite.responsibilities,
            'skills': invite.skills,
            'shift': invite.shift,
            'department': invite.department,
            'phone': invite.phone,
            'expires_at': invite.expires_at.isoformat() if invite.expires_at else None,
            'created_at': invite.created_at.isoformat() if invite.created_at else None,
            'accepted_at': invite.accepted_at.isoformat() if invite.accepted_at else None,
            'is_expired': invite.is_expired()
        }
