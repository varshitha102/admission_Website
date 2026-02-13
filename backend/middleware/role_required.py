"""Role-based access control middleware."""
from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt_identity, get_jwt
from backend.models import User


def role_required(allowed_roles):
    """Decorator to require specific roles."""
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            try:
                claims = get_jwt()
                user_role = claims.get('role')
                
                if user_role not in allowed_roles:
                    return jsonify({
                        'error': 'Forbidden',
                        'message': f'Access denied. Required roles: {", ".join(allowed_roles)}'
                    }), 403
                
                return fn(*args, **kwargs)
            except Exception as e:
                return jsonify({'error': 'Authorization error', 'message': str(e)}), 403
        return wrapper
    return decorator


def admin_required(fn):
    """Decorator to require Admin role."""
    return role_required(['Admin'])(fn)


def team_lead_required(fn):
    """Decorator to require Team Lead or Admin role."""
    return role_required(['Admin', 'Team Lead'])(fn)


def manager_required(fn):
    """Decorator to require management roles."""
    return role_required(['Admin', 'Team Lead', 'Digital Manager'])(fn)


def can_access_lead(fn):
    """Decorator to check if user can access a specific lead."""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        from models import Lead
        
        claims = get_jwt()
        user_role = claims.get('role')
        user_id = get_jwt_identity()
        
        # Admins can access all leads
        if user_role == 'Admin':
            return fn(*args, **kwargs)
        
        # Get lead_id from kwargs or request
        lead_id = kwargs.get('lead_id') or kwargs.get('id')
        
        if lead_id:
            lead = Lead.query.get(lead_id)
            if lead:
                # Team Leads can access their team's leads
                if user_role == 'Team Lead':
                    # Additional logic for team leads
                    pass
                
                # Executives can only access their assigned leads
                if user_role == 'Executive' and lead.assigned_to != user_id:
                    return jsonify({
                        'error': 'Forbidden',
                        'message': 'You can only access your assigned leads'
                    }), 403
                
                # Consultants can only access early stage leads
                if user_role == 'Consultant':
                    from models import Stage
                    stage = Stage.query.get(lead.stage_id)
                    if not stage or stage.order > 2:
                        return jsonify({
                            'error': 'Forbidden',
                            'message': 'You can only access early stage leads'
                        }), 403
        
        return fn(*args, **kwargs)
    return wrapper
