"""Activity routes."""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Activity
from extensions import db
from middleware import admin_required

activity_bp = Blueprint('activities', __name__, url_prefix='/activities')


@activity_bp.route('/', methods=['GET'])
@jwt_required()
def get_activities():
    """Get activities with filters."""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        
        query = Activity.query
        
        # Apply filters
        if request.args.get('lead_id'):
            query = query.filter_by(lead_id=request.args.get('lead_id', type=int))
        if request.args.get('user_id'):
            query = query.filter_by(user_id=request.args.get('user_id', type=int))
        if request.args.get('type'):
            query = query.filter_by(type=request.args.get('type'))
        
        # Order by created_at desc
        query = query.order_by(Activity.created_at.desc())
        
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        
        return jsonify({
            'items': [activity.to_dict() for activity in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': page,
            'per_page': per_page
        }), 200
    
    except Exception as e:
        return jsonify({'error': 'Server error', 'message': str(e)}), 500


@activity_bp.route('/<int:lead_id>', methods=['GET'])
@jwt_required()
def get_lead_activities(lead_id):
    """Get activities for a specific lead."""
    try:
        limit = request.args.get('limit', 50, type=int)
        activities = Activity.get_for_lead(lead_id, limit=limit)
        
        return jsonify({
            'activities': [activity.to_dict() for activity in activities]
        }), 200
    
    except Exception as e:
        return jsonify({'error': 'Server error', 'message': str(e)}), 500


@activity_bp.route('/', methods=['POST'])
@jwt_required()
def create_activity():
    """Create new activity."""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['lead_id', 'type', 'description']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        activity = Activity.log(
            lead_id=data['lead_id'],
            activity_type=data['type'],
            description=data['description'],
            user_id=user_id,
            metadata=data.get('metadata')
        )
        
        return jsonify({'activity': activity.to_dict()}), 201
    
    except ValueError as e:
        return jsonify({'error': 'Validation error', 'message': str(e)}), 400
    except Exception as e:
        return jsonify({'error': 'Server error', 'message': str(e)}), 500


@activity_bp.route('/recent', methods=['GET'])
@jwt_required()
def get_recent_activities():
    """Get recent activities across all leads."""
    try:
        limit = request.args.get('limit', 50, type=int)
        activities = Activity.get_recent(limit=limit)
        
        return jsonify({
            'activities': [activity.to_dict() for activity in activities]
        }), 200
    
    except Exception as e:
        return jsonify({'error': 'Server error', 'message': str(e)}), 500
