"""Authentication service."""
from datetime import datetime
from flask_jwt_extended import create_access_token, create_refresh_token, get_jwt_identity
from models import User
from extensions import db


class AuthService:
    """Service for authentication operations."""
    
    @staticmethod
    def login(email: str, password: str) -> dict:
        """Authenticate user and return tokens."""
        user = User.query.filter_by(email=email, is_active=True).first()
        
        if not user:
            raise ValueError("Invalid email or password")
        
        if not user.check_password(password):
            raise ValueError("Invalid email or password")
        
        # Create tokens with role claim
        additional_claims = {
            'role': user.role,
            'name': user.name
        }
        
        access_token = create_access_token(
            identity=user.id,
            additional_claims=additional_claims
        )
        refresh_token = create_refresh_token(
            identity=user.id,
            additional_claims=additional_claims
        )
        
        return {
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': user.to_dict()
        }
    
    @staticmethod
    def refresh_token() -> dict:
        """Refresh access token."""
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user or not user.is_active:
            raise ValueError("User not found or inactive")
        
        additional_claims = {
            'role': user.role,
            'name': user.name
        }
        
        access_token = create_access_token(
            identity=user.id,
            additional_claims=additional_claims
        )
        
        return {
            'access_token': access_token,
            'user': user.to_dict()
        }
    
    @staticmethod
    def get_current_user(user_id: int) -> User:
        """Get current user by ID."""
        user = User.query.get(user_id)
        if not user:
            raise ValueError("User not found")
        return user
    
    @staticmethod
    def create_user(data: dict) -> User:
        """Create a new user."""
        # Check if email exists
        existing = User.query.filter_by(email=data['email']).first()
        if existing:
            raise ValueError("Email already registered")
        
        # Validate role
        if data.get('role') not in User.ROLES:
            raise ValueError(f"Invalid role. Must be one of: {', '.join(User.ROLES)}")
        
        user = User(
            name=data['name'],
            email=data['email'],
            role=data.get('role', 'Executive'),
            is_active=data.get('is_active', True)
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        return user
    
    @staticmethod
    def update_user(user_id: int, data: dict) -> User:
        """Update user."""
        user = User.query.get(user_id)
        if not user:
            raise ValueError("User not found")
        
        # Update fields
        if 'name' in data:
            user.name = data['name']
        if 'email' in data:
            # Check if email is taken
            existing = User.query.filter(
                User.email == data['email'],
                User.id != user_id
            ).first()
            if existing:
                raise ValueError("Email already registered")
            user.email = data['email']
        if 'role' in data and data['role'] in User.ROLES:
            user.role = data['role']
        if 'is_active' in data:
            user.is_active = data['is_active']
        if 'password' in data and data['password']:
            user.set_password(data['password'])
        
        user.updated_at = datetime.utcnow()
        db.session.commit()
        
        return user
    
    @staticmethod
    def delete_user(user_id: int) -> None:
        """Delete (deactivate) user."""
        user = User.query.get(user_id)
        if not user:
            raise ValueError("User not found")
        
        user.is_active = False
        db.session.commit()
    
    @staticmethod
    def get_users(role: str = None, is_active: bool = None) -> list:
        """Get users with optional filters."""
        query = User.query
        
        if role:
            query = query.filter_by(role=role)
        if is_active is not None:
            query = query.filter_by(is_active=is_active)
        
        return query.order_by(User.created_at.desc()).all()
    
    @staticmethod
    def get_executives() -> list:
        """Get all active executives for lead assignment."""
        return User.query.filter(
            User.role.in_(['Executive', 'Team Lead', 'Consultant']),
            User.is_active == True
        ).all()
