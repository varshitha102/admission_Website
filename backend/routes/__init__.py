"""Routes package."""
from .auth_routes import auth_bp
from .lead_routes import lead_bp
from .application_routes import application_bp
from .task_routes import task_bp
from .activity_routes import activity_bp
from .report_routes import report_bp
from .admin_routes import admin_bp

__all__ = [
    'auth_bp',
    'lead_bp',
    'application_bp',
    'task_bp',
    'activity_bp',
    'report_bp',
    'admin_bp'
]
