import { useCallback } from 'react';
import { useApplicationStore, fetchApplicationsStart, fetchApplicationsSuccess, fetchApplicationsFailure, selectApplication, updateApplication, deleteApplication, fetchStatsStart, fetchStatsSuccess, fetchStatsFailure } from '@/store/applicationStore';
import { ApplicationService } from '@/services';
import { Application, ApplicationStatusUpdate } from '@/types';
import { toast } from 'sonner';

interface ApplicationFilters {
  lead_id?: number;
  document_status?: string;
  fee_status?: string;
  admission_status?: string;
  overall_status?: string;
  page?: number;
  per_page?: number;
}

export function useApplications() {
  const { state, dispatch } = useApplicationStore();

  const fetchApplications = useCallback(async (filters: ApplicationFilters = {}) => {
    dispatch(fetchApplicationsStart());
    try {
      const response = await ApplicationService.getApplications(filters);
      dispatch(fetchApplicationsSuccess(response));
      return response;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch applications';
      dispatch(fetchApplicationsFailure(message));
      toast.error(message);
      throw error;
    }
  }, [dispatch]);

  const fetchStats = useCallback(async () => {
    dispatch(fetchStatsStart());
    try {
      const response = await ApplicationService.getStats();
      dispatch(fetchStatsSuccess(response));
      return response;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch stats';
      dispatch(fetchStatsFailure(message));
      throw error;
    }
  }, [dispatch]);

  const getApplication = useCallback(async (applicationId: number) => {
    try {
      const response = await ApplicationService.getApplication(applicationId);
      dispatch(selectApplication(response.application));
      return response.application;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch application';
      toast.error(message);
      throw error;
    }
  }, [dispatch]);

  const convertLead = useCallback(async (leadId: number) => {
    try {
      const response = await ApplicationService.convertLead(leadId);
      toast.success('Lead converted to application');
      return response.application;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to convert lead';
      toast.error(message);
      throw error;
    }
  }, []);

  const updateStatus = useCallback(async (applicationId: number, statusUpdate: ApplicationStatusUpdate) => {
    try {
      const response = await ApplicationService.updateStatus(applicationId, statusUpdate);
      dispatch(updateApplication(response.application));
      toast.success('Application status updated');
      return response.application;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update status';
      toast.error(message);
      throw error;
    }
  }, [dispatch]);

  const deleteApplicationById = useCallback(async (applicationId: number) => {
    try {
      await ApplicationService.deleteApplication(applicationId);
      dispatch(deleteApplication(applicationId));
      toast.success('Application deleted');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to delete application';
      toast.error(message);
      throw error;
    }
  }, [dispatch]);

  const setSelectedApplication = useCallback((application: Application | null) => {
    dispatch(selectApplication(application));
  }, [dispatch]);

  return {
    applications: state.applications,
    selectedApplication: state.selectedApplication,
    pagination: state.pagination,
    stats: state.stats,
    isLoading: state.isLoading,
    isLoadingStats: state.isLoadingStats,
    error: state.error,
    fetchApplications,
    fetchStats,
    getApplication,
    convertLead,
    updateStatus,
    deleteApplication: deleteApplicationById,
    setSelectedApplication,
  };
}
