import apiClient from '@/api/client';
import { Lead, LeadFormData, PaginatedResponse, Application } from '@/types';

interface LeadFilters {
  search?: string;
  stage_id?: number;
  source_id?: number;
  assigned_to?: number;
  status?: string;
  page?: number;
  per_page?: number;
}

export const LeadService = {
  async getLeads(filters: LeadFilters = {}): Promise<PaginatedResponse<Lead>> {
    const response = await apiClient.get('/leads/', { params: filters });
    return response.data;
  },

  async getLead(leadId: number): Promise<{ lead: Lead }> {
    const response = await apiClient.get(`/leads/${leadId}`);
    return response.data;
  },

  async createLead(leadData: LeadFormData): Promise<{ lead: Lead }> {
    const response = await apiClient.post('/leads/', leadData);
    return response.data;
  },

  async updateLead(leadId: number, leadData: Partial<LeadFormData>): Promise<{ lead: Lead }> {
    const response = await apiClient.put(`/leads/${leadId}`, leadData);
    return response.data;
  },

  async deleteLead(leadId: number): Promise<{ message: string }> {
    const response = await apiClient.delete(`/leads/${leadId}`);
    return response.data;
  },

  async changeStage(leadId: number, stageId: number, oldStageId?: number): Promise<{ lead: Lead }> {
    const response = await apiClient.patch(`/leads/${leadId}/stage`, { 
      stage_id: stageId,
      old_stage_id: oldStageId 
    });
    return response.data;
  },

  async convertToApplication(leadId: number): Promise<{ application: Application }> {
    const response = await apiClient.post(`/leads/${leadId}/convert`);
    return response.data;
  },

  async getKPIs(): Promise<{
    total_leads: number;
    active_leads: number;
    converted_leads: number;
    new_this_month: number;
    conversion_rate: number;
  }> {
    const response = await apiClient.get('/leads/kpis');
    return response.data;
  },

  async getStageDistribution(): Promise<{ distribution: { stage_id: number; stage_name: string; count: number }[] }> {
    const response = await apiClient.get('/leads/stage-distribution');
    return response.data;
  },

  async getSourceDistribution(): Promise<{ distribution: { source_id: number; source_name: string; category: string; count: number }[] }> {
    const response = await apiClient.get('/leads/source-distribution');
    return response.data;
  },
};
