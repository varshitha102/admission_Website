"""Stage model."""
from datetime import datetime
from extensions import db


class Stage(db.Model):
    """Stage model for lead and application stages."""
    
    __tablename__ = 'stages'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    type = db.Column(db.String(20), nullable=False)  # 'lead' or 'application'
    order = db.Column(db.Integer, default=0, nullable=False)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    leads = db.relationship('Lead', backref='stage', lazy='dynamic')
    
    # Predefined stages
    LEAD_STAGES = [
        'Inquiry',
        'Lead',
        'Application',
        'Admission',
        'Enrollment'
    ]
    
    APPLICATION_STAGES = [
        'Document Verification',
        'Fee Payment',
        'Admission Processing',
        'Admission Done'
    ]
    
    def to_dict(self) -> dict:
        """Convert stage to dictionary."""
        return {
            'id': self.id,
            'name': self.name,
            'type': self.type,
            'order': self.order,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    @classmethod
    def get_lead_stages(cls) -> list:
        """Get all active lead stages ordered by order."""
        return cls.query.filter_by(type='lead', is_active=True).order_by(cls.order).all()
    
    @classmethod
    def get_application_stages(cls) -> list:
        """Get all active application stages ordered by order."""
        return cls.query.filter_by(type='application', is_active=True).order_by(cls.order).all()
    
    def __repr__(self) -> str:
        return f'<Stage {self.name} ({self.type})>'
