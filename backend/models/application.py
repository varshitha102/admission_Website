"""Application model."""
from datetime import datetime
from extensions import db


class Application(db.Model):
    """Application model for student applications."""
    
    __tablename__ = 'applications'
    
    id = db.Column(db.Integer, primary_key=True)
    lead_id = db.Column(db.Integer, db.ForeignKey('leads.id'), nullable=False, unique=True)
    
    # Document Verification Stage
    document_status = db.Column(db.String(50), default='pending')  # pending, verified, rejected
    document_notes = db.Column(db.Text, nullable=True)
    document_verified_at = db.Column(db.DateTime, nullable=True)
    
    # Fee Payment Stage
    fee_status = db.Column(db.String(50), default='pending')  # pending, paid, waived
    fee_amount = db.Column(db.Numeric(10, 2), nullable=True)
    fee_paid_at = db.Column(db.DateTime, nullable=True)
    
    # Admission Processing Stage
    admission_status = db.Column(db.String(50), default='pending')  # pending, approved, rejected
    admission_decision_at = db.Column(db.DateTime, nullable=True)
    admission_decision_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    
    # Enrollment Stage
    enrollment_status = db.Column(db.String(50), default='pending')  # pending, confirmed, cancelled
    enrollment_date = db.Column(db.DateTime, nullable=True)
    
    # Overall Status
    overall_status = db.Column(db.String(50), default='in_progress')  # in_progress, completed, cancelled
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    decision_maker = db.relationship('User', foreign_keys=[admission_decision_by])
    
    # Status options
    DOCUMENT_STATUSES = ['pending', 'verified', 'rejected', 'in_review']
    FEE_STATUSES = ['pending', 'paid', 'waived', 'partial']
    ADMISSION_STATUSES = ['pending', 'approved', 'rejected', 'waitlisted', 'conditional']
    ENROLLMENT_STATUSES = ['pending', 'confirmed', 'cancelled', 'deferred']
    OVERALL_STATUSES = ['in_progress', 'completed', 'cancelled', 'on_hold']
    
    def to_dict(self) -> dict:
        """Convert application to dictionary."""
        return {
            'id': self.id,
            'lead_id': self.lead_id,
            'lead': self.lead.to_dict() if self.lead else None,
            'document_status': self.document_status,
            'document_notes': self.document_notes,
            'document_verified_at': self.document_verified_at.isoformat() if self.document_verified_at else None,
            'fee_status': self.fee_status,
            'fee_amount': float(self.fee_amount) if self.fee_amount else None,
            'fee_paid_at': self.fee_paid_at.isoformat() if self.fee_paid_at else None,
            'admission_status': self.admission_status,
            'admission_decision_at': self.admission_decision_at.isoformat() if self.admission_decision_at else None,
            'admission_decision_by': self.admission_decision_by,
            'enrollment_status': self.enrollment_status,
            'enrollment_date': self.enrollment_date.isoformat() if self.enrollment_date else None,
            'overall_status': self.overall_status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def update_status(self, field: str, status: str) -> None:
        """Update a specific status field."""
        if hasattr(self, field):
            setattr(self, field, status)
            setattr(self, 'updated_at', datetime.utcnow())
            
            # Update timestamp fields based on status
            if field == 'document_status' and status == 'verified':
                self.document_verified_at = datetime.utcnow()
            elif field == 'fee_status' and status == 'paid':
                self.fee_paid_at = datetime.utcnow()
            elif field == 'admission_status' and status in ['approved', 'rejected']:
                self.admission_decision_at = datetime.utcnow()
            elif field == 'enrollment_status' and status == 'confirmed':
                self.enrollment_date = datetime.utcnow()
            
            db.session.commit()
    
    def get_current_stage(self) -> str:
        """Get current application stage."""
        if self.enrollment_status == 'confirmed':
            return 'enrollment_done'
        elif self.admission_status in ['approved', 'rejected']:
            return 'admission_done'
        elif self.fee_status == 'paid':
            return 'fee_payment'
        elif self.document_status == 'verified':
            return 'document_verification'
        return 'document_verification'
    
    @classmethod
    def get_by_lead_id(cls, lead_id: int):
        """Get application by lead ID."""
        return cls.query.filter_by(lead_id=lead_id).first()
    
    @classmethod
    def get_stats(cls) -> dict:
        """Get application statistics."""
        total = cls.query.count()
        completed = cls.query.filter_by(overall_status='completed').count()
        in_progress = cls.query.filter_by(overall_status='in_progress').count()
        cancelled = cls.query.filter_by(overall_status='cancelled').count()
        
        return {
            'total': total,
            'completed': completed,
            'in_progress': in_progress,
            'cancelled': cancelled,
            'completion_rate': (completed / total * 100) if total > 0 else 0
        }
    
    def __repr__(self) -> str:
        return f'<Application {self.id} (Lead: {self.lead_id})>'
