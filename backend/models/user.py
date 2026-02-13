"""User model."""
from datetime import datetime
from extensions import db
import bcrypt


class User(db.Model):
    """User model for CRM users."""
    
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(50), nullable=False, default='Executive')
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    assigned_leads = db.relationship('Lead', backref='assigned_user', lazy='dynamic',
                                     foreign_keys='Lead.assigned_to')
    assigned_tasks = db.relationship('Task', backref='assigned_user', lazy='dynamic',
                                     foreign_keys='Task.assigned_to')
    activities = db.relationship('Activity', backref='user', lazy='dynamic')
    
    # Valid roles
    ROLES = ['Admin', 'Team Lead', 'Executive', 'Consultant', 'Publisher', 'Digital Manager']
    
    def set_password(self, password: str) -> None:
        """Hash and set password."""
        self.password_hash = bcrypt.hashpw(
            password.encode('utf-8'), 
            bcrypt.gensalt()
        ).decode('utf-8')
    
    def check_password(self, password: str) -> bool:
        """Check password against hash."""
        return bcrypt.checkpw(
            password.encode('utf-8'),
            self.password_hash.encode('utf-8')
        )
    
    def to_dict(self, include_sensitive: bool = False) -> dict:
        """Convert user to dictionary."""
        data = {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role': self.role,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        return data
    
    def has_role(self, roles: list[str] | str) -> bool:
        """Check if user has any of the specified roles."""
        if isinstance(roles, str):
            roles = [roles]
        return self.role in roles
    
    def __repr__(self) -> str:
        return f'<User {self.email} ({self.role})>'
