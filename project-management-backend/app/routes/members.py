from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from datetime import datetime
from app import db
from app.models import Membership, User, Project, AuditLog
from app.utils import get_current_user_id
from app.schemas import MemberWithUserSchema

members_bp = Blueprint('members', __name__, url_prefix='/api/members')

# Instanciar schema
member_with_user_schema = MemberWithUserSchema(many=True)


@members_bp.route('', methods=['GET'])
@jwt_required()
def list_members():
    """
    Listar miembros del proyecto (Owner)
    RF-021: Gestión de equipo
    """
    try:
        user_id = get_current_user_id()
        claims = get_jwt()
        user_role = claims.get('role')
        
        # Solo OWNER puede ver miembros
        if user_role != 'OWNER':
            return jsonify({
                'success': False,
                'error': {
                    'code': 'FORBIDDEN',
                    'message': 'Solo los Owners pueden ver la lista de miembros'
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
        
        project = user.owned_project
        project_id = project.id
        
        # Obtener membresías del proyecto
        memberships = Membership.query.filter_by(project_id=project_id).all()
        
        # Preparar lista de miembros
        members_data = []
        
        # Agregar Owner primero
        owner_data = {
            'id': user.id,
            'email': user.email,
            'name': user.name,
            'role': 'OWNER',
            'status': user.status,
            'avatar': user.avatar,
            'job_title': user.job_title,
            'description': user.description,
            'responsibilities': user.responsibilities,
            'skills': user.skills,
            'shift': user.shift,
            'department': user.department,
            'phone': user.phone,
            'created_at': user.created_at.isoformat() if user.created_at else None,
            'is_owner': True,
            'membership_id': None
        }
        members_data.append(owner_data)
        
        # Agregar Employees
        for membership in memberships:
            member_user = User.query.get(membership.user_id)
            
            if member_user:
                member_data = {
                    'id': member_user.id,
                    'email': member_user.email,
                    'name': member_user.name,
                    'role': membership.role,
                    'status': membership.status,
                    'avatar': member_user.avatar,
                    'job_title': member_user.job_title,
                    'description': member_user.description,
                    'responsibilities': member_user.responsibilities,
                    'skills': member_user.skills,
                    'shift': member_user.shift,
                    'department': member_user.department,
                    'phone': member_user.phone,
                    'created_at': member_user.created_at.isoformat() if member_user.created_at else None,
                    'joined_at': membership.joined_at.isoformat() if membership.joined_at else None,
                    'is_owner': False,
                    'membership_id': membership.id
                }
                members_data.append(member_data)
        
        # Contar por status
        active_count = sum(1 for m in members_data if m['status'] == 'active')
        inactive_count = sum(1 for m in members_data if m['status'] == 'inactive')
        
        return jsonify({
            'success': True,
            'data': {
                'members': members_data,
                'total': len(members_data),
                'active': active_count,
                'inactive': inactive_count
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


@members_bp.route('/<membership_id>/deactivate', methods=['PATCH'])
@jwt_required()
def deactivate_member(membership_id):
    """
    Desactivar miembro del proyecto (Owner)
    RF-025: Desactivar miembro (soft)
    """
    try:
        user_id = get_current_user_id()
        claims = get_jwt()
        user_role = claims.get('role')
        
        # Solo OWNER puede desactivar miembros
        if user_role != 'OWNER':
            return jsonify({
                'success': False,
                'error': {
                    'code': 'FORBIDDEN',
                    'message': 'Solo los Owners pueden desactivar miembros'
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
        
        # Buscar membresía
        membership = Membership.query.get(membership_id)
        
        if not membership:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'MEMBERSHIP_NOT_FOUND',
                    'message': 'Membresía no encontrada'
                }
            }), 404
        
        # Verificar que la membresía pertenece al proyecto del Owner
        if membership.project_id != project_id:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'FORBIDDEN',
                    'message': 'No tienes acceso a esta membresía'
                }
            }), 403
        
        # No se puede desactivar al Owner (el Owner no tiene membership)
        member_user = User.query.get(membership.user_id)
        if member_user and member_user.role == 'OWNER':
            return jsonify({
                'success': False,
                'error': {
                    'code': 'CANNOT_DEACTIVATE_OWNER',
                    'message': 'No puedes desactivar al Owner del proyecto'
                }
            }), 400
        
        # Verificar que no esté ya inactivo
        if membership.status == 'inactive':
            return jsonify({
                'success': False,
                'error': {
                    'code': 'ALREADY_INACTIVE',
                    'message': 'Este miembro ya está desactivado'
                }
            }), 400
        
        # Desactivar membresía
        membership.status = 'inactive'
        membership.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        # Crear audit log
        audit_log = AuditLog(
            user_id=user_id,
            project_id=project_id,
            action='member_deactivated',
            entity_type='membership',
            entity_id=membership.id,
            details={
                'member_id': membership.user_id,
                'member_email': member_user.email if member_user else None
            },
            ip_address=request.remote_addr,
            user_agent=request.headers.get('User-Agent')
        )
        db.session.add(audit_log)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Miembro desactivado exitosamente'
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



@members_bp.route('/<user_id>/profile', methods=['PATCH'])
@jwt_required()
def update_member_profile(user_id):
    """
    Actualizar perfil de miembro (Owner puede editar datos de empleados)
    RF-021: Gestión de equipo
    """
    try:
        from app.schemas import UserProfileUpdateSchema
        from marshmallow import ValidationError
        
        current_user_id = get_current_user_id()
        claims = get_jwt()
        user_role = claims.get('role')
        
        # Solo OWNER puede actualizar perfiles de miembros
        if user_role != 'OWNER':
            return jsonify({
                'success': False,
                'error': {
                    'code': 'FORBIDDEN',
                    'message': 'Solo los Owners pueden actualizar perfiles de miembros'
                }
            }), 403
        
        # Buscar usuario actual (Owner)
        current_user = User.query.get(current_user_id)
        
        if not current_user or not current_user.owned_project:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'NO_PROJECT',
                    'message': 'No tienes un proyecto'
                }
            }), 400
        
        project_id = current_user.owned_project.id
        
        # Buscar usuario a actualizar
        target_user = User.query.get(user_id)
        
        if not target_user:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'USER_NOT_FOUND',
                    'message': 'Usuario no encontrado'
                }
            }), 404
        
        # Verificar que el usuario pertenece al proyecto
        membership = Membership.query.filter_by(
            user_id=user_id,
            project_id=project_id
        ).first()
        
        if not membership and target_user.id != current_user_id:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'NOT_PROJECT_MEMBER',
                    'message': 'Este usuario no pertenece a tu proyecto'
                }
            }), 403
        
        # Obtener datos del request
        data = request.get_json()
        
        # Validar con schema
        user_profile_update_schema = UserProfileUpdateSchema()
        try:
            validated_data = user_profile_update_schema.load(data)
        except ValidationError as err:
            return jsonify({
                'success': False,
                'error': {
                    'code': 'VALIDATION_ERROR',
                    'message': 'Errores de validación',
                    'details': err.messages
                }
            }), 400
        
        # Actualizar campos
        if 'name' in validated_data:
            target_user.name = validated_data['name']
        if 'job_title' in validated_data:
            target_user.job_title = validated_data['job_title']
        if 'description' in validated_data:
            target_user.description = validated_data['description']
        if 'responsibilities' in validated_data:
            target_user.responsibilities = validated_data['responsibilities']
        if 'skills' in validated_data:
            target_user.skills = validated_data['skills']
        if 'shift' in validated_data:
            target_user.shift = validated_data['shift']
        if 'department' in validated_data:
            target_user.department = validated_data['department']
        if 'phone' in validated_data:
            target_user.phone = validated_data['phone']
        
        target_user.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        # Crear audit log
        audit_log = AuditLog(
            user_id=current_user_id,
            project_id=project_id,
            action='member_profile_updated',
            entity_type='user',
            entity_id=target_user.id,
            details={
                'updated_fields': list(validated_data.keys()),
                'target_user_email': target_user.email
            },
            ip_address=request.remote_addr,
            user_agent=request.headers.get('User-Agent')
        )
        db.session.add(audit_log)
        db.session.commit()
        
        # Preparar respuesta
        user_data = {
            'id': target_user.id,
            'email': target_user.email,
            'name': target_user.name,
            'role': target_user.role,
            'avatar': target_user.avatar,
            'job_title': target_user.job_title,
            'description': target_user.description,
            'responsibilities': target_user.responsibilities,
            'skills': target_user.skills,
            'shift': target_user.shift,
            'department': target_user.department,
            'phone': target_user.phone,
            'status': target_user.status,
            'created_at': target_user.created_at.isoformat() if target_user.created_at else None,
            'updated_at': target_user.updated_at.isoformat() if target_user.updated_at else None
        }
        
        return jsonify({
            'success': True,
            'data': {
                'user': user_data,
                'message': 'Perfil actualizado exitosamente'
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
