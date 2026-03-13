from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from marshmallow import ValidationError
from datetime import datetime
from app import db
from app.models import User, Project, Membership, Sprint, Task, AuditLog
from app.utils import get_current_user_id
from app.schemas import SprintCreateSchema, SprintUpdateSchema, SprintSchema


sprints_bp = Blueprint('sprints', __name__, url_prefix='/api/sprints')

sprint_create_schema = SprintCreateSchema()
sprint_update_schema = SprintUpdateSchema()
sprint_schema = SprintSchema()


def _get_project_for_user(user_id: str, role: str):
    if role == 'OWNER':
        user = User.query.get(user_id)
        return user.owned_project if user else None
    if role == 'EMPLOYEE':
        membership = Membership.query.filter_by(user_id=user_id, status='active').first()
        if membership:
            return Project.query.get(membership.project_id)
    return None


def _auto_close_expired_sprints(project_id: str):
    now = datetime.utcnow()
    expired = Sprint.query.filter(
        Sprint.project_id == project_id,
        Sprint.status == 'active',
        Sprint.end_date < now
    ).all()
    if not expired:
        return
    for s in expired:
        s.status = 'closed'
        s.updated_at = now
        Task.query.filter_by(project_id=project_id, sprint_id=s.id).update({'sprint_id': None})
    db.session.commit()


@sprints_bp.route('', methods=['GET'])
@jwt_required()
def list_sprints():
    try:
        user_id = get_current_user_id()
        claims = get_jwt()
        user_role = claims.get('role')

        project = _get_project_for_user(user_id, user_role)
        if not project:
            return jsonify({
                'success': False,
                'error': {'code': 'NO_PROJECT', 'message': 'No tienes un proyecto'}
            }), 404

        _auto_close_expired_sprints(project.id)

        status = request.args.get('status')
        query = Sprint.query.filter_by(project_id=project.id)
        if status:
            query = query.filter_by(status=status)

        sprints = query.order_by(Sprint.start_date.desc()).all()
        return jsonify({
            'success': True,
            'data': {'sprints': sprint_schema.dump(sprints, many=True)}
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': {'code': 'SERVER_ERROR', 'message': str(e)}
        }), 500


@sprints_bp.route('', methods=['POST'])
@jwt_required()
def create_sprint():
    try:
        user_id = get_current_user_id()
        claims = get_jwt()
        user_role = claims.get('role')

        if user_role != 'OWNER':
            return jsonify({
                'success': False,
                'error': {'code': 'FORBIDDEN', 'message': 'Solo los Owners pueden crear sprints'}
            }), 403

        user = User.query.get(user_id)
        project = user.owned_project if user else None
        if not project:
            return jsonify({
                'success': False,
                'error': {'code': 'NO_PROJECT', 'message': 'No tienes un proyecto'}
            }), 404

        if not project.sprint_enabled:
            return jsonify({
                'success': False,
                'error': {'code': 'SPRINTS_DISABLED', 'message': 'Los sprints no están habilitados para este proyecto'}
            }), 400

        data = request.get_json()
        try:
            validated = sprint_create_schema.load(data or {})
        except ValidationError as err:
            return jsonify({
                'success': False,
                'error': {'code': 'VALIDATION_ERROR', 'message': 'Errores de validación', 'details': err.messages}
            }), 400

        existing_name = Sprint.query.filter_by(project_id=project.id, name=validated['name']).first()
        if existing_name:
            return jsonify({
                'success': False,
                'error': {'code': 'DUPLICATE_SPRINT_NAME', 'message': 'Ya existe un sprint con ese nombre'}
            }), 409

        _auto_close_expired_sprints(project.id)

        if validated.get('status') == 'active':
            existing_active = Sprint.query.filter_by(project_id=project.id, status='active').first()
            if existing_active:
                return jsonify({
                    'success': False,
                    'error': {'code': 'ACTIVE_SPRINT_EXISTS', 'message': 'Ya existe un sprint activo'}
                }), 400

        sprint = Sprint(
            project_id=project.id,
            name=validated['name'],
            color=validated.get('color', 'blue'),
            start_date=validated['start_date'],
            end_date=validated['end_date'],
            status=validated.get('status', 'planned')
        )

        db.session.add(sprint)

        audit_log = AuditLog(
            user_id=user_id,
            project_id=project.id,
            action='sprint_created',
            entity_type='sprint',
            entity_id=sprint.id,
            details={'name': sprint.name, 'status': sprint.status, 'color': sprint.color},
            ip_address=request.remote_addr,
            user_agent=request.headers.get('User-Agent')
        )
        db.session.add(audit_log)
        db.session.commit()

        return jsonify({
            'success': True,
            'data': {'sprint': sprint_schema.dump(sprint)}
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': {'code': 'SERVER_ERROR', 'message': str(e)}
        }), 500


