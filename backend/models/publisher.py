"""Publisher model."""
from datetime import datetime
from extensions import db


class Publisher(db.Model):
    """Publisher model for external lead sources."""
    
    __tablename__ = 'publishers'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20), nullable=True)
    
    # API Key for publisher integration
    api_key = db.Column(db.String(255), unique=True, nullable=True)
    
    # Limits and Priority
    lead_limit = db.Column(db.Integer, default=100)  # Monthly lead limit
    priority = db.Column(db.Integer, default=5)  # 1-10, higher is better
    
    # Status
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    
    # Tracking
    leads_submitted = db.Column(db.Integer, default=0)
    leads_converted = db.Column(db.Integer, default=0)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    user = db.relationship('User', backref='publisher_profile')
    
    def to_dict(self) -> dict:
        """Convert publisher to dictionary."""
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'lead_limit': self.lead_limit,
            'priority': self.priority,
            'is_active': self.is_active,
            'leads_submitted': self.leads_submitted,
            'leads_converted': self.leads_converted,
            'conversion_rate': (self.leads_converted / self.leads_submitted * 100) 
                              if self.leads_submitted > 0 else 0,
            'user_id': self.user_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def increment_leads_submitted(self) -> None:
        """Increment leads submitted count."""
        self.leads_submitted += 1
        db.session.commit()
    
    def increment_leads_converted(self) -> None:
        """Increment leads converted count."""
        self.leads_converted += 1
        db.session.commit()
    
    def can_submit_lead(self) -> bool:
        """Check if publisher can submit more leads."""
        if not self.is_active:
            return False
        return self.leads_submitted < self.lead_limit
    
    @classmethod
    def get_active_publishers(cls):
        """Get all active publishers."""
        return cls.query.filter_by(is_active=True).order_by(cls.priority.desc()).all()
    
    @classmethod
    def get_by_api_key(cls, api_key: str):
        """Get publisher by API key."""
        return cls.query.filter_by(api_key=api_key, is_active=True).first()
    
    def __repr__(self) -> str:
        return f'<Publisher {self.name}>'
