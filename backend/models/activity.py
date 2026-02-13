"""Activity model."""
from datetime import datetime
from extensions import db


class Activity(db.Model):
    """Activity model for tracking all interactions with leads."""
    
    __tablename__ = 'activities'
    
    id = db.Column(db.Integer, primary_key=True)
    
    # Activity Type
    type = db.Column(db.String(50), nullable=False)  # call, email, sms, note, system, stage_change, task
    
    # Description
    description = db.Column(db.Text, nullable=False)
    
    # Foreign Keys
    lead_id = db.Column(db.Integer, db.ForeignKey('leads.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    
    # Additional Data (JSON for flexibility)
    metadata_json = db.Column(db.JSON, nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    
    # Activity types
    TYPES = ['call', 'email', 'sms', 'whatsapp', 'note', 'system', 'stage_change', 
             'task_created', 'task_completed', 'document_uploaded', 'fee_paid', 
             'application_created', 'meeting', 'follow_up']
    
    def to_dict(self) -> dict:
        """Convert activity to dictionary."""
        return {
            'id': self.id,
            'type': self.type,
            'description': self.description,
            'lead_id': self.lead_id,
            'user_id': self.user_id,
            'user': self.user.to_dict() if self.user else None,
            'metadata': self.metadata_json,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    @classmethod
    def log(cls, lead_id: int, activity_type: str, description: str, 
            user_id: int = None, metadata: dict = None) -> 'Activity':
        """Create a new activity log."""
        activity = cls(
            lead_id=lead_id,
            type=activity_type,
            description=description,
            user_id=user_id,
            metadata_json=metadata or {}
        )
        db.session.add(activity)
        db.session.commit()
        
        # Update lead's last activity
        from .lead import Lead
        lead = Lead.query.get(lead_id)
        if lead:
            lead.last_activity_at = datetime.utcnow()
            db.session.commit()
        
        return activity
    
    @classmethod
    def get_for_lead(cls, lead_id: int, limit: int = None):
        """Get activities for a lead."""
        query = cls.query.filter_by(lead_id=lead_id).order_by(cls.created_at.desc())
        if limit:
            query = query.limit(limit)
        return query.all()
    
    @classmethod
    def get_recent(cls, limit: int = 50):
        """Get recent activities across all leads."""
        return cls.query.order_by(cls.created_at.desc()).limit(limit).all()
    
    def __repr__(self) -> str:
        return f'<Activity {self.type} (Lead: {self.lead_id})>'
