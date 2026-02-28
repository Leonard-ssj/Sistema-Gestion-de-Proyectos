from datetime import datetime
from app import db
import uuid


class Project(db.Model):
    __tablename__ = 'projects'
    
    # Primary Key
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Basic Info
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    category = db.Column(db.String(100), nullable=True)
    
    # Owner (1 proyecto por owner - RF-007)
    owner_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False, unique=True, index=True)
    
    # Status: active, disabled
    status = db.Column(db.Enum('active', 'disabled', name='project_status'), default='active', nullable=False)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    # Owner del proyecto
    owner = db.relationship('User', back_populates='owned_project', foreign_keys=[owner_id])
    
    # Membresías (employees) - N:M a través de Membership
    memberships = db.relationship('Membership', back_populates='project', cascade='all, delete-orphan')
    
    # Tareas del proyecto
    tasks = db.relationship('Task', back_populates='project', cascade='all, delete-orphan')
    
    # Invitaciones del proyecto
    invites = db.relationship('Invite', back_populates='project', cascade='all, delete-orphan')
    
    # Notificaciones del proyecto
    notifications = db.relationship('Notification', back_populates='project', cascade='all, delete-orphan')
    
    # Logs de auditoría
    audit_logs = db.relationship('AuditLog', back_populates='project')
    
    def __repr__(self):
        return f'<Project {self.name}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'category': self.category,
            'owner_id': self.owner_id,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
