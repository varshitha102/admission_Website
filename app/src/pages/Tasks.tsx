import { useState, useEffect } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { DataTable } from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, CheckCircle, Filter, Calendar } from 'lucide-react';
import { Task, TaskFormData } from '@/types';
import { FormField } from '@/components/FormField';

const priorityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
};

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-800',
};

export function Tasks() {
  const { 
    tasks, 
    pagination, 
    isLoading, 
    fetchTasks,
    createTask,
    completeTask 
  } = useTasks();
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    task_type: 'follow_up',
    priority: 'medium',
    due_date: '',
    assigned_to: undefined,
    lead_id: undefined,
  });

  useEffect(() => {
    fetchTasks({ page: currentPage });
  }, [currentPage, fetchTasks]);

  const handleCreate = async () => {
    try {
      await createTask(formData);
      setIsCreateOpen(false);
      setFormData({
        title: '',
        description: '',
        task_type: 'follow_up',
        priority: 'medium',
        due_date: '',
        assigned_to: undefined,
        lead_id: undefined,
      });
      fetchTasks({ page: currentPage });
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleComplete = async (taskId: number) => {
    try {
      await completeTask(taskId);
      fetchTasks({ page: currentPage });
    } catch (error) {
      // Error handled by hook
    }
  };

  const columns = [
    { key: 'title', header: 'Title', sortable: true },
    { key: 'description', header: 'Description', sortable: true },
    { 
      key: 'task_type', 
      header: 'Type',
      render: (task: Task) => task.task_type.replace('_', ' ')
    },
    { 
      key: 'priority', 
      header: 'Priority',
      render: (task: Task) => (
        <Badge className={priorityColors[task.priority] || 'bg-gray-100'}>
          {task.priority}
        </Badge>
      )
    },
    { 
      key: 'status', 
      header: 'Status',
      render: (task: Task) => (
        <Badge className={statusColors[task.status] || 'bg-gray-100'}>
          {task.status}
        </Badge>
      )
    },
    { 
      key: 'due_date', 
      header: 'Due Date',
      render: (task: Task) => task.due_date 
        ? new Date(task.due_date).toLocaleDateString()
        : '-'
    },
    { 
      key: 'assigned_user', 
      header: 'Assigned To',
      render: (task: Task) => task.assigned_user?.name || 'Unassigned'
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-500">Manage follow-ups and reminders</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <FormField
                label="Title"
                name="title"
                type="text"
                value={formData.title}
                onChange={(v) => setFormData({ ...formData, title: v })}
                required
              />
              <FormField
                label="Description"
                name="description"
                type="textarea"
                value={formData.description}
                onChange={(v) => setFormData({ ...formData, description: v })}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="Type"
                  name="task_type"
                  type="select"
                  value={formData.task_type}
                  onChange={(v) => setFormData({ ...formData, task_type: v })}
                  options={[
                    { value: 'follow_up', label: 'Follow Up' },
                    { value: 'call', label: 'Call' },
                    { value: 'email', label: 'Email' },
                    { value: 'meeting', label: 'Meeting' },
                  ]}
                />
                <FormField
                  label="Priority"
                  name="priority"
                  type="select"
                  value={formData.priority}
                  onChange={(v) => setFormData({ ...formData, priority: v })}
                  options={[
                    { value: 'low', label: 'Low' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'high', label: 'High' },
                    { value: 'urgent', label: 'Urgent' },
                  ]}
                />
              </div>
              <FormField
                label="Due Date"
                name="due_date"
                type="date"
                value={formData.due_date}
                onChange={(v) => setFormData({ ...formData, due_date: v })}
              />
              <Button onClick={handleCreate} className="w-full">
                Create Task
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-sm">
              <div className="flex gap-2">
                <Input
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button variant="outline">
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={tasks}
            columns={columns}
            keyExtractor={(task) => task.id}
            totalItems={pagination.total}
            currentPage={currentPage}
            itemsPerPage={pagination.perPage}
            onPageChange={setCurrentPage}
            isLoading={isLoading}
            emptyMessage="No tasks found"
            actions={(task) => (
              <>
                {task.status !== 'completed' && (
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleComplete(task.id)}
                  >
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </Button>
                )}
              </>
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
}
