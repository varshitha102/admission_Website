"""Task service."""
from datetime import datetime, timedelta
from sqlalchemy import desc
from models import Task, Lead, Activity
from extensions import db


class TaskService:
    """Service for task operations."""
    
    @staticmethod
    def get_tasks(filters: dict = None, page: int = 1, per_page: int = 20) -> dict:
        """Get tasks with pagination and filters."""
        filters = filters or {}
        query = Task.query
        
        # Apply filters
        if filters.get('status'):
            query = query.filter_by(status=filters['status'])
        
        if filters.get('assigned_to'):
            query = query.filter_by(assigned_to=filters['assigned_to'])
        
        if filters.get('lead_id'):
            query = query.filter_by(lead_id=filters['lead_id'])
        
        if filters.get('priority'):
            query = query.filter_by(priority=filters['priority'])
        
        if filters.get('task_type'):
            query = query.filter_by(task_type=filters['task_type'])
        
        if filters.get('overdue_only'):
            query = query.filter(
                Task.due_date < datetime.utcnow(),
                Task.status.in_(['pending', 'in_progress'])
            )
        
        # Order by due_date asc, priority desc
        query = query.order_by(Task.due_date.asc(), desc(Task.priority))
        
        # Pagination
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        
        return {
            'items': [task.to_dict() for task in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': page,
            'per_page': per_page
        }
    
    @staticmethod
    def get_task(task_id: int) -> Task:
        """Get single task by ID."""
        task = Task.query.get(task_id)
        if not task:
            raise ValueError("Task not found")
        return task
    
    @staticmethod
    def create_task(data: dict, user_id: int = None) -> Task:
        """Create a new task."""
        task = Task(
            title=data['title'],
            description=data.get('description'),
            task_type=data.get('task_type', 'follow_up'),
            due_date=data.get('due_date'),
            status='pending',
            priority=data.get('priority', 'medium'),
            assigned_to=data.get('assigned_to'),
            lead_id=data.get('lead_id'),
            created_by=user_id
        )
        
        db.session.add(task)
        db.session.commit()
        
        # Log activity if linked to lead
        if task.lead_id:
            Activity.log(
                lead_id=task.lead_id,
                activity_type='task_created',
                description=f"Task created: {task.title}",
                user_id=user_id,
                metadata={'task_id': task.id}
            )
        
        return task
    
    @staticmethod
    def update_task(task_id: int, data: dict, user_id: int = None) -> Task:
        """Update task."""
        task = Task.query.get(task_id)
        if not task:
            raise ValueError("Task not found")
        
        # Update fields
        if 'title' in data:
            task.title = data['title']
        if 'description' in data:
            task.description = data['description']
        if 'due_date' in data:
            task.due_date = data['due_date']
        if 'priority' in data:
            task.priority = data['priority']
        if 'assigned_to' in data:
            task.assigned_to = data['assigned_to']
        if 'status' in data:
            task.status = data['status']
        
        task.updated_at = datetime.utcnow()
        db.session.commit()
        
        return task
    
    @staticmethod
    def complete_task(task_id: int, user_id: int = None, notes: str = None) -> Task:
        """Mark task as completed."""
        task = Task.query.get(task_id)
        if not task:
            raise ValueError("Task not found")
        
        task.complete(user_id, notes)
        
        # Log activity if linked to lead
        if task.lead_id:
            Activity.log(
                lead_id=task.lead_id,
                activity_type='task_completed',
                description=f"Task completed: {task.title}",
                user_id=user_id,
                metadata={'task_id': task.id, 'notes': notes}
            )
        
        return task
    
    @staticmethod
    def delete_task(task_id: int) -> None:
        """Delete task."""
        task = Task.query.get(task_id)
        if not task:
            raise ValueError("Task not found")
        
        db.session.delete(task)
        db.session.commit()
    
    @staticmethod
    def create_follow_up_task(lead_id: int, assigned_to: int = None, 
                               due_hours: int = 24, description: str = None) -> Task:
        """Create a follow-up task for a lead."""
        lead = Lead.query.get(lead_id)
        if not lead:
            raise ValueError("Lead not found")
        
        due_date = datetime.utcnow() + timedelta(hours=due_hours)
        
        task = Task(
            title=f"Follow-up: {lead.get_full_name()}",
            description=description or f"Follow up with {lead.get_full_name()}",
            task_type='follow_up',
            due_date=due_date,
            status='pending',
            priority='medium',
            assigned_to=assigned_to or lead.assigned_to,
            lead_id=lead_id
        )
        
        db.session.add(task)
        db.session.commit()
        
        return task
    
    @staticmethod
    def get_pending_count(user_id: int = None) -> int:
        """Get count of pending tasks."""
        query = Task.query.filter_by(status='pending')
        if user_id:
            query = query.filter_by(assigned_to=user_id)
        return query.count()
    
    @staticmethod
    def get_overdue_count(user_id: int = None) -> int:
        """Get count of overdue tasks."""
        query = Task.query.filter(
            Task.due_date < datetime.utcnow(),
            Task.status.in_(['pending', 'in_progress'])
        )
        if user_id:
            query = query.filter_by(assigned_to=user_id)
        return query.count()
    
    @staticmethod
    def create_application_checklist(application_id: int, lead_id: int) -> list:
        """Create checklist tasks for new application."""
        tasks = []
        
        checklist_items = [
            {'title': 'Verify documents', 'type': 'document_collection', 'priority': 'high'},
            {'title': 'Process fee payment', 'type': 'fee_reminder', 'priority': 'high'},
            {'title': 'Review application', 'type': 'follow_up', 'priority': 'medium'},
            {'title': 'Schedule interview', 'type': 'follow_up', 'priority': 'medium'}
        ]
        
        for item in checklist_items:
            task = Task(
                title=item['title'],
                description=f"Application checklist: {item['title']}",
                task_type=item['type'],
                due_date=datetime.utcnow() + timedelta(days=3),
                status='pending',
                priority=item['priority'],
                lead_id=lead_id
            )
            db.session.add(task)
            tasks.append(task)
        
        db.session.commit()
        return tasks
    
    @staticmethod
    def check_and_create_inactivity_tasks() -> int:
        """Check for inactive leads and create follow-up tasks."""
        from models import Lead
        
        inactive_leads = Lead.get_inactive_leads(hours=48)
        created_count = 0
        
        for lead in inactive_leads:
            # Check if there's already a pending follow-up task
            existing = Task.query.filter_by(
                lead_id=lead.id,
                task_type='follow_up',
                status='pending'
            ).first()
            
            if not existing:
                TaskService.create_follow_up_task(
                    lead_id=lead.id,
                    assigned_to=lead.assigned_to,
                    due_hours=24,
                    description=f"Lead has been inactive for 48+ hours. Follow up required."
                )
                created_count += 1
        
        return created_count
