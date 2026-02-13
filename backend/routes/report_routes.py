"""Report routes."""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from services import ReportService
from middleware import manager_required

report_bp = Blueprint('reports', __name__, url_prefix='/reports')


@report_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard_stats():
    """Get dashboard statistics."""
    try:
        stats = ReportService.get_dashboard_stats()
        return jsonify(stats), 200
    except Exception as e:
        return jsonify({'error': 'Server error', 'message': str(e)}), 500


@report_bp.route('/conversion', methods=['GET'])
@jwt_required()
def get_conversion_funnel():
    """Get conversion funnel data."""
    try:
        funnel = ReportService.get_conversion_funnel()
        return jsonify({'funnel': funnel}), 200
    except Exception as e:
        return jsonify({'error': 'Server error', 'message': str(e)}), 500


@report_bp.route('/source-performance', methods=['GET'])
@jwt_required()
def get_source_performance():
    """Get source performance report."""
    try:
        days = request.args.get('days', 30, type=int)
        performance = ReportService.get_source_performance(days)
        return jsonify({'performance': performance}), 200
    except Exception as e:
        return jsonify({'error': 'Server error', 'message': str(e)}), 500


@report_bp.route('/lead-trends', methods=['GET'])
@jwt_required()
def get_lead_trends():
    """Get lead trends."""
    try:
        days = request.args.get('days', 30, type=int)
        trends = ReportService.get_lead_trends(days)
        return jsonify({'trends': trends}), 200
    except Exception as e:
        return jsonify({'error': 'Server error', 'message': str(e)}), 500


@report_bp.route('/user-performance', methods=['GET'])
@jwt_required()
@manager_required
def get_user_performance():
    """Get user performance report (Manager only)."""
    try:
        days = request.args.get('days', 30, type=int)
        performance = ReportService.get_user_performance(days)
        return jsonify({'performance': performance}), 200
    except Exception as e:
        return jsonify({'error': 'Server error', 'message': str(e)}), 500


@report_bp.route('/stage-distribution', methods=['GET'])
@jwt_required()
def get_stage_distribution():
    """Get stage distribution."""
    try:
        distribution = ReportService.get_stage_distribution()
        return jsonify({'distribution': distribution}), 200
    except Exception as e:
        return jsonify({'error': 'Server error', 'message': str(e)}), 500


@report_bp.route('/application-status', methods=['GET'])
@jwt_required()
def get_application_status():
    """Get application status breakdown."""
    try:
        breakdown = ReportService.get_application_status_breakdown()
        return jsonify(breakdown), 200
    except Exception as e:
        return jsonify({'error': 'Server error', 'message': str(e)}), 500


@report_bp.route('/recent-activities', methods=['GET'])
@jwt_required()
def get_recent_activities():
    """Get recent activities."""
    try:
        limit = request.args.get('limit', 50, type=int)
        activities = ReportService.get_recent_activities(limit)
        return jsonify({'activities': activities}), 200
    except Exception as e:
        return jsonify({'error': 'Server error', 'message': str(e)}), 500
