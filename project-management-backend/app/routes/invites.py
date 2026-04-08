from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from marshmallow import ValidationError
from datetime import datetime
from app import db
from app.models import Invite, User, Project, Notification, AuditLog
from app.services import InviteService
from app.utils import get_current_user_id
from app.schemas import InviteCreateSchema, InviteSchema

invites_bp = Blueprint('invites', __name__, url_prefix='/api/invites')

# Instanciar schemas
invite_create_schema = InviteCreateSchema()
invite_schema = InviteSchema()


@invites_bp.route('', methods=['POST'])
@jwt_required()
def create_invite():
    """
    Crear invitación (Owner invita Employee)
    RF-022: Invitar employee por email
    RF-024: Límite 10 employees por proyecto
    """
    try:
        user_id = get_current_user_id()
        claims = get_jwt()
        user_role = claims.get('role')
        
        # Solo OWNER puede invitar
        if user_role != 'OWNER':
            return jsonify({
                'success': False,
                'error': {
                    'code': 'FORBIDDEN',
                    'message': 'Solo los Owners pueden invitar employees'
                }
            }), 403
        
        # Buscar usuario
        user = User.query.get(user_id)
        
        if not user or not user.owned_project:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'NO_PROJECT',
                    'message': 'Debes tener un proyecto para invitar employees'
                }
            }), 400
        
        project_id = user.owned_project.id
        
        data = request.get_json()
        print(f"\n[BACKEND DEBUG] Recibiendo POST /api/invites: {data}")
        
        # Validar con Marshmallow
        try:
            print("[BACKEND DEBUG] Validando datos con Marshmallow...")
            validated_data = invite_create_schema.load(data)
        except ValidationError as err:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'VALIDATION_ERROR',
                    'message': 'Errores de validación',
                    'details': err.messages
                }
            }), 400
        
        email = validated_data['email'].lower()
        
        # Extraer datos de enriquecimiento opcionales
        enrichment_data = {
            'job_title': validated_data.get('job_title'),
            'description': validated_data.get('description'),
            'responsibilities': validated_data.get('responsibilities'),
            'skills': validated_data.get('skills'),
            'shift': validated_data.get('shift'),
            'department': validated_data.get('department'),
            'phone': validated_data.get('phone')
        }
        
        # Verificar límite de 10 employees (RF-024)
        can_invite, error_msg = InviteService.check_employee_limit(project_id)
        if not can_invite:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'EMPLOYEE_LIMIT_REACHED',
                    'message': error_msg
                }
            }), 400
        
        # Verificar que el email no esté ya invitado (pending)
        if InviteService.is_email_already_invited(project_id, email):
            return jsonify({
                'success': False,
                'error': {
                    'code': 'ALREADY_INVITED',
                    'message': 'Este email ya tiene una invitación pendiente'
                }
            }), 400
        
        # Verificar que el email no sea ya miembro
        if InviteService.is_email_already_member(project_id, email):
            return jsonify({
                'success': False,
                'error': {
                    'code': 'ALREADY_MEMBER',
                    'message': 'Este email ya es miembro del proyecto'
                }
            }), 400
        
        # Verificar que no sea el email del Owner
        if email == user.email:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'CANNOT_INVITE_SELF',
                    'message': 'No puedes invitarte a ti mismo'
                }
            }), 400
        
        # Crear invitación
        print(f"[BACKEND DEBUG] Llamando a InviteService.create_invite para email: {email}")
        invite = InviteService.create_invite(project_id, email, user_id, enrichment_data)
        print(f"[BACKEND DEBUG] Invitación creada en DB con ID: {invite.id} y Token: {invite.token}")
        
        # Simular envío de email (log en consola)
        frontend_url = current_app.config.get('FRONTEND_URL', 'http://localhost:3000').rstrip('/')
        invite_url = f"{frontend_url}/invite/accept?token={invite.token}"
        print(f"\n{'='*60}")
        print("EMAIL SIMULADO - Invitación enviada")
        print(f"{'='*60}")
        print(f"Para: {email}")
        print(f"De: {user.name} ({user.email})")
        print(f"Proyecto: {user.owned_project.name}")
        print(f"Link de invitación: {invite_url}")
        print(f"Token: {invite.token}")
        print(f"Expira: {invite.expires_at}")
        print(f"{'='*60}\n")
        
        # Crear audit log
        audit_log = AuditLog(
            user_id=user_id,
            project_id=project_id,
            action='invite_created',
            entity_type='invite',
            entity_id=invite.id,
            details={'email': email},
            ip_address=request.remote_addr,
            user_agent=request.headers.get('User-Agent')
        )
        db.session.add(audit_log)
        db.session.commit()
        
        # Preparar respuesta
        invite_data = InviteService.get_invite_summary(invite)
        invite_data['invite_url'] = invite_url
        
        return jsonify({
            'success': True,
            'data': {
                'invite': invite_data,
                'message': 'Invitación creada exitosamente. Email simulado enviado (ver consola del backend).'
            }
        }), 201
        
    except Exception as e:
        print(f"[BACKEND ERROR] Error en create_invite: {str(e)}")
        import traceback
        traceback.print_exc()
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': {
                'code': 'SERVER_ERROR',
                'message': str(e)
            }
        }), 500


