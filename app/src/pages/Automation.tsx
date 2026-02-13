import { useState } from 'react';
import { PermissionGate } from '@/components/PermissionGate';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Zap, 
  Plus, 
  Edit2, 
  Trash2, 
  Play,
  Pause,
  Mail,
  MessageSquare,
  UserPlus,
  ArrowRight
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Mock workflows for demonstration
const mockWorkflows = [
  {
    id: 1,
    name: 'New Lead Welcome',
    description: 'Send welcome email when new lead is created',
    trigger: 'lead_created',
    active: true,
    execution_count: 145,
    actions: [{ type: 'send_email' }, { type: 'create_task' }],
  },
  {
    id: 2,
    name: 'Stage Change Notification',
    description: 'Notify team when lead moves to application stage',
    trigger: 'stage_changed',
    active: true,
    execution_count: 89,
    actions: [{ type: 'send_email' }],
  },
  {
    id: 3,
    name: 'Inactive Lead Follow-up',
    description: 'Create follow-up task for inactive leads',
    trigger: 'scheduled_time',
    active: false,
    execution_count: 234,
    actions: [{ type: 'create_task' }],
  },
  {
    id: 4,
    name: 'Application Checklist',
    description: 'Generate checklist tasks when lead converts to application',
    trigger: 'application_created',
    active: true,
    execution_count: 67,
    actions: [{ type: 'create_task' }, { type: 'create_activity' }],
  },
];

const triggerLabels: Record<string, string> = {
  lead_created: 'Lead Created',
  lead_updated: 'Lead Updated',
  stage_changed: 'Stage Changed',
  application_created: 'Application Created',
  task_completed: 'Task Completed',
  scheduled_time: 'Scheduled Time',
};

const actionIcons: Record<string, React.ElementType> = {
  send_email: Mail,
  create_task: UserPlus,
  create_activity: MessageSquare,
};

export function Automation() {
  const [workflows, setWorkflows] = useState(mockWorkflows);

  const toggleWorkflow = (id: number) => {
    setWorkflows(workflows.map(w => 
      w.id === id ? { ...w, active: !w.active } : w
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Automation</h1>
          <p className="text-gray-500">Configure automated workflows</p>
        </div>
        <PermissionGate requireAdmin>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Workflow
          </Button>
        </PermissionGate>
      </div>

      <div className="grid gap-4">
        {workflows.map((workflow) => (
          <Card key={workflow.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-lg">{workflow.name}</h3>
                    <Badge variant={workflow.active ? 'default' : 'secondary'}>
                      {workflow.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">{workflow.description}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Zap className="w-4 h-4" />
                      Trigger: {triggerLabels[workflow.trigger]}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="text-gray-400">|</span>
                      Executed {workflow.execution_count} times
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm text-gray-500">Actions:</span>
                    <div className="flex gap-2">
                      {workflow.actions.map((action, idx) => {
                        const Icon = actionIcons[action.type] || Zap;
                        return (
                          <div 
                            key={idx}
                            className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs"
                          >
                            <Icon className="w-3 h-3" />
                            {action.type.replace('_', ' ')}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <PermissionGate requireAdmin>
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={workflow.active}
                      onCheckedChange={() => toggleWorkflow(workflow.id)}
                    />
                    <Button variant="ghost" size="icon">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </PermissionGate>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {workflows.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Zap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No workflows yet</h3>
            <p className="text-gray-500 mb-4">Create your first automation workflow</p>
            <PermissionGate requireAdmin>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Workflow
              </Button>
            </PermissionGate>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
