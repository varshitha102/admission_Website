"""Lead model."""
from datetime import datetime, timedelta
from extensions import db


class Lead(db.Model):
    """Lead model for prospective students."""
    
    __tablename__ = 'leads'
    
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False, index=True)
    phone = db.Column(db.String(20), nullable=True)
    
    # Foreign Keys
    source_id = db.Column(db.Integer, db.ForeignKey('sources.id'), nullable=True)
    stage_id = db.Column(db.Integer, db.ForeignKey('stages.id'), nullable=True)
    assigned_to = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    
    # Status
    status = db.Column(db.String(50), default='active')  # active, converted, lost, dormant
    re_inquiry_count = db.Column(db.Integer, default=0)
    
    # Timestamps
    last_activity_at = db.Column(db.DateTime, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    application = db.relationship('Application', backref='lead', uselist=False, lazy='joined')
    tasks = db.relationship('Task', backref='lead', lazy='dynamic')
    activities = db.relationship('Activity', backref='lead', lazy='dynamic',
                                  order_by='Activity.created_at.desc()')
    
    def get_full_name(self) -> str:
        """Get full name."""
        return f"{self.first_name} {self.last_name}".strip()
    
    def is_inactive(self, hours: int = 48) -> bool:
        """Check if lead has been inactive for specified hours."""
        if not self.last_activity_at:
            return True
        threshold = datetime.utcnow() - timedelta(hours=hours)
        return self.last_activity_at < threshold
    
    def update_last_activity(self) -> None:
        """Update last activity timestamp."""
        self.last_activity_at = datetime.utcnow()
        db.session.commit()
    
    def increment_reinquiry(self) -> None:
        """Increment re-inquiry count."""
        self.re_inquiry_count += 1
        db.session.commit()
    
    def to_dict(self, mask_sensitive: bool = False) -> dict:
        """Convert lead to dictionary."""
        data = {
            'id': self.id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'full_name': self.get_full_name(),
            'email': self.email if not mask_sensitive else self._mask_email(),
            'phone': self.phone if not mask_sensitive else self._mask_phone(),
            'source_id': self.source_id,
            'source': self.source.to_dict() if self.source else None,
            'stage_id': self.stage_id,
            'stage': self.stage.to_dict() if self.stage else None,
            'assigned_to': self.assigned_to,
            'assigned_user': self.assigned_user.to_dict() if self.assigned_user else None,
            'status': self.status,
            're_inquiry_count': self.re_inquiry_count,
            'last_activity_at': self.last_activity_at.isoformat() if self.last_activity_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'has_application': self.application is not None
        }
        return data
    
    def _mask_email(self) -> str:
        """Mask email for non-admin users."""
        if not self.email or '@' not in self.email:
            return '***'
        local, domain = self.email.split('@')
        masked_local = local[:2] + '***' if len(local) > 2 else '***'
        return f"{masked_local}@{domain}"
    
    def _mask_phone(self) -> str:
        """Mask phone for non-admin users."""
        if not self.phone:
            return None
        if len(self.phone) < 4:
            return '***'
        return '***' + self.phone[-4:]
    
    @classmethod
    def get_by_email(cls, email: str):
        """Get lead by email."""
        return cls.query.filter_by(email=email).first()
    
    @classmethod
    def get_inactive_leads(cls, hours: int = 48):
        """Get leads inactive for specified hours."""
        threshold = datetime.utcnow() - timedelta(hours=hours)
        return cls.query.filter(
            cls.last_activity_at < threshold,
            cls.status == 'active'
        ).all()
    
    def __repr__(self) -> str:
        return f'<Lead {self.get_full_name()} ({self.email})>'
