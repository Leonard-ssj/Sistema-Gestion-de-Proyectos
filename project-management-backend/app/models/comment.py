from datetime import datetime
from app import db
import uuid


class Comment(db.Model):
    __tablename__ = 'comments'
    
    # Primary Key
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Foreign Keys
    task_id = db.Column(db.String(36), db.ForeignKey('tasks.id'), nullable=False, index=True)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False, index=True)
    
    # Comment content
    content = db.Column(db.Text, nullable=False)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    task = db.relationship('Task', back_populates='comments')
    user = db.relationship('User', back_populates='comments')
    
    def __repr__(self):
        return f'<Comment on task {self.task_id} by user {self.user_id}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'task_id': self.task_id,
            'user_id': self.user_id,
            'content': self.content,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
