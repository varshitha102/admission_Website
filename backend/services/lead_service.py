"""Lead service."""
from datetime import datetime
from sqlalchemy import or_, and_, desc
from models import Lead, Application, Activity, Task, Stage, Source
from extensions import db


class LeadService:
    """Service for lead operations."""
    
    @staticmethod
    def get_leads(filters: dict = None, page: int = 1, per_page: int = 20) -> dict:
        """Get leads with pagination and filters."""
        filters = filters or {}
        query = Lead.query
        
        # Apply filters
        if filters.get('search'):
            search = f"%{filters['search']}%"
            query = query.filter(
                or_(
                    Lead.first_name.ilike(search),
                    Lead.last_name.ilike(search),
                    Lead.email.ilike(search),
                    Lead.phone.ilike(search)
                )
            )
        
        if filters.get('stage_id'):
            query = query.filter_by(stage_id=filters['stage_id'])
        
        if filters.get('source_id'):
            query = query.filter_by(source_id=filters['source_id'])
        
        if filters.get('assigned_to'):
            query = query.filter_by(assigned_to=filters['assigned_to'])
        
        if filters.get('status'):
            query = query.filter_by(status=filters['status'])
        
        # Role-based filtering
        if filters.get('user_role') == 'Executive':
            query = query.filter_by(assigned_to=filters.get('user_id'))
        elif filters.get('user_role') == 'Consultant':
            # Consultants only see early stage leads
            early_stages = Stage.query.filter(
                Stage.type == 'lead',
                Stage.order <= 2
            ).all()
            stage_ids = [s.id for s in early_stages]
            query = query.filter(
                and_(
                    Lead.stage_id.in_(stage_ids),
                    Lead.assigned_to == filters.get('user_id')
                )
            )
        
        # Order by created_at desc
        query = query.order_by(desc(Lead.created_at))
        
        # Pagination
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        
        return {
            'items': [lead.to_dict(mask_sensitive=filters.get('mask_sensitive', False)) 
                      for lead in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': page,
            'per_page': per_page
        }
    
    @staticmethod
    def get_lead(lead_id: int, mask_sensitive: bool = False) -> Lead:
        """Get single lead by ID."""
        lead = Lead.query.get(lead_id)
        if not lead:
            raise ValueError("Lead not found")
        return lead
    
    @staticmethod
    def create_lead(data: dict, user_id: int = None) -> Lead:
        """Create a new lead."""
        # Check for existing lead with same email
        existing = Lead.get_by_email(data['email'])
        if existing:
            # Increment re-inquiry count
            existing.increment_reinquiry()
            # Update existing lead
            existing.first_name = data.get('first_name', existing.first_name)
            existing.last_name = data.get('last_name', existing.last_name)
            existing.phone = data.get('phone', existing.phone)
            existing.source_id = data.get('source_id', existing.source_id)
            existing.updated_at = datetime.utcnow()
            db.session.commit()
            
            # Log activity
            Activity.log(
                lead_id=existing.id,
                activity_type='system',
                description=f"Re-inquiry received (count: {existing.re_inquiry_count})",
                user_id=user_id
            )
            
            return existing
        
        # Get default stage (Inquiry)
        default_stage = Stage.query.filter_by(name='Inquiry', type='lead').first()
        
        lead = Lead(
            first_name=data['first_name'],
            last_name=data['last_name'],
            email=data['email'],
            phone=data.get('phone'),
            source_id=data.get('source_id'),
            stage_id=data.get('stage_id', default_stage.id if default_stage else None),
            assigned_to=data.get('assigned_to'),
            status='active',
            re_inquiry_count=0
        )
        
        db.session.add(lead)
        db.session.commit()
        
        # Log activity
        Activity.log(
            lead_id=lead.id,
            activity_type='lead_created',
            description=f"New lead created: {lead.get_full_name()}",
            user_id=user_id
        )
        
        return lead
    
    @staticmethod
    def update_lead(lead_id: int, data: dict, user_id: int = None) -> Lead:
        """Update lead."""
        lead = Lead.query.get(lead_id)
        if not lead:
            raise ValueError("Lead not found")
        
        old_stage_id = lead.stage_id
        
        # Update fields
        if 'first_name' in data:
            lead.first_name = data['first_name']
        if 'last_name' in data:
            lead.last_name = data['last_name']
        if 'phone' in data:
            lead.phone = data['phone']
        if 'source_id' in data:
            lead.source_id = data['source_id']
        if 'stage_id' in data:
            lead.stage_id = data['stage_id']
        if 'assigned_to' in data:
            lead.assigned_to = data['assigned_to']
        if 'status' in data:
            lead.status = data['status']
        
        lead.updated_at = datetime.utcnow()
        db.session.commit()
        
        # Log stage change if applicable
        if 'stage_id' in data and data['stage_id'] != old_stage_id:
            old_stage = Stage.query.get(old_stage_id)
            new_stage = Stage.query.get(data['stage_id'])
            Activity.log(
                lead_id=lead.id,
                activity_type='stage_change',
                description=f"Stage changed from '{old_stage.name if old_stage else 'None'}' to '{new_stage.name if new_stage else 'None'}'",
                user_id=user_id,
                metadata={'old_stage_id': old_stage_id, 'new_stage_id': data['stage_id']}
            )
        
        # Log update
        Activity.log(
            lead_id=lead.id,
            activity_type='lead_updated',
            description="Lead information updated",
            user_id=user_id
        )
        
        return lead
    
    @staticmethod
    def delete_lead(lead_id: int) -> None:
        """Delete lead."""
        lead = Lead.query.get(lead_id)
        if not lead:
            raise ValueError("Lead not found")
        
        db.session.delete(lead)
        db.session.commit()
    
    @staticmethod
    def change_stage(lead_id: int, stage_id: int, user_id: int = None) -> Lead:
        """Change lead stage."""
        lead = Lead.query.get(lead_id)
        if not lead:
            raise ValueError("Lead not found")
        
        stage = Stage.query.get(stage_id)
        if not stage:
            raise ValueError("Stage not found")
        
        old_stage_id = lead.stage_id
        lead.stage_id = stage_id
        lead.updated_at = datetime.utcnow()
        db.session.commit()
        
        # Log activity
        old_stage = Stage.query.get(old_stage_id)
        Activity.log(
            lead_id=lead.id,
            activity_type='stage_change',
            description=f"Stage changed from '{old_stage.name if old_stage else 'None'}' to '{stage.name}'",
            user_id=user_id,
            metadata={'old_stage_id': old_stage_id, 'new_stage_id': stage_id}
        )
        
        return lead
    
    @staticmethod
    def convert_to_application(lead_id: int, user_id: int = None) -> Application:
        """Convert lead to application."""
        lead = Lead.query.get(lead_id)
        if not lead:
            raise ValueError("Lead not found")
        
        if lead.application:
            raise ValueError("Lead already has an application")
        
        # Create application
        application = Application(
            lead_id=lead_id,
            document_status='pending',
            fee_status='pending',
            admission_status='pending',
            enrollment_status='pending',
            overall_status='in_progress'
        )
        
        # Update lead status
        lead.status = 'converted'
        
        db.session.add(application)
        db.session.commit()
        
        # Log activity
        Activity.log(
            lead_id=lead.id,
            activity_type='application_created',
            description="Lead converted to application",
            user_id=user_id
        )
        
        return application
    
    @staticmethod
    def get_kpis() -> dict:
        """Get lead KPIs."""
        total_leads = Lead.query.count()
        active_leads = Lead.query.filter_by(status='active').count()
        converted_leads = Lead.query.filter_by(status='converted').count()
        new_this_month = Lead.query.filter(
            db.extract('month', Lead.created_at) == datetime.utcnow().month,
            db.extract('year', Lead.created_at) == datetime.utcnow().year
        ).count()
        
        return {
            'total_leads': total_leads,
            'active_leads': active_leads,
            'converted_leads': converted_leads,
            'new_this_month': new_this_month,
            'conversion_rate': (converted_leads / total_leads * 100) if total_leads > 0 else 0
        }
    
    @staticmethod
    def get_stage_distribution() -> list:
        """Get leads distribution by stage."""
        stages = Stage.query.filter_by(type='lead', is_active=True).all()
        distribution = []
        
        for stage in stages:
            count = Lead.query.filter_by(stage_id=stage.id).count()
            distribution.append({
                'stage_id': stage.id,
                'stage_name': stage.name,
                'count': count
            })
        
        return distribution
    
    @staticmethod
    def get_source_distribution() -> list:
        """Get leads distribution by source."""
        sources = Source.query.filter_by(is_active=True).all()
        distribution = []
        
        for source in sources:
            count = Lead.query.filter_by(source_id=source.id).count()
            distribution.append({
                'source_id': source.id,
                'source_name': source.name,
                'category': source.category,
                'count': count
            })
        
        return distribution
