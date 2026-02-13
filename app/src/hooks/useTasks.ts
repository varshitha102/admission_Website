import { useCallback } from 'react';
import { useTaskStore, fetchTasksStart, fetchTasksSuccess, fetchTasksFailure, fetchPendingStart, fetchPendingSuccess, fetchPendingFailure, selectTask, updateTask, completeTask, deleteTask } from '@/store/taskStore';
import { TaskService } from '@/services';
import { Task, TaskFormData } from '@/types';
import { toast } from 'sonner';

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

export function useTasks() {
  const { state, dispatch } = useTaskStore();

  const fetchTasks = useCallback(async (filters: TaskFilters = {}) => {
    dispatch(fetchTasksStart());
    try {
      const response = await TaskService.getTasks(filters);
      dispatch(fetchTasksSuccess(response));
      return response;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch tasks';
      dispatch(fetchTasksFailure(message));
      toast.error(message);
      throw error;
    }
  }, [dispatch]);

  const fetchPendingTasks = useCallback(async () => {
    dispatch(fetchPendingStart());
    try {
      const response = await TaskService.getPendingTasks();
      dispatch(fetchPendingSuccess(response.tasks));
      return response.tasks;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch pending tasks';
      dispatch(fetchPendingFailure(message));
      throw error;
    }
  }, [dispatch]);

  const createTask = useCallback(async (taskData: TaskFormData) => {
    try {
      const response = await TaskService.createTask(taskData);
      toast.success('Task created successfully');
      return response.task;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create task';
      toast.error(message);
      throw error;
    }
  }, []);

  const updateTaskData = useCallback(async (taskId: number, taskData: Partial<TaskFormData>) => {
    try {
      const response = await TaskService.updateTask(taskId, taskData);
      dispatch(updateTask(response.task));
      toast.success('Task updated successfully');
      return response.task;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update task';
      toast.error(message);
      throw error;
    }
  }, [dispatch]);

  const completeTaskById = useCallback(async (taskId: number, notes?: string) => {
    try {
      const response = await TaskService.completeTask(taskId, notes);
      dispatch(completeTask(response.task));
      toast.success('Task completed');
      return response.task;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to complete task';
      toast.error(message);
      throw error;
    }
  }, [dispatch]);

  const deleteTaskById = useCallback(async (taskId: number) => {
    try {
      await TaskService.deleteTask(taskId);
      dispatch(deleteTask(taskId));
      toast.success('Task deleted');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to delete task';
      toast.error(message);
      throw error;
    }
  }, [dispatch]);

  const setSelectedTask = useCallback((task: Task | null) => {
    dispatch(selectTask(task));
  }, [dispatch]);

  return {
    tasks: state.tasks,
    pendingTasks: state.pendingTasks,
    selectedTask: state.selectedTask,
    pagination: state.pagination,
    stats: state.stats,
    isLoading: state.isLoading,
    isLoadingPending: state.isLoadingPending,
    error: state.error,
    fetchTasks,
    fetchPendingTasks,
    createTask,
    updateTask: updateTaskData,
    completeTask: completeTaskById,
    deleteTask: deleteTaskById,
    setSelectedTask,
  };
}
