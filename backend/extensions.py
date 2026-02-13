"""Flask extensions initialization."""
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from apscheduler.schedulers.background import BackgroundScheduler

# Database
db = SQLAlchemy()

# Migrations
migrate = Migrate()

# CORS
cors = CORS()

# JWT
jwt = JWTManager()

# Background Scheduler
scheduler = BackgroundScheduler()
