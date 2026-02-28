from datetime import datetime
from app import db
import uuid


class Membership(db.Model):
    __tablename__ = 'memberships'
    
    # Primary Key
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Foreign Keys
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False, index=True)
    project_id = db.Column(db.String(36), db.ForeignKey('projects.id'), nullable=False, index=True)
    
    # Role en el proyecto: OWNER, EMPLOYEE
    role = db.Column(db.Enum('OWNER', 'EMPLOYEE', name='membership_role'), nullable=False)
    
    # Status: active, disabled
    status = db.Column(db.Enum('active', 'disabled', name='membership_status'), default='active', nullable=False)
    
    # Timestamps
    joined_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    
    # Unique constraint: un usuario solo puede tener una membresía por proyecto
    __table_args__ = (
        db.UniqueConstraint('user_id', 'project_id', name='unique_user_project'),
    )
    
    # Relationships
    user = db.relationship('User', back_populates='memberships')
    project = db.relationship('Project', back_populates='memberships')
    
    def __repr__(self):
        return f'<Membership user={self.user_id} project={self.project_id} role={self.role}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'project_id': self.project_id,
            'role': self.role,
            'status': self.status,
            'joined_at': self.joined_at.isoformat() if self.joined_at else None
        }
