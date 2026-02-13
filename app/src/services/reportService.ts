import apiClient from '@/api/client';
import { 
  DashboardStats, 
  FunnelStage, 
  SourcePerformance, 
  UserPerformance,
  Activity 
} from '@/types';

export const ReportService = {
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await apiClient.get('/reports/dashboard');
    return response.data;
  },

  async getConversionFunnel(): Promise<{ funnel: FunnelStage[] }> {
    const response = await apiClient.get('/reports/conversion');
    return response.data;
  },

  async getSourcePerformance(days?: number): Promise<{ performance: SourcePerformance[] }> {
    const response = await apiClient.get('/reports/source-performance', { params: { days } });
    return response.data;
  },

  async getLeadTrends(days?: number): Promise<{ trends: { date: string; count: number }[] }> {
    const response = await apiClient.get('/reports/lead-trends', { params: { days } });
    return response.data;
  },

  async getUserPerformance(days?: number): Promise<{ performance: UserPerformance[] }> {
    const response = await apiClient.get('/reports/user-performance', { params: { days } });
    return response.data;
  },

  async getStageDistribution(): Promise<{ distribution: { stage_id: number; stage_name: string; count: number }[] }> {
    const response = await apiClient.get('/reports/stage-distribution');
    return response.data;
  },

  async getApplicationStatus(): Promise<{
    document_status: Record<string, number>;
    fee_status: Record<string, number>;
    admission_status: Record<string, number>;
  }> {
    const response = await apiClient.get('/reports/application-status');
    return response.data;
  },

  async getRecentActivities(limit?: number): Promise<{ activities: Activity[] }> {
    const response = await apiClient.get('/reports/recent-activities', { params: { limit } });
    return response.data;
  },
};
