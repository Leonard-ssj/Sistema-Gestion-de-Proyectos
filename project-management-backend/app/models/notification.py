from datetime import datetime
from app import db
import uuid


class Notification(db.Model):
    __tablename__ = 'notifications'
    
    # Primary Key
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Foreign Keys
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False, index=True)
    project_id = db.Column(db.String(36), db.ForeignKey('projects.id'), nullable=True, index=True)
    
    # Notification Info
    # Type: task_assigned, task_comment, task_status_changed, invite_accepted, etc.
    type = db.Column(db.String(50), nullable=False)
    message = db.Column(db.Text, nullable=False)
    
    # Read status
    read = db.Column(db.Boolean, default=False, nullable=False, index=True)
    
    # Optional: link to related entity
    entity_type = db.Column(db.String(50), nullable=True)  # task, project, invite, etc.
    entity_id = db.Column(db.String(36), nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    read_at = db.Column(db.DateTime, nullable=True)
    
    # Relationships
    user = db.relationship('User', back_populates='notifications')
    project = db.relationship('Project', back_populates='notifications')
    
    def __repr__(self):
        return f'<Notification {self.type} for user {self.user_id} (read={self.read})>'
    
    def mark_as_read(self):
        """Mark notification as read"""
        self.read = True
        self.read_at = datetime.utcnow()
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'project_id': self.project_id,
            'type': self.type,
            'message': self.message,
            'read': self.read,
            'entity_type': self.entity_type,
            'entity_id': self.entity_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'read_at': self.read_at.isoformat() if self.read_at else None
        }
