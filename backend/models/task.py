"""Task model."""
from datetime import datetime
from extensions import db


class Task(db.Model):
    """Task model for follow-ups and reminders."""
    
    __tablename__ = 'tasks'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    
    # Task Type
    task_type = db.Column(db.String(50), default='follow_up')  # follow_up, call, email, meeting, system
    
    # Due Date and Status
    due_date = db.Column(db.DateTime, nullable=True)
    status = db.Column(db.String(50), default='pending')  # pending, in_progress, completed, cancelled
    priority = db.Column(db.String(20), default='medium')  # low, medium, high, urgent
    
    # Foreign Keys
    assigned_to = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    lead_id = db.Column(db.Integer, db.ForeignKey('leads.id'), nullable=True)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    
    # Completion
    completed_at = db.Column(db.DateTime, nullable=True)
    completed_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    completion_notes = db.Column(db.Text, nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Status options
    STATUSES = ['pending', 'in_progress', 'completed', 'cancelled']
    PRIORITIES = ['low', 'medium', 'high', 'urgent']
    TYPES = ['follow_up', 'call', 'email', 'meeting', 'document_collection', 'fee_reminder', 'system']
    
    def to_dict(self) -> dict:
        """Convert task to dictionary."""
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'task_type': self.task_type,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'status': self.status,
            'priority': self.priority,
            'assigned_to': self.assigned_to,
            'assigned_user': self.assigned_user.to_dict() if self.assigned_user else None,
            'lead_id': self.lead_id,
            'lead': self.lead.to_dict(mask_sensitive=True) if self.lead else None,
            'created_by': self.created_by,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'completed_by': self.completed_by,
            'completion_notes': self.completion_notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'is_overdue': self.is_overdue()
        }
    
    def is_overdue(self) -> bool:
        """Check if task is overdue."""
        if self.status in ['completed', 'cancelled']:
            return False
        if not self.due_date:
            return False
        return self.due_date < datetime.utcnow()
    
    def complete(self, user_id: int, notes: str = None) -> None:
        """Mark task as completed."""
        self.status = 'completed'
        self.completed_at = datetime.utcnow()
        self.completed_by = user_id
        self.completion_notes = notes
        db.session.commit()
    
    def reopen(self) -> None:
        """Reopen a completed task."""
        self.status = 'pending'
        self.completed_at = None
        self.completed_by = None
        self.completion_notes = None
        db.session.commit()
    
    @classmethod
    def get_pending_for_user(cls, user_id: int):
        """Get pending tasks for a user."""
        return cls.query.filter_by(
            assigned_to=user_id,
            status='pending'
        ).order_by(cls.due_date.asc()).all()
    
    @classmethod
    def get_overdue_tasks(cls):
        """Get all overdue tasks."""
        return cls.query.filter(
            cls.due_date < datetime.utcnow(),
            cls.status.in_(['pending', 'in_progress'])
        ).all()
    
    @classmethod
    def get_stats(cls) -> dict:
        """Get task statistics."""
        total = cls.query.count()
        pending = cls.query.filter_by(status='pending').count()
        completed = cls.query.filter_by(status='completed').count()
        overdue = len(cls.get_overdue_tasks())
        
        return {
            'total': total,
            'pending': pending,
            'completed': completed,
            'overdue': overdue
        }
    
    def __repr__(self) -> str:
        return f'<Task {self.title} ({self.status})>'
