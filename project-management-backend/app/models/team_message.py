from datetime import datetime
from app import db
import uuid

class TeamMessage(db.Model):
    __tablename__ = 'team_messages'
    
    # Primary Key
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Foreign Keys
    project_id = db.Column(db.String(36), db.ForeignKey('projects.id', ondelete='CASCADE'), nullable=False, index=True)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    task_id = db.Column(db.String(36), db.ForeignKey('tasks.id', ondelete='SET NULL'), nullable=True, index=True)
    mentioned_user_id = db.Column(db.String(36), db.ForeignKey('users.id', ondelete='SET NULL'), nullable=True, index=True)
    
    # Content
    content = db.Column(db.Text, nullable=False)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    project = db.relationship('Project', backref=db.backref('team_messages', cascade='all, delete-orphan', lazy=True))
    user = db.relationship('User', foreign_keys=[user_id], backref=db.backref('team_messages', cascade='all, delete-orphan', lazy=True))
    task = db.relationship('Task', backref=db.backref('team_messages', lazy=True))
    mentioned_user = db.relationship('User', foreign_keys=[mentioned_user_id])
    
    def __repr__(self):
        return f'<TeamMessage {self.id} in Project {self.project_id}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'user_id': self.user_id,
            'task_id': self.task_id,
            'mentioned_user_id': self.mentioned_user_id,
            'content': self.content,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
