from datetime import datetime, timedelta
from app import db
import uuid
import secrets


class Invite(db.Model):
    __tablename__ = 'invites'
    
    # Primary Key
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Foreign Keys
    project_id = db.Column(db.String(36), db.ForeignKey('projects.id'), nullable=False, index=True)
    invited_by = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False, index=True)
    
    # Invite Info
    email = db.Column(db.String(255), nullable=False, index=True)
    token = db.Column(db.String(255), unique=True, nullable=False, index=True, default=lambda: secrets.token_urlsafe(32))
    
    # Status: pending, accepted, expired, cancelled
    status = db.Column(
        db.Enum('pending', 'accepted', 'expired', 'cancelled', name='invite_status'),
        default='pending',
        nullable=False
    )
    
    # Resend counter
    resend_count = db.Column(db.Integer, default=0, nullable=False)
    
    # Employee enrichment data (optional fields set by Owner when inviting)
    job_title = db.Column(db.String(100), nullable=True)  # Puesto
    description = db.Column(db.Text, nullable=True)  # Descripción
    responsibilities = db.Column(db.Text, nullable=True)  # Responsabilidades
    skills = db.Column(db.Text, nullable=True)  # Habilidades (JSON string o comma-separated)
    shift = db.Column(db.Enum('morning', 'afternoon', 'night', 'flexible', name='employee_shift'), nullable=True)  # Turno
    department = db.Column(db.String(100), nullable=True)  # Departamento
    phone = db.Column(db.String(20), nullable=True)  # Teléfono
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    expires_at = db.Column(db.DateTime, default=lambda: datetime.utcnow() + timedelta(days=7), nullable=False)
    accepted_at = db.Column(db.DateTime, nullable=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=True)
    
    # Relationships
    project = db.relationship('Project', back_populates='invites')
    inviter = db.relationship('User', back_populates='sent_invites', foreign_keys=[invited_by])
    
    def __repr__(self):
        return f'<Invite {self.email} to project {self.project_id} ({self.status})>'
    
    def is_expired(self):
        """Check if invite is expired"""
        return datetime.utcnow() > self.expires_at
    
    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'email': self.email,
            'token': self.token,
            'status': self.status,
            'invited_by': self.invited_by,
            'resend_count': self.resend_count,
            'job_title': self.job_title,
            'description': self.description,
            'responsibilities': self.responsibilities,
            'skills': self.skills,
            'shift': self.shift,
            'department': self.department,
            'phone': self.phone,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'expires_at': self.expires_at.isoformat() if self.expires_at else None,
            'accepted_at': self.accepted_at.isoformat() if self.accepted_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
