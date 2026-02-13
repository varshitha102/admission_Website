import apiClient from '@/api/client';
import { Stage, Source, Workflow, User } from '@/types';

export const AdminService = {
  // Stage Management
  async getStages(type?: string): Promise<{ stages: Stage[] }> {
    const response = await apiClient.get('/admin/stages', { params: { type } });
    return response.data;
  },

  async createStage(stageData: {
    name: string;
    type: string;
    order?: number;
    is_active?: boolean;
  }): Promise<{ stage: Stage }> {
    const response = await apiClient.post('/admin/stages', stageData);
    return response.data;
  },

  async updateStage(stageId: number, stageData: Partial<Stage>): Promise<{ stage: Stage }> {
    const response = await apiClient.put(`/admin/stages/${stageId}`, stageData);
    return response.data;
  },

  // Source Management
  async getSources(): Promise<{ sources: Source[] }> {
    const response = await apiClient.get('/admin/sources');
    return response.data;
  },

  async createSource(sourceData: {
    name: string;
    category: string;
    is_active?: boolean;
  }): Promise<{ source: Source }> {
    const response = await apiClient.post('/admin/sources', sourceData);
    return response.data;
  },

  async updateSource(sourceId: number, sourceData: Partial<Source>): Promise<{ source: Source }> {
    const response = await apiClient.put(`/admin/sources/${sourceId}`, sourceData);
    return response.data;
  },

  // Workflow Management
  async getWorkflows(): Promise<{ workflows: Workflow[] }> {
    const response = await apiClient.get('/admin/workflows');
    return response.data;
  },

  async createWorkflow(workflowData: {
    name: string;
    description?: string;
    trigger: string;
    trigger_conditions?: Record<string, any>;
    actions_json: any[];
    active?: boolean;
  }): Promise<{ workflow: Workflow }> {
    const response = await apiClient.post('/admin/workflows', workflowData);
    return response.data;
  },

  async updateWorkflow(workflowId: number, workflowData: Partial<Workflow>): Promise<{ workflow: Workflow }> {
    const response = await apiClient.put(`/admin/workflows/${workflowId}`, workflowData);
    return response.data;
  },

  async deleteWorkflow(workflowId: number): Promise<{ message: string }> {
    const response = await apiClient.delete(`/admin/workflows/${workflowId}`);
    return response.data;
  },

  // System Stats
  async getSystemStats(): Promise<{
    users: {
      total: number;
      active: number;
      by_role: Record<string, number>;
    };
    leads: {
      total: number;
      active: number;
      converted: number;
    };
    applications: {
      total: number;
      in_progress: number;
      completed: number;
    };
    tasks: {
      total: number;
      pending: number;
      completed: number;
    };
  }> {
    const response = await apiClient.get('/admin/stats');
    return response.data;
  },
};