@invites_bp.route('', methods=['GET'])
@jwt_required()
def list_invites():
    """
    Listar invitaciones del proyecto (Owner)
    RF-021: Gestión de equipo
    """
    try:
        user_id = get_current_user_id()
        claims = get_jwt()
        user_role = claims.get('role')
        
        # Solo OWNER puede ver invitaciones
        if user_role != 'OWNER':
            return jsonify({
                'success': False,
                'error': {
                    'code': 'FORBIDDEN',
                    'message': 'Solo los Owners pueden ver invitaciones'
                }
            }), 403
        
        # Buscar usuario
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
        
        # Filtro opcional por status
        status_filter = request.args.get('status')
        
        # Construir query
        query = Invite.query.filter_by(project_id=project_id)
        
        if status_filter:
            query = query.filter_by(status=status_filter)
        
        # Ordenar por fecha de creación (más recientes primero)
        invites = query.order_by(Invite.created_at.desc()).all()
        
        # Preparar respuesta
        invites_data = [InviteService.get_invite_summary(invite) for invite in invites]
        
        return jsonify({
            'success': True,
            'data': {
                'invites': invites_data,
                'total': len(invites_data)
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


@invites_bp.route('/<invite_id>', methods=['DELETE'])
@jwt_required()
def cancel_invite(invite_id):
    """
    Cancelar invitación pendiente (Owner)
    RF-021: Gestión de equipo
    """
    try:
        user_id = get_current_user_id()
        claims = get_jwt()
        user_role = claims.get('role')
        
        # Solo OWNER puede cancelar invitaciones
        if user_role != 'OWNER':
            return jsonify({
                'success': False,
                'error': {
                    'code': 'FORBIDDEN',
                    'message': 'Solo los Owners pueden cancelar invitaciones'
                }
            }), 403
        
        # Buscar usuario
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
        
        # Buscar invitación
        invite = Invite.query.get(invite_id)
        
        if not invite:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'INVITE_NOT_FOUND',
                    'message': 'Invitación no encontrada'
                }
            }), 404
        
        # Verificar que la invitación pertenece al proyecto del Owner
        if invite.project_id != project_id:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'FORBIDDEN',
                    'message': 'No tienes acceso a esta invitación'
                }
            }), 403
        
        # Solo se pueden cancelar invitaciones pendientes
        if invite.status != 'pending':
            return jsonify({
                'success': False,
                'error': {
                    'code': 'INVALID_STATUS',
                    'message': f'No se puede cancelar una invitación con status "{invite.status}"'
                }
            }), 400
        
        # Cancelar invitación
        InviteService.cancel_invite(invite)
        
        # Crear audit log
        audit_log = AuditLog(
            user_id=user_id,
            project_id=project_id,
            action='invite_cancelled',
            entity_type='invite',
            entity_id=invite.id,
            details={'email': invite.email},
            ip_address=request.remote_addr,
            user_agent=request.headers.get('User-Agent')
        )
        db.session.add(audit_log)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Invitación cancelada exitosamente'
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


