import apiClient from '@/api/client';
import { Task, TaskFormData, PaginatedResponse } from '@/types';

interface TaskFilters {
  status?: string;
  assigned_to?: number;
  lead_id?: number;
  priority?: string;
  task_type?: string;
  overdue_only?: boolean;
  page?: number;
  per_page?: number;
}

export const TaskService = {
  async getTasks(filters: TaskFilters = {}): Promise<PaginatedResponse<Task>> {
    const response = await apiClient.get('/tasks/', { params: filters });
    return response.data;
  },

  async getTask(taskId: number): Promise<{ task: Task }> {
    const response = await apiClient.get(`/tasks/${taskId}`);
    return response.data;
  },

  async createTask(taskData: TaskFormData): Promise<{ task: Task }> {
    const response = await apiClient.post('/tasks/', taskData);
    return response.data;
  },

  async updateTask(taskId: number, taskData: Partial<TaskFormData>): Promise<{ task: Task }> {
    const response = await apiClient.put(`/tasks/${taskId}`, taskData);
    return response.data;
  },

  async completeTask(taskId: number, notes?: string): Promise<{ task: Task }> {
    const response = await apiClient.patch(`/tasks/${taskId}/complete`, { notes });
    return response.data;
  },

  async deleteTask(taskId: number): Promise<{ message: string }> {
    const response = await apiClient.delete(`/tasks/${taskId}`);
    return response.data;
  },

  async getPendingTasks(): Promise<{ tasks: Task[] }> {
    const response = await apiClient.get('/tasks/pending');
    return response.data;
  },

  async getStats(): Promise<{
    total: number;
    pending: number;
    completed: number;
    overdue: number;
  }> {
    const response = await apiClient.get('/tasks/stats');
    return response.data;
  },
};
