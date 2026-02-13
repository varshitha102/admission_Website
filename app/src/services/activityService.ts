import apiClient from '@/api/client';
import { Activity, PaginatedResponse } from '@/types';

interface ActivityFilters {
  lead_id?: number;
  user_id?: number;
  type?: string;
  page?: number;
  per_page?: number;
}

interface CreateActivityData {
  lead_id: number;
  type: string;
  description: string;
  metadata?: Record<string, any>;
}

export const ActivityService = {
  async getActivities(filters: ActivityFilters = {}): Promise<PaginatedResponse<Activity>> {
    const response = await apiClient.get('/activities/', { params: filters });
    return response.data;
  },

  async getLeadActivities(leadId: number, limit?: number): Promise<{ activities: Activity[] }> {
    const response = await apiClient.get(`/activities/${leadId}`, { params: { limit } });
    return response.data;
  },

  async createActivity(activityData: CreateActivityData): Promise<{ activity: Activity }> {
    const response = await apiClient.post('/activities/', activityData);
    return response.data;
  },

  async getRecentActivities(limit?: number): Promise<{ activities: Activity[] }> {
    const response = await apiClient.get('/activities/recent', { params: { limit } });
    return response.data;
  },
};
