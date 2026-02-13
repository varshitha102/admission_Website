"""Admin routes."""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models import Stage, Source, Workflow
from extensions import db
from middleware import admin_required

admin_bp = Blueprint('admin', __name__, url_prefix='/admin')


# Stage Management
@admin_bp.route('/stages', methods=['GET'])
@jwt_required()
def get_stages():
    """Get all stages."""
    try:
        stage_type = request.args.get('type')
        
        query = Stage.query
        if stage_type:
            query = query.filter_by(type=stage_type)
        
        stages = query.order_by(Stage.order).all()
        return jsonify({'stages': [stage.to_dict() for stage in stages]}), 200
    except Exception as e:
        return jsonify({'error': 'Server error', 'message': str(e)}), 500


@admin_bp.route('/stages', methods=['POST'])
@jwt_required()
@admin_required
def create_stage():
    """Create new stage (Admin only)."""
    try:
        data = request.get_json()
        
        required_fields = ['name', 'type']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        stage = Stage(
            name=data['name'],
            type=data['type'],
            order=data.get('order', 0),
            is_active=data.get('is_active', True)
        )
        
        db.session.add(stage)
        db.session.commit()
        
        return jsonify({'stage': stage.to_dict()}), 201
    
    except Exception as e:
        return jsonify({'error': 'Server error', 'message': str(e)}), 500


@admin_bp.route('/stages/<int:stage_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_stage(stage_id):
    """Update stage (Admin only)."""
    try:
        stage = Stage.query.get(stage_id)
        if not stage:
            return jsonify({'error': 'Stage not found'}), 404
        
        data = request.get_json()
        
        if 'name' in data:
            stage.name = data['name']
        if 'order' in data:
            stage.order = data['order']
        if 'is_active' in data:
            stage.is_active = data['is_active']
        
        db.session.commit()
        
        return jsonify({'stage': stage.to_dict()}), 200
    
    except Exception as e:
        return jsonify({'error': 'Server error', 'message': str(e)}), 500


# Source Management
@admin_bp.route('/sources', methods=['GET'])
@jwt_required()
def get_sources():
    """Get all sources."""
    try:
        sources = Source.query.filter_by(is_active=True).all()
        return jsonify({'sources': [source.to_dict() for source in sources]}), 200
    except Exception as e:
        return jsonify({'error': 'Server error', 'message': str(e)}), 500


@admin_bp.route('/sources', methods=['POST'])
@jwt_required()
@admin_required
def create_source():
    """Create new source (Admin only)."""
    try:
        data = request.get_json()
        
        required_fields = ['name', 'category']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        source = Source(
            name=data['name'],
            category=data['category'],
            is_active=data.get('is_active', True)
        )
        
        db.session.add(source)
        db.session.commit()
        
        return jsonify({'source': source.to_dict()}), 201
    
    except Exception as e:
        return jsonify({'error': 'Server error', 'message': str(e)}), 500


@admin_bp.route('/sources/<int:source_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_source(source_id):
    """Update source (Admin only)."""
    try:
        source = Source.query.get(source_id)
        if not source:
            return jsonify({'error': 'Source not found'}), 404
        
        data = request.get_json()
        
        if 'name' in data:
            source.name = data['name']
        if 'category' in data:
            source.category = data['category']
        if 'is_active' in data:
            source.is_active = data['is_active']
        
        db.session.commit()
        
        return jsonify({'source': source.to_dict()}), 200
    
    except Exception as e:
        return jsonify({'error': 'Server error', 'message': str(e)}), 500


# Workflow Management
@admin_bp.route('/workflows', methods=['GET'])
@jwt_required()
@admin_required
def get_workflows():
    """Get all workflows (Admin only)."""
    try:
        workflows = Workflow.query.order_by(Workflow.created_at.desc()).all()
        return jsonify({'workflows': [wf.to_dict() for wf in workflows]}), 200
    except Exception as e:
        return jsonify({'error': 'Server error', 'message': str(e)}), 500


@admin_bp.route('/workflows', methods=['POST'])
@jwt_required()
@admin_required
def create_workflow():
    """Create new workflow (Admin only)."""
    try:
        data = request.get_json()
        
        required_fields = ['name', 'trigger', 'actions_json']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        workflow = Workflow(
            name=data['name'],
            description=data.get('description'),
            trigger=data['trigger'],
            trigger_conditions=data.get('trigger_conditions', {}),
            actions_json=data['actions_json'],
            active=data.get('active', True)
        )
        
        db.session.add(workflow)
        db.session.commit()
        
        return jsonify({'workflow': workflow.to_dict()}), 201
    
    except Exception as e:
        return jsonify({'error': 'Server error', 'message': str(e)}), 500


@admin_bp.route('/workflows/<int:workflow_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_workflow(workflow_id):
    """Update workflow (Admin only)."""
    try:
        workflow = Workflow.query.get(workflow_id)
        if not workflow:
            return jsonify({'error': 'Workflow not found'}), 404
        
        data = request.get_json()
        
        if 'name' in data:
            workflow.name = data['name']
        if 'description' in data:
            workflow.description = data['description']
        if 'trigger' in data:
            workflow.trigger = data['trigger']
        if 'trigger_conditions' in data:
            workflow.trigger_conditions = data['trigger_conditions']
        if 'actions_json' in data:
            workflow.actions_json = data['actions_json']
        if 'active' in data:
            workflow.active = data['active']
        
        db.session.commit()
        
        return jsonify({'workflow': workflow.to_dict()}), 200
    
    except Exception as e:
        return jsonify({'error': 'Server error', 'message': str(e)}), 500


@admin_bp.route('/workflows/<int:workflow_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_workflow(workflow_id):
    """Delete workflow (Admin only)."""
    try:
        workflow = Workflow.query.get(workflow_id)
        if not workflow:
            return jsonify({'error': 'Workflow not found'}), 404
        
        db.session.delete(workflow)
        db.session.commit()
        
        return jsonify({'message': 'Workflow deleted successfully'}), 200
    
    except Exception as e:
        return jsonify({'error': 'Server error', 'message': str(e)}), 500


# System Stats
@admin_bp.route('/stats', methods=['GET'])
@jwt_required()
@admin_required
def get_system_stats():
    """Get system-wide statistics (Admin only)."""
    try:
        from models import User, Lead, Application, Task
        
        stats = {
            'users': {
                'total': User.query.count(),
                'active': User.query.filter_by(is_active=True).count(),
                'by_role': {}
            },
            'leads': {
                'total': Lead.query.count(),
                'active': Lead.query.filter_by(status='active').count(),
                'converted': Lead.query.filter_by(status='converted').count()
            },
            'applications': {
                'total': Application.query.count(),
                'in_progress': Application.query.filter_by(overall_status='in_progress').count(),
                'completed': Application.query.filter_by(overall_status='completed').count()
            },
            'tasks': {
                'total': Task.query.count(),
                'pending': Task.query.filter_by(status='pending').count(),
                'completed': Task.query.filter_by(status='completed').count()
            }
        }
        
        # Get users by role
        for role in User.ROLES:
            count = User.query.filter_by(role=role).count()
            stats['users']['by_role'][role] = count
        
        return jsonify(stats), 200
    
    except Exception as e:
        return jsonify({'error': 'Server error', 'message': str(e)}), 500
