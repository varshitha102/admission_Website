import { useCallback } from 'react';
import { useLeadStore, fetchLeadsStart, fetchLeadsSuccess, fetchLeadsFailure, selectLead, updateLead, deleteLead, fetchStagesStart, fetchStagesSuccess, fetchStagesFailure, fetchSourcesStart, fetchSourcesSuccess, fetchSourcesFailure } from '@/store/leadStore';
import { LeadService } from '@/services';
import { Lead, LeadFormData, PaginatedResponse } from '@/types';
import { toast } from 'sonner';

interface LeadFilters {
  search?: string;
  stage_id?: number;
  source_id?: number;
  assigned_to?: number;
  status?: string;
  page?: number;
  per_page?: number;
}

export function useLeads() {
  const { state, dispatch } = useLeadStore();

  const fetchLeads = useCallback(async (filters: LeadFilters = {}) => {
    dispatch(fetchLeadsStart());
    try {
      const response = await LeadService.getLeads(filters);
      dispatch(fetchLeadsSuccess(response));
      return response;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch leads';
      dispatch(fetchLeadsFailure(message));
      toast.error(message);
      throw error;
    }
  }, [dispatch]);

  const fetchStages = useCallback(async () => {
    dispatch(fetchStagesStart());
    try {
      const response = await LeadService.getStageDistribution();
      // Note: This gets distribution, we need actual stages from admin
      // For now, we'll fetch from the lead distribution endpoint
      const stagesResponse = await LeadService.getStageDistribution();
      // Transform to Stage objects
      const stages = stagesResponse.distribution.map(d => ({
        id: d.stage_id,
        name: d.stage_name,
        type: 'lead' as const,
        order: 0,
        is_active: true,
        created_at: '',
        updated_at: ''
      }));
      dispatch(fetchStagesSuccess(stages));
      return stages;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch stages';
      dispatch(fetchStagesFailure(message));
      throw error;
    }
  }, [dispatch]);

  const fetchSources = useCallback(async () => {
    dispatch(fetchSourcesStart());
    try {
      const response = await LeadService.getSourceDistribution();
      const sources = response.distribution.map(d => ({
        id: d.source_id,
        name: d.source_name,
        category: d.category,
        is_active: true,
        created_at: '',
        updated_at: ''
      }));
      dispatch(fetchSourcesSuccess(sources));
      return sources;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch sources';
      dispatch(fetchSourcesFailure(message));
      throw error;
    }
  }, [dispatch]);

  const createLead = useCallback(async (leadData: LeadFormData) => {
    try {
      const response = await LeadService.createLead(leadData);
      toast.success('Lead created successfully');
      return response.lead;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create lead';
      toast.error(message);
      throw error;
    }
  }, []);

  const updateLeadData = useCallback(async (leadId: number, leadData: Partial<LeadFormData>) => {
    try {
      const response = await LeadService.updateLead(leadId, leadData);
      dispatch(updateLead(response.lead));
      toast.success('Lead updated successfully');
      return response.lead;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update lead';
      toast.error(message);
      throw error;
    }
  }, [dispatch]);

  const deleteLeadById = useCallback(async (leadId: number) => {
    try {
      await LeadService.deleteLead(leadId);
      dispatch(deleteLead(leadId));
      toast.success('Lead deleted successfully');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to delete lead';
      toast.error(message);
      throw error;
    }
  }, [dispatch]);

  const changeStage = useCallback(async (leadId: number, stageId: number, oldStageId?: number) => {
    try {
      const response = await LeadService.changeStage(leadId, stageId, oldStageId);
      dispatch(updateLead(response.lead));
      toast.success('Stage changed successfully');
      return response.lead;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to change stage';
      toast.error(message);
      throw error;
    }
  }, [dispatch]);

  const convertToApplication = useCallback(async (leadId: number) => {
    try {
      const response = await LeadService.convertToApplication(leadId);
      dispatch(updateLead({ ...state.leads.find(l => l.id === leadId)!, status: 'converted', has_application: true }));
      toast.success('Lead converted to application');
      return response.application;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to convert lead';
      toast.error(message);
      throw error;
    }
  }, [dispatch, state.leads]);

  const setSelectedLead = useCallback((lead: Lead | null) => {
    dispatch(selectLead(lead));
  }, [dispatch]);

  return {
    leads: state.leads,
    selectedLead: state.selectedLead,
    stages: state.stages,
    sources: state.sources,
    pagination: state.pagination,
    isLoading: state.isLoading,
    error: state.error,
    fetchLeads,
    fetchStages,
    fetchSources,
    createLead,
    updateLead: updateLeadData,
    deleteLead: deleteLeadById,
    changeStage,
    convertToApplication,
    setSelectedLead,
  };
}