@sprints_bp.route('/<sprint_id>', methods=['PATCH'])
@jwt_required()
def update_sprint(sprint_id: str):
    try:
        user_id = get_current_user_id()
        claims = get_jwt()
        user_role = claims.get('role')

        if user_role != 'OWNER':
            return jsonify({
                'success': False,
                'error': {'code': 'FORBIDDEN', 'message': 'Solo los Owners pueden actualizar sprints'}
            }), 403

        user = User.query.get(user_id)
        project = user.owned_project if user else None
        if not project:
            return jsonify({
                'success': False,
                'error': {'code': 'NO_PROJECT', 'message': 'No tienes un proyecto'}
            }), 404

        sprint = Sprint.query.get(sprint_id)
        if not sprint or sprint.project_id != project.id:
            return jsonify({
                'success': False,
                'error': {'code': 'NOT_FOUND', 'message': 'Sprint no encontrado'}
            }), 404

        _auto_close_expired_sprints(project.id)

        data = request.get_json()
        try:
            validated = sprint_update_schema.load(data or {})
        except ValidationError as err:
            return jsonify({
                'success': False,
                'error': {'code': 'VALIDATION_ERROR', 'message': 'Errores de validación', 'details': err.messages}
            }), 400

        if validated.get('status') == 'active' and sprint.status != 'active':
            existing_active = Sprint.query.filter_by(project_id=project.id, status='active').first()
            if existing_active and existing_active.id != sprint.id:
                return jsonify({
                    'success': False,
                    'error': {'code': 'ACTIVE_SPRINT_EXISTS', 'message': 'Ya existe un sprint activo'}
                }), 400

        for key, value in validated.items():
            if hasattr(sprint, key):
                setattr(sprint, key, value)

        sprint.updated_at = datetime.utcnow()
        if validated.get('status') == 'closed':
            Task.query.filter_by(project_id=project.id, sprint_id=sprint.id).update({'sprint_id': None})

        audit_log = AuditLog(
            user_id=user_id,
            project_id=project.id,
            action='sprint_updated',
            entity_type='sprint',
            entity_id=sprint.id,
            details=validated,
            ip_address=request.remote_addr,
            user_agent=request.headers.get('User-Agent')
        )
        db.session.add(audit_log)
        db.session.commit()

        return jsonify({
            'success': True,
            'data': {'sprint': sprint_schema.dump(sprint)}
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': {'code': 'SERVER_ERROR', 'message': str(e)}
        }), 500


@sprints_bp.route('/<sprint_id>', methods=['GET'])
@jwt_required()
def get_sprint(sprint_id: str):
    try:
        user_id = get_current_user_id()
        claims = get_jwt()
        user_role = claims.get('role')

        project = _get_project_for_user(user_id, user_role)
        if not project:
            return jsonify({
                'success': False,
                'error': {'code': 'NO_PROJECT', 'message': 'No tienes un proyecto'}
            }), 404

        _auto_close_expired_sprints(project.id)

        sprint = Sprint.query.get(sprint_id)
        if not sprint or sprint.project_id != project.id:
            return jsonify({
                'success': False,
                'error': {'code': 'NOT_FOUND', 'message': 'Sprint no encontrado'}
            }), 404

        return jsonify({
            'success': True,
            'data': {'sprint': sprint_schema.dump(sprint)}
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': {'code': 'SERVER_ERROR', 'message': str(e)}
        }), 500


@sprints_bp.route('/<sprint_id>', methods=['DELETE'])
@jwt_required()
def delete_sprint(sprint_id: str):
    try:
        user_id = get_current_user_id()
        claims = get_jwt()
        user_role = claims.get('role')

        if user_role != 'OWNER':
            return jsonify({
                'success': False,
                'error': {'code': 'FORBIDDEN', 'message': 'Solo los Owners pueden eliminar sprints'}
            }), 403

        user = User.query.get(user_id)
        project = user.owned_project if user else None
        if not project:
            return jsonify({
                'success': False,
                'error': {'code': 'NO_PROJECT', 'message': 'No tienes un proyecto'}
            }), 404

        sprint = Sprint.query.get(sprint_id)
        if not sprint or sprint.project_id != project.id:
            return jsonify({
                'success': False,
                'error': {'code': 'NOT_FOUND', 'message': 'Sprint no encontrado'}
            }), 404

        Task.query.filter_by(project_id=project.id, sprint_id=sprint.id).update({'sprint_id': None})

        audit_log = AuditLog(
            user_id=user_id,
            project_id=project.id,
            action='sprint_deleted',
            entity_type='sprint',
            entity_id=sprint.id,
            details={'name': sprint.name},
            ip_address=request.remote_addr,
            user_agent=request.headers.get('User-Agent')
        )
        db.session.add(audit_log)
        db.session.delete(sprint)
        db.session.commit()

        return jsonify({'success': True, 'data': {'deleted': True}}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': {'code': 'SERVER_ERROR', 'message': str(e)}
        }), 500