@invites_bp.route('/validate/<token>', methods=['GET'])
def validate_invite_token(token):
    """
    Validar token de invitación (público - no requiere auth)
    Usado en la página de aceptación de invitación
    """
    try:
        # Buscar invitación por token
        invite = Invite.query.filter_by(token=token).first()
        
        if not invite:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'INVALID_TOKEN',
                    'message': 'Token de invitación inválido'
                }
            }), 404
        
        # Verificar si está expirada
        if invite.is_expired():
            return jsonify({
                'success': False,
                'error': {
                    'code': 'EXPIRED',
                    'message': 'Esta invitación ha expirado'
                }
            }), 400
        
        # Verificar si ya fue aceptada
        if invite.status == 'accepted':
            return jsonify({
                'success': False,
                'error': {
                    'code': 'ALREADY_ACCEPTED',
                    'message': 'Esta invitación ya fue aceptada'
                }
            }), 400
        
        # Verificar si fue cancelada
        if invite.status == 'cancelled':
            return jsonify({
                'success': False,
                'error': {
                    'code': 'CANCELLED',
                    'message': 'Esta invitación fue cancelada'
                }
            }), 400
        
        # Obtener información del proyecto
        project = Project.query.get(invite.project_id)
        
        # Preparar respuesta
        return jsonify({
            'success': True,
            'data': {
                'email': invite.email,
                'project_name': project.name if project else 'Proyecto',
                'expires_at': invite.expires_at.isoformat(),
                'status': invite.status
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


@invites_bp.route('/<invite_id>/resend', methods=['POST'])
@jwt_required()
def resend_invite(invite_id):
    """
    Reenviar invitación (Owner)
    RF-022: Invitar employee por email
    """
    try:
        user_id = get_current_user_id()
        claims = get_jwt()
        user_role = claims.get('role')
        
        # Solo OWNER puede reenviar invitaciones
        if user_role != 'OWNER':
            return jsonify({
                'success': False,
                'error': {
                    'code': 'FORBIDDEN',
                    'message': 'Solo los Owners pueden reenviar invitaciones'
                }
            }), 403
        
        # Buscar usuario
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
        
        # Buscar invitación
        invite = Invite.query.get(invite_id)
        
        if not invite:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'INVITE_NOT_FOUND',
                    'message': 'Invitación no encontrada'
                }
            }), 404
        
        # Verificar que la invitación pertenece al proyecto del Owner
        if invite.project_id != project_id:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'FORBIDDEN',
                    'message': 'No tienes acceso a esta invitación'
                }
            }), 403
        
        # Solo se pueden reenviar invitaciones pendientes o expiradas
        if invite.status not in ['pending', 'expired']:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'INVALID_STATUS',
                    'message': f'No se puede reenviar una invitación con status "{invite.status}"'
                }
            }), 400
        
        # Reenviar invitación (nuevo token y nueva fecha)
        invite = InviteService.resend_invite(invite)
        
        # Crear audit log
        audit_log = AuditLog(
            user_id=user_id,
            project_id=project_id,
            action='invite_resent',
            entity_type='invite',
            entity_id=invite.id,
            details={'email': invite.email},
            ip_address=request.remote_addr,
            user_agent=request.headers.get('User-Agent')
        )
        db.session.add(audit_log)
        db.session.commit()
        
        # Simular reenvío de email
        frontend_url = current_app.config.get('FRONTEND_URL', 'http://localhost:3000').rstrip('/')
        invite_url = f"{frontend_url}/invite/accept?token={invite.token}"
        print(f"\n{'='*60}")
        print("EMAIL SIMULADO - Invitación reenviada")
        print(f"{'='*60}")
        print(f"Para: {invite.email}")
        print(f"De: {user.name} ({user.email})")
        print(f"Proyecto: {user.owned_project.name}")
        print(f"Link de invitación: {invite_url}")
        print(f"Nuevo token: {invite.token}")
        print(f"Nueva expiración: {invite.expires_at}")
        print(f"{'='*60}\n")
        
        # Preparar respuesta
        invite_data = InviteService.get_invite_summary(invite)
        invite_data['invite_url'] = invite_url
        
        return jsonify({
            'success': True,
            'data': {
                'invite': invite_data,
                'message': 'Invitación reenviada exitosamente. Email simulado enviado (ver consola del backend).'
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
