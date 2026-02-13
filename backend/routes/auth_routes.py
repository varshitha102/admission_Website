"""Authentication routes."""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services import AuthService
from middleware import admin_required

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')


@auth_bp.route('/login', methods=['POST'])
def login():
    """User login."""
    try:
        data = request.get_json()
        
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email and password are required'}), 400
        
        result = AuthService.login(data['email'], data['password'])
        return jsonify(result), 200
    
    except ValueError as e:
        return jsonify({'error': 'Authentication failed', 'message': str(e)}), 401
    except Exception as e:
        return jsonify({'error': 'Server error', 'message': str(e)}), 500


@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Refresh access token."""
    try:
        result = AuthService.refresh_token()
        return jsonify(result), 200
    except ValueError as e:
        return jsonify({'error': 'Token refresh failed', 'message': str(e)}), 401
    except Exception as e:
        return jsonify({'error': 'Server error', 'message': str(e)}), 500


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current user info."""
    try:
        user_id = get_jwt_identity()
        user = AuthService.get_current_user(user_id)
        return jsonify({'user': user.to_dict()}), 200
    except ValueError as e:
        return jsonify({'error': 'User not found', 'message': str(e)}), 404
    except Exception as e:
        return jsonify({'error': 'Server error', 'message': str(e)}), 500


@auth_bp.route('/users', methods=['GET'])
@jwt_required()
def get_users():
    """Get all users (Admin only)."""
    try:
        role = request.args.get('role')
        is_active = request.args.get('is_active')
        
        if is_active is not None:
            is_active = is_active.lower() == 'true'
        
        users = AuthService.get_users(role=role, is_active=is_active)
        return jsonify({'users': [user.to_dict() for user in users]}), 200
    except Exception as e:
        return jsonify({'error': 'Server error', 'message': str(e)}), 500


@auth_bp.route('/users', methods=['POST'])
@jwt_required()
@admin_required
def create_user():
    """Create new user (Admin only)."""
    try:
        data = request.get_json()
        
        required_fields = ['name', 'email', 'password', 'role']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        user = AuthService.create_user(data)
        return jsonify({'user': user.to_dict()}), 201
    
    except ValueError as e:
        return jsonify({'error': 'Validation error', 'message': str(e)}), 400
    except Exception as e:
        return jsonify({'error': 'Server error', 'message': str(e)}), 500


@auth_bp.route('/users/<int:user_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_user(user_id):
    """Update user (Admin only)."""
    try:
        data = request.get_json()
        user = AuthService.update_user(user_id, data)
        return jsonify({'user': user.to_dict()}), 200
    except ValueError as e:
        return jsonify({'error': 'Validation error', 'message': str(e)}), 400
    except Exception as e:
        return jsonify({'error': 'Server error', 'message': str(e)}), 500


@auth_bp.route('/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_user(user_id):
    """Delete user (Admin only)."""
    try:
        AuthService.delete_user(user_id)
        return jsonify({'message': 'User deleted successfully'}), 200
    except ValueError as e:
        return jsonify({'error': 'User not found', 'message': str(e)}), 404
    except Exception as e:
        return jsonify({'error': 'Server error', 'message': str(e)}), 500


@auth_bp.route('/executives', methods=['GET'])
@jwt_required()
def get_executives():
    """Get all active executives for lead assignment."""
    try:
        executives = AuthService.get_executives()
        return jsonify({'executives': [user.to_dict() for user in executives]}), 200
    except Exception as e:
        return jsonify({'error': 'Server error', 'message': str(e)}), 500
