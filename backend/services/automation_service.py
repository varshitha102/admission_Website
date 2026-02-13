"""Automation service."""
from datetime import datetime, timedelta
from models import Workflow, Lead, Application, Task, Activity
from extensions import db, scheduler
from services.task_service import TaskService
import json


class AutomationService:
    """Service for workflow automation."""
    
    @staticmethod
    def trigger_workflow(trigger: str, context: dict) -> list:
        """Trigger workflows for a specific event."""
        workflows = Workflow.get_active_for_trigger(trigger)
        executed = []
        
        for workflow in workflows:
            try:
                # Check conditions
                if AutomationService._check_conditions(workflow.trigger_conditions, context):
                    # Execute actions
                    AutomationService._execute_actions(workflow, context)
                    workflow.increment_execution()
                    executed.append(workflow.id)
            except Exception as e:
                # Log error but continue with other workflows
                print(f"Error executing workflow {workflow.id}: {str(e)}")
        
        return executed
    
    @staticmethod
    def _check_conditions(conditions: dict, context: dict) -> bool:
        """Check if workflow conditions are met."""
        if not conditions:
            return True
        
        for key, value in conditions.items():
            if key not in context or context[key] != value:
                return False
        
        return True
    
    @staticmethod
    def _execute_actions(workflow: Workflow, context: dict) -> None:
        """Execute workflow actions."""
        actions = workflow.get_actions()
        lead_id = context.get('lead_id')
        user_id = context.get('user_id')
        
        for action in actions:
            action_type = action.get('type')
            
            if action_type == 'create_task':
                AutomationService._create_task_action(action, lead_id, user_id)
            elif action_type == 'create_activity':
                AutomationService._create_activity_action(action, lead_id, user_id)
            elif action_type == 'change_stage':
                AutomationService._change_stage_action(action, lead_id)
            elif action_type == 'assign_user':
                AutomationService._assign_user_action(action, lead_id)
            elif action_type == 'send_email':
                AutomationService._send_email_action(action, context)
            elif action_type == 'webhook':
                AutomationService._webhook_action(action, context)
    
    @staticmethod
    def _create_task_action(action: dict, lead_id: int, user_id: int) -> None:
        """Create task action."""
        if not lead_id:
            return
        
        lead = Lead.query.get(lead_id)
        if not lead:
            return
        
        due_hours = action.get('due_hours', 24)
        due_date = datetime.utcnow() + timedelta(hours=due_hours)
        
        task = Task(
            title=action.get('title', 'New Task'),
            description=action.get('description', ''),
            task_type=action.get('task_type', 'follow_up'),
            due_date=due_date,
            status='pending',
            priority=action.get('priority', 'medium'),
            assigned_to=action.get('assigned_to') or lead.assigned_to,
            lead_id=lead_id
        )
        
        db.session.add(task)
        db.session.commit()
    
    @staticmethod
    def _create_activity_action(action: dict, lead_id: int, user_id: int) -> None:
        """Create activity action."""
        if not lead_id:
            return
        
        Activity.log(
            lead_id=lead_id,
            activity_type=action.get('activity_type', 'system'),
            description=action.get('description', 'Automated activity'),
            user_id=user_id
        )
    
    @staticmethod
    def _change_stage_action(action: dict, lead_id: int) -> None:
        """Change stage action."""
        if not lead_id:
            return
        
        from services.lead_service import LeadService
        stage_id = action.get('stage_id')
        if stage_id:
            LeadService.change_stage(lead_id, stage_id)
    
    @staticmethod
    def _assign_user_action(action: dict, lead_id: int) -> None:
        """Assign user action."""
        if not lead_id:
            return
        
        lead = Lead.query.get(lead_id)
        if lead:
            lead.assigned_to = action.get('user_id')
            db.session.commit()
    
    @staticmethod
    def _send_email_action(action: dict, context: dict) -> None:
        """Send email action (placeholder)."""
        # This would integrate with an email service
        # For now, just log it
        print(f"Would send email: {action.get('subject')} to {context.get('email')}")
    
    @staticmethod
    def _webhook_action(action: dict, context: dict) -> None:
        """Webhook action (placeholder)."""
        # This would make HTTP request to external service
        import requests
        
        url = action.get('url')
        if url:
            try:
                requests.post(url, json=context, timeout=5)
            except Exception as e:
                print(f"Webhook error: {str(e)}")
    
    @staticmethod
    def setup_scheduled_jobs():
        """Setup scheduled background jobs."""
        # Check for inactive leads every hour
        scheduler.add_job(
            AutomationService._check_inactive_leads,
            'interval',
            hours=1,
            id='check_inactive_leads',
            replace_existing=True
        )
        
        # Start scheduler
        scheduler.start()
    
    @staticmethod
    def _check_inactive_leads():
        """Check for inactive leads and create follow-up tasks."""
        from services.task_service import TaskService
        count = TaskService.check_and_create_inactivity_tasks()
        if count > 0:
            print(f"Created {count} follow-up tasks for inactive leads")
    
    @staticmethod
    def on_lead_created(lead_id: int, user_id: int = None) -> None:
        """Handle lead created event."""
        context = {'lead_id': lead_id, 'user_id': user_id}
        AutomationService.trigger_workflow('lead_created', context)
    
    @staticmethod
    def on_stage_changed(lead_id: int, old_stage_id: int, new_stage_id: int, user_id: int = None) -> None:
        """Handle stage changed event."""
        context = {
            'lead_id': lead_id,
            'old_stage_id': old_stage_id,
            'new_stage_id': new_stage_id,
            'user_id': user_id
        }
        AutomationService.trigger_workflow('stage_changed', context)
    
    @staticmethod
    def on_application_created(application_id: int, lead_id: int, user_id: int = None) -> None:
        """Handle application created event."""
        context = {
            'application_id': application_id,
            'lead_id': lead_id,
            'user_id': user_id
        }
        AutomationService.trigger_workflow('application_created', context)
        
        # Create checklist tasks
        TaskService.create_application_checklist(application_id, lead_id)
    
    @staticmethod
    def on_task_completed(task_id: int, user_id: int = None) -> None:
        """Handle task completed event."""
        task = Task.query.get(task_id)
        if task:
            context = {
                'task_id': task_id,
                'lead_id': task.lead_id,
                'user_id': user_id
            }
            AutomationService.trigger_workflow('task_completed', context)
