"""Application routes."""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Application
from extensions import db
from middleware import admin_required

application_bp = Blueprint('applications', __name__, url_prefix='/applications')


@application_bp.route('/', methods=['GET'])
@jwt_required()
def get_applications():
    """Get applications with pagination and filters."""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        query = Application.query
        
        # Apply filters
        if request.args.get('lead_id'):
            query = query.filter_by(lead_id=request.args.get('lead_id', type=int))
        if request.args.get('document_status'):
            query = query.filter_by(document_status=request.args.get('document_status'))
        if request.args.get('fee_status'):
            query = query.filter_by(fee_status=request.args.get('fee_status'))
        if request.args.get('admission_status'):
            query = query.filter_by(admission_status=request.args.get('admission_status'))
        if request.args.get('overall_status'):
            query = query.filter_by(overall_status=request.args.get('overall_status'))
        
        # Order by created_at desc
        query = query.order_by(Application.created_at.desc())
        
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        
        return jsonify({
            'items': [app.to_dict() for app in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': page,
            'per_page': per_page
        }), 200
    
    except Exception as e:
        return jsonify({'error': 'Server error', 'message': str(e)}), 500


@application_bp.route('/<int:application_id>', methods=['GET'])
@jwt_required()
def get_application(application_id):
    """Get single application."""
    try:
        application = Application.query.get(application_id)
        if not application:
            return jsonify({'error': 'Application not found'}), 404
        
        return jsonify({'application': application.to_dict()}), 200
    
    except Exception as e:
        return jsonify({'error': 'Server error', 'message': str(e)}), 500


@application_bp.route('/convert/<int:lead_id>', methods=['POST'])
@jwt_required()
def convert_lead(lead_id):
    """Convert lead to application."""
    try:
        from services import LeadService
        from services.automation_service import AutomationService
        
        user_id = get_jwt_identity()
        
        application = LeadService.convert_to_application(lead_id, user_id)
        
        # Trigger automation
        AutomationService.on_application_created(application.id, lead_id, user_id)
        
        return jsonify({'application': application.to_dict()}), 201
    
    except ValueError as e:
        return jsonify({'error': 'Conversion failed', 'message': str(e)}), 400
    except Exception as e:
        return jsonify({'error': 'Server error', 'message': str(e)}), 500


@application_bp.route('/<int:application_id>/status', methods=['PUT'])
@jwt_required()
def update_status(application_id):
    """Update application status."""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        application = Application.query.get(application_id)
        if not application:
            return jsonify({'error': 'Application not found'}), 404
        
        # Update status fields
        status_fields = ['document_status', 'fee_status', 'admission_status', 
                        'enrollment_status', 'overall_status']
        
        for field in status_fields:
            if field in data:
                application.update_status(field, data[field])
        
        # Add notes if provided
        if 'document_notes' in data:
            application.document_notes = data['document_notes']
            db.session.commit()
        
        # Log activity
        from models import Activity
        Activity.log(
            lead_id=application.lead_id,
            activity_type='system',
            description=f"Application status updated",
            user_id=user_id,
            metadata={'application_id': application_id, 'updates': data}
        )
        
        return jsonify({'application': application.to_dict()}), 200
    
    except Exception as e:
        return jsonify({'error': 'Server error', 'message': str(e)}), 500


@application_bp.route('/<int:application_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_application(application_id):
    """Delete application (Admin only)."""
    try:
        application = Application.query.get(application_id)
        if not application:
            return jsonify({'error': 'Application not found'}), 404
        
        db.session.delete(application)
        db.session.commit()
        
        return jsonify({'message': 'Application deleted successfully'}), 200
    
    except Exception as e:
        return jsonify({'error': 'Server error', 'message': str(e)}), 500


@application_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_stats():
    """Get application statistics."""
    try:
        stats = Application.get_stats()
        return jsonify(stats), 200
    except Exception as e:
        return jsonify({'error': 'Server error', 'message': str(e)}), 500
