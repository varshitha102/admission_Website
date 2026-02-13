"""Workflow model."""
from datetime import datetime
from extensions import db
import json


class Workflow(db.Model):
    """Workflow model for automation rules."""
    
    __tablename__ = 'workflows'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    
    # Trigger
    trigger = db.Column(db.String(50), nullable=False)  # lead_created, stage_changed, task_overdue, etc.
    trigger_conditions = db.Column(db.JSON, nullable=True)  # Additional conditions
    
    # Actions (JSON array of actions to perform)
    actions_json = db.Column(db.JSON, nullable=False)
    
    # Status
    active = db.Column(db.Boolean, default=True, nullable=False)
    
    # Execution tracking
    execution_count = db.Column(db.Integer, default=0)
    last_executed_at = db.Column(db.DateTime, nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Trigger types
    TRIGGERS = [
        'lead_created',
        'lead_updated',
        'stage_changed',
        'application_created',
        'task_created',
        'task_completed',
        'task_overdue',
        'fee_paid',
        'document_verified',
        'admission_decision',
        'scheduled_time'
    ]
    
    # Action types
    ACTION_TYPES = [
        'create_task',
        'send_email',
        'send_sms',
        'change_stage',
        'assign_user',
        'create_activity',
        'webhook'
    ]
    
    def to_dict(self) -> dict:
        """Convert workflow to dictionary."""
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'trigger': self.trigger,
            'trigger_conditions': self.trigger_conditions,
            'actions': self.actions_json,
            'active': self.active,
            'execution_count': self.execution_count,
            'last_executed_at': self.last_executed_at.isoformat() if self.last_executed_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def get_actions(self) -> list:
        """Get parsed actions."""
        return self.actions_json or []
    
    def increment_execution(self) -> None:
        """Increment execution count."""
        self.execution_count += 1
        self.last_executed_at = datetime.utcnow()
        db.session.commit()
    
    @classmethod
    def get_active_for_trigger(cls, trigger: str):
        """Get active workflows for a trigger."""
        return cls.query.filter_by(trigger=trigger, active=True).all()
    
    @classmethod
    def get_all_active(cls):
        """Get all active workflows."""
        return cls.query.filter_by(active=True).all()
    
    def __repr__(self) -> str:
        return f'<Workflow {self.name} ({self.trigger})>'
