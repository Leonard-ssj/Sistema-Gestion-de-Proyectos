from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity,
    get_jwt,
    create_access_token
)
from marshmallow import ValidationError
from datetime import datetime
from app import db
from app.models import User, Project, Membership, Invite, Notification, AuditLog
from app.services import AuthService
from app.utils import get_current_user_id
from app.schemas import (
    UserRegisterSchema,
    UserLoginSchema,
    UserSchema,
    AcceptInviteSchema
)

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

# Instanciar schemas
user_register_schema = UserRegisterSchema()
user_login_schema = UserLoginSchema()
user_schema = UserSchema()
accept_invite_schema = AcceptInviteSchema()


@auth_bp.route('/register', methods=['POST'])
def register():
    """
    Registrar un nuevo Owner
    RF-002: Registro de Owner
    """
    try:
        data = request.get_json()
        
        # Validar con Marshmallow
        try:
            validated_data = user_register_schema.load(data)
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
        password = validated_data['password']
        name = validated_data['name']
        
        # Verificar que el email no exista
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'EMAIL_EXISTS',
                    'message': 'El email ya está registrado'
                }
            }), 400
        
        # Crear usuario
        password_hash = AuthService.hash_password(password)
        new_user = User(
            email=email,
            password_hash=password_hash,
            name=name,
            role='OWNER',
            status='active'
        )
        
        db.session.add(new_user)
        db.session.commit()
        
        # Generar tokens
        tokens = AuthService.generate_tokens(new_user)
        
        # Crear audit log
        audit_log = AuditLog(
            user_id=new_user.id,
            action='user_registered',
            entity_type='user',
            entity_id=new_user.id,
            ip_address=request.remote_addr,
            user_agent=request.headers.get('User-Agent')
        )
        db.session.add(audit_log)
        db.session.commit()
        
        # Serializar respuesta
        user_data = user_schema.dump(new_user)
        
        return jsonify({
            'success': True,
            'data': {
                'user': user_data,
                **tokens
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': {
                'code': 'SERVER_ERROR',
                'message': str(e)
            }
        }), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Iniciar sesión (todos los roles)
    RF-003: Login multi-rol
    """
    try:
        data = request.get_json()
        
        # Validar con Marshmallow
        try:
            validated_data = user_login_schema.load(data)
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
        password = validated_data['password']
        
        # Buscar usuario
        user = User.query.filter_by(email=email).first()
        
        if not user:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'INVALID_CREDENTIALS',
                    'message': 'Credenciales inválidas'
                }
            }), 401
        
        # Verificar password
        if not AuthService.verify_password(password, user.password_hash):
            return jsonify({
                'success': False,
                'error': {
                    'code': 'INVALID_CREDENTIALS',
                    'message': 'Credenciales inválidas'
                }
            }), 401
        
        # Verificar que el usuario esté activo
        if user.status != 'active':
            return jsonify({
                'success': False,
                'error': {
                    'code': 'USER_DISABLED',
                    'message': 'Usuario desactivado'
                }
            }), 403
        
        # Generar tokens
        tokens = AuthService.generate_tokens(user)
        
        # Obtener URL de redirección
        redirect_url = AuthService.get_redirect_url(user)
        
        # Crear audit log
        audit_log = AuditLog(
            user_id=user.id,
            project_id=user.owned_project.id if user.role == 'OWNER' and user.owned_project else None,
            action='user_login',
            entity_type='user',
            entity_id=user.id,
            ip_address=request.remote_addr,
            user_agent=request.headers.get('User-Agent')
        )
        db.session.add(audit_log)
        db.session.commit()
        
        # Serializar respuesta con datos completos del usuario
        user_data = user_schema.dump(user)
        
        # Agregar proyecto si existe
        project_data = None
        if user.role == 'OWNER' and user.owned_project:
            project_data = {
                'id': user.owned_project.id,
                'name': user.owned_project.name,
                'description': user.owned_project.description,
                'category': user.owned_project.category,
                'owner_id': user.owned_project.owner_id,
                'status': user.owned_project.status,
                'created_at': user.owned_project.created_at.isoformat() if user.owned_project.created_at else None,
                'updated_at': user.owned_project.updated_at.isoformat() if user.owned_project.updated_at else None
            }
        elif user.role == 'EMPLOYEE':
            membership = Membership.query.filter_by(
                user_id=user.id,
                status='active'
            ).first()
            if membership and membership.project:
                project_data = {
                    'id': membership.project.id,
                    'name': membership.project.name,
                    'description': membership.project.description,
                    'category': membership.project.category,
                    'owner_id': membership.project.owner_id,
                    'status': membership.project.status,
                    'created_at': membership.project.created_at.isoformat() if membership.project.created_at else None,
                    'updated_at': membership.project.updated_at.isoformat() if membership.project.updated_at else None
                }
        
        response_data = {
            'user': user_data,
            'redirect_url': redirect_url,
            **tokens
        }
        
        if project_data:
            response_data['project'] = project_data
        
        return jsonify({
            'success': True,
            'data': response_data
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


@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """
    Refrescar access_token
    RF-004: Gestión de sesión (JWT-ready)
    """
    try:
        user_id = get_jwt_identity()
        
        # Buscar usuario
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'USER_NOT_FOUND',
                    'message': 'Usuario no encontrado'
                }
            }), 404
        
        # Verificar que el usuario esté activo
        if user.status != 'active':
            return jsonify({
                'success': False,
                'error': {
                    'code': 'USER_DISABLED',
                    'message': 'Usuario desactivado'
                }
            }), 403
        
        # Generar nuevo access_token
        tokens = AuthService.generate_tokens(user)
        
        return jsonify({
            'success': True,
            'data': {
                'access_token': tokens['access_token'],
                'expires_in': tokens['expires_in']
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


@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """
    Cerrar sesión
    RNF-012: Logout seguro
    """
    try:
        user_id = get_jwt_identity()
        
        # Crear audit log
        audit_log = AuditLog(
            user_id=user_id,
            action='user_logout',
            entity_type='user',
            entity_id=user_id,
            ip_address=request.remote_addr,
            user_agent=request.headers.get('User-Agent')
        )
        db.session.add(audit_log)
        db.session.commit()
        
        # TODO: Agregar refresh_token a blacklist si se implementa
        
        return jsonify({
            'success': True,
            'message': 'Sesión cerrada exitosamente'
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


@auth_bp.route('/accept-invite', methods=['POST'])
def accept_invite():
    """
    Aceptar invitación y crear cuenta Employee
    RF-023: Aceptar invitación (Employee)
    """
    try:
        data = request.get_json()
        
        # Validar con Marshmallow
        try:
            validated_data = accept_invite_schema.load(data)
        except ValidationError as err:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'VALIDATION_ERROR',
                    'message': 'Errores de validación',
                    'details': err.messages
                }
            }), 400
        
        token = validated_data['token']
        password = validated_data['password']
        name = validated_data['name']
        
        # Buscar invitación
        invite = Invite.query.filter_by(token=token).first()
        
        if not invite:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'INVALID_TOKEN',
                    'message': 'Token de invitación inválido'
                }
            }), 400
        
        # Verificar que esté pendiente
        if invite.status != 'pending':
            return jsonify({
                'success': False,
                'error': {
                    'code': 'INVITE_ALREADY_USED',
                    'message': 'La invitación ya fue utilizada'
                }
            }), 400
        
        # Verificar que no esté expirada
        if invite.is_expired():
            invite.status = 'expired'
            db.session.commit()
            return jsonify({
                'success': False,
                'error': {
                    'code': 'INVITE_EXPIRED',
                    'message': 'La invitación ha expirado'
                }
            }), 400
        
        # Verificar límite de 10 employees (RF-024)
        active_employees = Membership.query.filter_by(
            project_id=invite.project_id,
            role='EMPLOYEE',
            status='active'
        ).count()
        
        if active_employees >= 10:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'EMPLOYEE_LIMIT_REACHED',
                    'message': 'El proyecto ha alcanzado el límite de 10 employees'
                }
            }), 400
        
        # Verificar que el email no exista
        existing_user = User.query.filter_by(email=invite.email).first()
        if existing_user:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'EMAIL_EXISTS',
                    'message': 'El email ya está registrado'
                }
            }), 409
        
        # Crear usuario Employee con datos enriquecidos de la invitación
        password_hash = AuthService.hash_password(password)
        new_user = User(
            email=invite.email,
            password_hash=password_hash,
            name=name,
            role='EMPLOYEE',
            status='active',
            job_title=invite.job_title,
            description=invite.description,
            responsibilities=invite.responsibilities,
            skills=invite.skills,
            shift=invite.shift,
            department=invite.department,
            phone=invite.phone
        )
        db.session.add(new_user)
        db.session.flush()  # Para obtener el ID
        
        # Crear membership
        membership = Membership(
            user_id=new_user.id,
            project_id=invite.project_id,
            role='EMPLOYEE',
            status='active'
        )
        db.session.add(membership)
        
        # Actualizar invitación
        invite.status = 'accepted'
        invite.accepted_at = datetime.utcnow()
        
        # Crear notificación para el owner
        project = Project.query.get(invite.project_id)
        notification = Notification(
            user_id=project.owner_id,
            project_id=invite.project_id,
            type='invite_accepted',
            message=f'{name} ha aceptado la invitación y se unió al proyecto',
            entity_type='invite',
            entity_id=invite.id
        )
        db.session.add(notification)
        
        # Crear audit log
        audit_log = AuditLog(
            user_id=new_user.id,
            project_id=invite.project_id,
            action='invite_accepted',
            entity_type='invite',
            entity_id=invite.id,
            details={'invited_by': invite.invited_by},
            ip_address=request.remote_addr,
            user_agent=request.headers.get('User-Agent')
        )
        db.session.add(audit_log)
        
        db.session.commit()
        
        # Generar tokens
        tokens = AuthService.generate_tokens(new_user)
        
        # Serializar respuesta
        user_data = user_schema.dump(new_user)
        redirect_url = AuthService.get_redirect_url(new_user)
        
        # Agregar proyecto a la respuesta
        project_data = {
            'id': project.id,
            'name': project.name,
            'description': project.description,
            'category': project.category,
            'owner_id': project.owner_id,
            'status': project.status,
            'created_at': project.created_at.isoformat() if project.created_at else None,
            'updated_at': project.updated_at.isoformat() if project.updated_at else None
        }
        
        return jsonify({
            'success': True,
            'data': {
                'user': user_data,
                'project': project_data,
                'redirect_url': redirect_url,
                **tokens
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': {
                'code': 'SERVER_ERROR',
                'message': str(e)
            }
        }), 500


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_me():
    """
    Obtener datos del usuario actual
    """
    try:
        user_id = get_current_user_id()
        
        # Buscar usuario
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'USER_NOT_FOUND',
                    'message': 'Usuario no encontrado'
                }
            }), 404
        
        # Serializar respuesta
        user_data = user_schema.dump(user)
        
        return jsonify({
            'success': True,
            'data': {
                'user': user_data
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
