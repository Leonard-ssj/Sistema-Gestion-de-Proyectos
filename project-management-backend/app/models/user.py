from datetime import datetime
from app import db
import uuid


class User(db.Model):
    __tablename__ = 'users'
    
    # Primary Key
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Basic Info
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    
    # Role: OWNER, EMPLOYEE, SUPERADMIN
    role = db.Column(db.Enum('OWNER', 'EMPLOYEE', 'SUPERADMIN', name='user_role'), nullable=False)
    
    # Optional fields
    avatar = db.Column(db.String(500), nullable=True)
    
    # Employee profile fields (enrichment data)
    job_title = db.Column(db.String(100), nullable=True)  # Puesto
    description = db.Column(db.Text, nullable=True)  # Descripción
    responsibilities = db.Column(db.Text, nullable=True)  # Responsabilidades
    skills = db.Column(db.Text, nullable=True)  # Habilidades
    shift = db.Column(db.Enum('morning', 'afternoon', 'night', 'flexible', name='employee_shift'), nullable=True)  # Turno
    department = db.Column(db.String(100), nullable=True)  # Departamento
    phone = db.Column(db.String(20), nullable=True)  # Teléfono
    
    # Status: active, disabled
    status = db.Column(db.Enum('active', 'disabled', name='user_status'), default='active', nullable=False)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    # Proyecto que posee (como owner) - 1:1
    owned_project = db.relationship('Project', back_populates='owner', uselist=False, foreign_keys='Project.owner_id')
    
    # Membresías en proyectos - N:M a través de Membership
    memberships = db.relationship('Membership', back_populates='user', cascade='all, delete-orphan')
    
    # Tareas creadas
    created_tasks = db.relationship('Task', back_populates='creator', foreign_keys='Task.created_by')
    
    # Tareas asignadas
    assigned_tasks = db.relationship('Task', back_populates='assignee', foreign_keys='Task.assigned_to')
    
    # Invitaciones enviadas
    sent_invites = db.relationship('Invite', back_populates='inviter', foreign_keys='Invite.invited_by')
    
    # Notificaciones
    notifications = db.relationship('Notification', back_populates='user', cascade='all, delete-orphan')
    
    # Comentarios
    comments = db.relationship('Comment', back_populates='user', cascade='all, delete-orphan')
    
    # Logs de auditoría
    audit_logs = db.relationship('AuditLog', back_populates='user')
    
    def __repr__(self):
        return f'<User {self.email} ({self.role})>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'role': self.role,
            'avatar': self.avatar,
            'job_title': self.job_title,
            'description': self.description,
            'responsibilities': self.responsibilities,
            'skills': self.skills,
            'shift': self.shift,
            'department': self.department,
            'phone': self.phone,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
