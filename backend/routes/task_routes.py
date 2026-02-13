"""Task routes."""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from services import TaskService
from middleware import admin_required

task_bp = Blueprint('tasks', __name__, url_prefix='/tasks')


@task_bp.route('/', methods=['GET'])
@jwt_required()
def get_tasks():
    """Get tasks with pagination and filters."""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        # Filters
        filters = {
            'status': request.args.get('status'),
            'assigned_to': request.args.get('assigned_to', type=int),
            'lead_id': request.args.get('lead_id', type=int),
            'priority': request.args.get('priority'),
            'task_type': request.args.get('task_type'),
            'overdue_only': request.args.get('overdue_only', 'false').lower() == 'true'
        }
        
        # Remove None values
        filters = {k: v for k, v in filters.items() if v is not None}
        
        result = TaskService.get_tasks(filters, page, per_page)
        return jsonify(result), 200
    
    except Exception as e:
        return jsonify({'error': 'Server error', 'message': str(e)}), 500


@task_bp.route('/<int:task_id>', methods=['GET'])
@jwt_required()
def get_task(task_id):
    """Get single task."""
    try:
        task = TaskService.get_task(task_id)
        return jsonify({'task': task.to_dict()}), 200
    
    except ValueError as e:
        return jsonify({'error': 'Task not found', 'message': str(e)}), 404
    except Exception as e:
        return jsonify({'error': 'Server error', 'message': str(e)}), 500


@task_bp.route('/', methods=['POST'])
@jwt_required()
def create_task():
    """Create new task."""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Validate required fields
        if not data.get('title'):
            return jsonify({'error': 'title is required'}), 400
        
        task = TaskService.create_task(data, user_id)
        return jsonify({'task': task.to_dict()}), 201
    
    except ValueError as e:
        return jsonify({'error': 'Validation error', 'message': str(e)}), 400
    except Exception as e:
        return jsonify({'error': 'Server error', 'message': str(e)}), 500


@task_bp.route('/<int:task_id>', methods=['PUT'])
@jwt_required()
def update_task(task_id):
    """Update task."""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        task = TaskService.update_task(task_id, data, user_id)
        return jsonify({'task': task.to_dict()}), 200
    
    except ValueError as e:
        return jsonify({'error': 'Task not found', 'message': str(e)}), 404
    except Exception as e:
        return jsonify({'error': 'Server error', 'message': str(e)}), 500


@task_bp.route('/<int:task_id>/complete', methods=['PATCH'])
@jwt_required()
def complete_task(task_id):
    """Mark task as completed."""
    try:
        user_id = get_jwt_identity()
        data = request.get_json() or {}
        
        task = TaskService.complete_task(task_id, user_id, data.get('notes'))
        return jsonify({'task': task.to_dict()}), 200
    
    except ValueError as e:
        return jsonify({'error': 'Task not found', 'message': str(e)}), 404
    except Exception as e:
        return jsonify({'error': 'Server error', 'message': str(e)}), 500


@task_bp.route('/<int:task_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_task(task_id):
    """Delete task (Admin only)."""
    try:
        TaskService.delete_task(task_id)
        return jsonify({'message': 'Task deleted successfully'}), 200
    
    except ValueError as e:
        return jsonify({'error': 'Task not found', 'message': str(e)}), 404
    except Exception as e:
        return jsonify({'error': 'Server error', 'message': str(e)}), 500


@task_bp.route('/pending', methods=['GET'])
@jwt_required()
def get_pending_tasks():
    """Get pending tasks for current user."""
    try:
        user_id = get_jwt_identity()
        claims = get_jwt()
        user_role = claims.get('role')
        
        # Admin sees all pending, others see their own
        target_user = None if user_role == 'Admin' else user_id
        
        from models import Task
        tasks = Task.query.filter_by(status='pending')
        if target_user:
            tasks = tasks.filter_by(assigned_to=target_user)
        
        tasks = tasks.order_by(Task.due_date.asc()).all()
        
        return jsonify({'tasks': [task.to_dict() for task in tasks]}), 200
    
    except Exception as e:
        return jsonify({'error': 'Server error', 'message': str(e)}), 500


@task_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_stats():
    """Get task statistics."""
    try:
        from models import Task
        stats = Task.get_stats()
        return jsonify(stats), 200
    except Exception as e:
        return jsonify({'error': 'Server error', 'message': str(e)}), 500
