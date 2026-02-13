"""JWT middleware."""
from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity, get_jwt


def jwt_required_middleware(fn):
    """Middleware to verify JWT token."""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request()
            return fn(*args, **kwargs)
        except Exception as e:
            return jsonify({'error': 'Unauthorized', 'message': str(e)}), 401
    return wrapper


def get_current_user_id():
    """Get current user ID from JWT."""
    return get_jwt_identity()


def get_current_user_role():
    """Get current user role from JWT claims."""
    claims = get_jwt()
    return claims.get('role')
