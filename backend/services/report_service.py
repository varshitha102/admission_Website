"""Report service."""
from datetime import datetime, timedelta
from sqlalchemy import func, extract, desc
from models import Lead, Application, Task, Activity, Source, Stage, User
from extensions import db


class ReportService:
    """Service for generating reports and analytics."""
    
    @staticmethod
    def get_dashboard_stats() -> dict:
        """Get dashboard statistics."""
        # Lead stats
        total_leads = Lead.query.count()
        active_leads = Lead.query.filter_by(status='active').count()
        new_leads_today = Lead.query.filter(
            func.date(Lead.created_at) == func.date(func.now())
        ).count()
        
        # Application stats
        total_applications = Application.query.count()
        pending_applications = Application.query.filter_by(overall_status='in_progress').count()
        completed_applications = Application.query.filter_by(overall_status='completed').count()
        
        # Task stats
        pending_tasks = Task.query.filter_by(status='pending').count()
        overdue_tasks = len(Task.get_overdue_tasks())
        
        # Conversion rate
        conversion_rate = (completed_applications / total_leads * 100) if total_leads > 0 else 0
        
        return {
            'leads': {
                'total': total_leads,
                'active': active_leads,
                'new_today': new_leads_today
            },
            'applications': {
                'total': total_applications,
                'pending': pending_applications,
                'completed': completed_applications
            },
            'tasks': {
                'pending': pending_tasks,
                'overdue': overdue_tasks
            },
            'conversion_rate': round(conversion_rate, 2)
        }
    
    @staticmethod
    def get_conversion_funnel() -> list:
        """Get conversion funnel data."""
        stages = Stage.query.filter_by(type='lead', is_active=True).order_by(Stage.order).all()
        funnel = []
        
        for stage in stages:
            count = Lead.query.filter_by(stage_id=stage.id).count()
            funnel.append({
                'stage': stage.name,
                'count': count
            })
        
        # Add application stages
        app_stages = [
            {'name': 'Document Verification', 'field': 'document_status', 'value': 'verified'},
            {'name': 'Fee Payment', 'field': 'fee_status', 'value': 'paid'},
            {'name': 'Admission Approved', 'field': 'admission_status', 'value': 'approved'},
            {'name': 'Enrolled', 'field': 'enrollment_status', 'value': 'confirmed'}
        ]
        
        for stage in app_stages:
            count = Application.query.filter(
                getattr(Application, stage['field']) == stage['value']
            ).count()
            funnel.append({
                'stage': stage['name'],
                'count': count
            })
        
        return funnel
    
    @staticmethod
    def get_source_performance(days: int = 30) -> list:
        """Get lead source performance."""
        since = datetime.utcnow() - timedelta(days=days)
        
        sources = Source.query.filter_by(is_active=True).all()
        performance = []
        
        for source in sources:
            # Total leads from this source
            total_leads = Lead.query.filter(
                Lead.source_id == source.id,
                Lead.created_at >= since
            ).count()
            
            # Converted leads
            converted = Lead.query.filter(
                Lead.source_id == source.id,
                Lead.status == 'converted',
                Lead.created_at >= since
            ).count()
            
            # Applications
            applications = db.session.query(Application).join(Lead).filter(
                Lead.source_id == source.id,
                Application.created_at >= since
            ).count()
            
            performance.append({
                'source_id': source.id,
                'source_name': source.name,
                'category': source.category,
                'total_leads': total_leads,
                'converted': converted,
                'applications': applications,
                'conversion_rate': round((converted / total_leads * 100), 2) if total_leads > 0 else 0
            })
        
        return sorted(performance, key=lambda x: x['total_leads'], reverse=True)
    
    @staticmethod
    def get_lead_trends(days: int = 30) -> list:
        """Get daily lead creation trends."""
        since = datetime.utcnow() - timedelta(days=days)
        
        results = db.session.query(
            func.date(Lead.created_at).label('date'),
            func.count(Lead.id).label('count')
        ).filter(
            Lead.created_at >= since
        ).group_by(
            func.date(Lead.created_at)
        ).order_by(
            func.date(Lead.created_at)
        ).all()
        
        return [
            {'date': str(r.date), 'count': r.count}
            for r in results
        ]
    
    @staticmethod
    def get_user_performance(days: int = 30) -> list:
        """Get user performance metrics."""
        since = datetime.utcnow() - timedelta(days=days)
        
        users = User.query.filter_by(is_active=True).all()
        performance = []
        
        for user in users:
            # Leads assigned
            leads_assigned = Lead.query.filter_by(assigned_to=user.id).count()
            
            # Leads converted
            leads_converted = Lead.query.filter(
                Lead.assigned_to == user.id,
                Lead.status == 'converted'
            ).count()
            
            # Tasks completed
            tasks_completed = Task.query.filter(
                Task.assigned_to == user.id,
                Task.status == 'completed',
                Task.completed_at >= since
            ).count()
            
            # Activities logged
            activities = Activity.query.filter(
                Activity.user_id == user.id,
                Activity.created_at >= since
            ).count()
            
            performance.append({
                'user_id': user.id,
                'user_name': user.name,
                'role': user.role,
                'leads_assigned': leads_assigned,
                'leads_converted': leads_converted,
                'conversion_rate': round((leads_converted / leads_assigned * 100), 2) if leads_assigned > 0 else 0,
                'tasks_completed': tasks_completed,
                'activities': activities
            })
        
        return sorted(performance, key=lambda x: x['leads_converted'], reverse=True)
    
    @staticmethod
    def get_stage_distribution() -> list:
        """Get leads distribution by stage."""
        stages = Stage.query.filter_by(type='lead', is_active=True).order_by(Stage.order).all()
        
        return [
            {
                'stage_id': stage.id,
                'stage_name': stage.name,
                'count': Lead.query.filter_by(stage_id=stage.id).count()
            }
            for stage in stages
        ]
    
    @staticmethod
    def get_application_status_breakdown() -> dict:
        """Get application status breakdown."""
        return {
            'document_status': {
                'pending': Application.query.filter_by(document_status='pending').count(),
                'verified': Application.query.filter_by(document_status='verified').count(),
                'rejected': Application.query.filter_by(document_status='rejected').count()
            },
            'fee_status': {
                'pending': Application.query.filter_by(fee_status='pending').count(),
                'paid': Application.query.filter_by(fee_status='paid').count(),
                'waived': Application.query.filter_by(fee_status='waived').count()
            },
            'admission_status': {
                'pending': Application.query.filter_by(admission_status='pending').count(),
                'approved': Application.query.filter_by(admission_status='approved').count(),
                'rejected': Application.query.filter_by(admission_status='rejected').count()
            }
        }
    
    @staticmethod
    def get_recent_activities(limit: int = 50) -> list:
        """Get recent activities."""
        activities = Activity.query.order_by(desc(Activity.created_at)).limit(limit).all()
        return [activity.to_dict() for activity in activities]
