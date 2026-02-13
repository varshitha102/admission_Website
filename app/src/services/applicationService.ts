import apiClient from '@/api/client';
import { Application, ApplicationStatusUpdate, PaginatedResponse } from '@/types';

interface ApplicationFilters {
  lead_id?: number;
  document_status?: string;
  fee_status?: string;
  admission_status?: string;
  overall_status?: string;
  page?: number;
  per_page?: number;
}

export const ApplicationService = {
  async getApplications(filters: ApplicationFilters = {}): Promise<PaginatedResponse<Application>> {
    const response = await apiClient.get('/applications/', { params: filters });
    return response.data;
  },

  async getApplication(applicationId: number): Promise<{ application: Application }> {
    const response = await apiClient.get(`/applications/${applicationId}`);
    return response.data;
  },

  async convertLead(leadId: number): Promise<{ application: Application }> {
    const response = await apiClient.post(`/applications/convert/${leadId}`);
    return response.data;
  },

  async updateStatus(
    applicationId: number, 
    statusUpdate: ApplicationStatusUpdate
  ): Promise<{ application: Application }> {
    const response = await apiClient.put(`/applications/${applicationId}/status`, statusUpdate);
    return response.data;
  },

  async deleteApplication(applicationId: number): Promise<{ message: string }> {
    const response = await apiClient.delete(`/applications/${applicationId}`);
    return response.data;
  },

  async getStats(): Promise<{
    total: number;
    completed: number;
    in_progress: number;
    cancelled: number;
    completion_rate: number;
  }> {
    const response = await apiClient.get('/applications/stats');
    return response.data;
  },
};
