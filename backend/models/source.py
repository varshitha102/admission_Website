"""Source model."""
from datetime import datetime
from extensions import db


class Source(db.Model):
    """Source model for lead sources."""
    
    __tablename__ = 'sources'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(50), nullable=False)  # 'organic', 'paid', 'referral', 'direct', etc.
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    leads = db.relationship('Lead', backref='source', lazy='dynamic')
    
    # Common source categories
    CATEGORIES = ['Organic', 'Paid', 'Referral', 'Direct', 'Social Media', 'Email', 'Event', 'Publisher']
    
    def to_dict(self) -> dict:
        """Convert source to dictionary."""
        return {
            'id': self.id,
            'name': self.name,
            'category': self.category,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    @classmethod
    def get_active_sources(cls) -> list:
        """Get all active sources."""
        return cls.query.filter_by(is_active=True).all()
    
    def __repr__(self) -> str:
        return f'<Source {self.name} ({self.category})>'
