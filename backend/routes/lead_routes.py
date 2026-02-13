"""Lead routes."""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from services import LeadService
from services.automation_service import AutomationService
from middleware import admin_required, role_required

lead_bp = Blueprint('leads', __name__, url_prefix='/leads')


@lead_bp.route('/', methods=['GET'])
@jwt_required()
def get_leads():
    """Get leads with pagination and filters."""
    try:
        claims = get_jwt()
        user_role = claims.get('role')
        user_id = get_jwt_identity()
        
        # Pagination
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        # Filters
        filters = {
            'search': request.args.get('search'),
            'stage_id': request.args.get('stage_id', type=int),
            'source_id': request.args.get('source_id', type=int),
            'assigned_to': request.args.get('assigned_to', type=int),
            'status': request.args.get('status'),
            'user_role': user_role,
            'user_id': user_id,
            'mask_sensitive': user_role != 'Admin'
        }
        
        result = LeadService.get_leads(filters, page, per_page)
        return jsonify(result), 200
    
    except Exception as e:
        return jsonify({'error': 'Server error', 'message': str(e)}), 500


@lead_bp.route('/<int:lead_id>', methods=['GET'])
@jwt_required()
def get_lead(lead_id):
    """Get single lead."""
    try:
        claims = get_jwt()
        user_role = claims.get('role')
        
        lead = LeadService.get_lead(lead_id)
        return jsonify({'lead': lead.to_dict(mask_sensitive=user_role != 'Admin')}), 200
    
    except ValueError as e:
        return jsonify({'error': 'Lead not found', 'message': str(e)}), 404
    except Exception as e:
        return jsonify({'error': 'Server error', 'message': str(e)}), 500


@lead_bp.route('/', methods=['POST'])
@jwt_required()
def create_lead():
    """Create new lead."""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['first_name', 'last_name', 'email']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        lead = LeadService.create_lead(data, user_id)
        
        # Trigger automation
        AutomationService.on_lead_created(lead.id, user_id)
        
        return jsonify({'lead': lead.to_dict()}), 201
    
    except ValueError as e:
        return jsonify({'error': 'Validation error', 'message': str(e)}), 400
    except Exception as e:
        return jsonify({'error': 'Server error', 'message': str(e)}), 500


@lead_bp.route('/<int:lead_id>', methods=['PUT'])
@jwt_required()
def update_lead(lead_id):
    """Update lead."""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        lead = LeadService.update_lead(lead_id, data, user_id)
        return jsonify({'lead': lead.to_dict()}), 200
    
    except ValueError as e:
        return jsonify({'error': 'Lead not found', 'message': str(e)}), 404
    except Exception as e:
        return jsonify({'error': 'Server error', 'message': str(e)}), 500


@lead_bp.route('/<int:lead_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_lead(lead_id):
    """Delete lead (Admin only)."""
    try:
        LeadService.delete_lead(lead_id)
        return jsonify({'message': 'Lead deleted successfully'}), 200
    
    except ValueError as e:
        return jsonify({'error': 'Lead not found', 'message': str(e)}), 404
    except Exception as e:
        return jsonify({'error': 'Server error', 'message': str(e)}), 500


@lead_bp.route('/<int:lead_id>/stage', methods=['PATCH'])
@jwt_required()
def change_stage(lead_id):
    """Change lead stage."""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data.get('stage_id'):
            return jsonify({'error': 'stage_id is required'}), 400
        
        lead = LeadService.change_stage(lead_id, data['stage_id'], user_id)
        
        # Trigger automation
        AutomationService.on_stage_changed(lead_id, data.get('old_stage_id'), data['stage_id'], user_id)
        
        return jsonify({'lead': lead.to_dict()}), 200
    
    except ValueError as e:
        return jsonify({'error': 'Validation error', 'message': str(e)}), 400
    except Exception as e:
        return jsonify({'error': 'Server error', 'message': str(e)}), 500


@lead_bp.route('/<int:lead_id>/convert', methods=['POST'])
@jwt_required()
def convert_to_application(lead_id):
    """Convert lead to application."""
    try:
        user_id = get_jwt_identity()
        
        application = LeadService.convert_to_application(lead_id, user_id)
        
        # Trigger automation
        AutomationService.on_application_created(application.id, lead_id, user_id)
        
        return jsonify({'application': application.to_dict()}), 201
    
    except ValueError as e:
        return jsonify({'error': 'Conversion failed', 'message': str(e)}), 400
    except Exception as e:
        return jsonify({'error': 'Server error', 'message': str(e)}), 500


@lead_bp.route('/kpis', methods=['GET'])
@jwt_required()
def get_kpis():
    """Get lead KPIs."""
    try:
        kpis = LeadService.get_kpis()
        return jsonify(kpis), 200
    except Exception as e:
        return jsonify({'error': 'Server error', 'message': str(e)}), 500


@lead_bp.route('/stage-distribution', methods=['GET'])
@jwt_required()
def get_stage_distribution():
    """Get leads distribution by stage."""
    try:
        distribution = LeadService.get_stage_distribution()
        return jsonify({'distribution': distribution}), 200
    except Exception as e:
        return jsonify({'error': 'Server error', 'message': str(e)}), 500


@lead_bp.route('/source-distribution', methods=['GET'])
@jwt_required()
def get_source_distribution():
    """Get leads distribution by source."""
    try:
        distribution = LeadService.get_source_distribution()
        return jsonify({'distribution': distribution}), 200
    except Exception as e:
        return jsonify({'error': 'Server error', 'message': str(e)}), 500
