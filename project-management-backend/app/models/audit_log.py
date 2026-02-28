from datetime import datetime
from app import db
import uuid


class AuditLog(db.Model):
    __tablename__ = 'audit_logs'
    
    # Primary Key
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Foreign Keys
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=True, index=True)
    project_id = db.Column(db.String(36), db.ForeignKey('projects.id'), nullable=True, index=True)
    
    # Action Info
    # Action: login, logout, create_task, update_task, delete_task, invite_user, accept_invite, etc.
    action = db.Column(db.String(100), nullable=False, index=True)
    
    # Entity affected
    entity_type = db.Column(db.String(50), nullable=True)  # user, project, task, invite, etc.
    entity_id = db.Column(db.String(36), nullable=True)
    
    # Details (JSON)
    details = db.Column(db.JSON, nullable=True)
    
    # Request Info
    ip_address = db.Column(db.String(45), nullable=True)  # IPv6 compatible
    user_agent = db.Column(db.String(255), nullable=True)
    
    # Timestamp
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False, index=True)
    
    # Relationships
    user = db.relationship('User', back_populates='audit_logs')
    project = db.relationship('Project', back_populates='audit_logs')
    
    def __repr__(self):
        return f'<AuditLog {self.action} by user {self.user_id}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'project_id': self.project_id,
            'action': self.action,
            'entity_type': self.entity_type,
            'entity_id': self.entity_id,
            'details': self.details,
            'ip_address': self.ip_address,
            'user_agent': self.user_agent,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
