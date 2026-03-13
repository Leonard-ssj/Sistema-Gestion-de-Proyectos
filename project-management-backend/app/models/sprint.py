from datetime import datetime
from app import db
import uuid


class Sprint(db.Model):
    __tablename__ = 'sprints'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = db.Column(db.String(36), db.ForeignKey('projects.id'), nullable=False, index=True)

    name = db.Column(db.String(120), nullable=False)
    color = db.Column(db.String(32), nullable=False, default='blue')
    start_date = db.Column(db.DateTime, nullable=False)
    end_date = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.Enum('planned', 'active', 'closed', name='sprint_status'), nullable=False, default='planned')

    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    project = db.relationship('Project', back_populates='sprints')
    tasks = db.relationship('Task', back_populates='sprint')

    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'name': self.name,
            'color': self.color,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
