"""Main Flask application."""
import os
from flask import Flask, jsonify
from config import config_by_name
from extensions import db, migrate, cors, jwt, scheduler
from routes import auth_bp, lead_bp, application_bp, task_bp, activity_bp, report_bp, admin_bp
from services.automation_service import AutomationService



def create_app(config_name=None):
    """Application factory."""
    config_name = config_name or os.environ.get('FLASK_ENV', 'default')
    app = Flask(__name__)
    app.config.from_object(config_by_name[config_name])
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    cors.init_app(app, origins=app.config['CORS_ORIGINS'])
    jwt.init_app(app)
    
    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(lead_bp)
    app.register_blueprint(application_bp)
    app.register_blueprint(task_bp)
    app.register_blueprint(activity_bp)
    app.register_blueprint(report_bp)
    app.register_blueprint(admin_bp)
    
    # Error handlers
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({'error': 'Bad request', 'message': str(error)}), 400
    
    @app.errorhandler(401)
    def unauthorized(error):
        return jsonify({'error': 'Unauthorized', 'message': 'Authentication required'}), 401
    
    @app.errorhandler(403)
    def forbidden(error):
        return jsonify({'error': 'Forbidden', 'message': 'Access denied'}), 403
    
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Not found', 'message': 'Resource not found'}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return jsonify({'error': 'Internal server error', 'message': str(error)}), 500
    
    # Health check endpoint
    @app.route('/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'healthy',
            'service': 'admissions-crm-api',
            'version': '1.0.0'
        }), 200
    
    # Setup scheduled jobs
    with app.app_context():
        AutomationService.setup_scheduled_jobs()
    
    return app


# Create app instance
app = create_app()

# CLI commands
@app.cli.command('init-db')
def init_db():
    """Initialize database with default data."""
    with app.app_context():
        # Create tables
        db.create_all()
        
        # Create default stages
        from models import Stage
        if Stage.query.count() == 0:
            lead_stages = [
                Stage(name='Inquiry', type='lead', order=1),
                Stage(name='Lead', type='lead', order=2),
                Stage(name='Application', type='lead', order=3),
                Stage(name='Admission', type='lead', order=4),
                Stage(name='Enrollment', type='lead', order=5)
            ]
            for stage in lead_stages:
                db.session.add(stage)
        
        # Create default sources
        from models import Source
        if Source.query.count() == 0:
            sources = [
                Source(name='Website', category='Organic'),
                Source(name='Google Ads', category='Paid'),
                Source(name='Facebook', category='Social Media'),
                Source(name='Referral', category='Referral'),
                Source(name='Event', category='Event'),
                Source(name='Direct', category='Direct')
            ]
            for source in sources:
                db.session.add(source)
        
        # Create admin user if not exists
        from models import User
        from services import AuthService
        
        admin = User.query.filter_by(email='admin@university.edu').first()
        if not admin:
            admin_data = {
                'name': 'System Admin',
                'email': 'admin@university.edu',
                'password': 'admin123',
                'role': 'Admin'
            }
            AuthService.create_user(admin_data)
            print("Admin user created: admin@university.edu / admin123")
        
        db.session.commit()
        print("Database initialized successfully!")


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
