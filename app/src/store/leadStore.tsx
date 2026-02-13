import { createContext, useContext, useReducer, ReactNode } from 'react';
import { Lead, Stage, Source, PaginatedResponse } from '@/types';

// State interface
interface LeadState {
  leads: Lead[];
  selectedLead: Lead | null;
  stages: Stage[];
  sources: Source[];
  pagination: {
    total: number;
    pages: number;
    currentPage: number;
    perPage: number;
  };
  isLoading: boolean;
  isLoadingStages: boolean;
  isLoadingSources: boolean;
  error: string | null;
}

// Action types
type LeadAction =
  | { type: 'FETCH_LEADS_START' }
  | { type: 'FETCH_LEADS_SUCCESS'; payload: PaginatedResponse<Lead> }
  | { type: 'FETCH_LEADS_FAILURE'; payload: string }
  | { type: 'FETCH_STAGES_START' }
  | { type: 'FETCH_STAGES_SUCCESS'; payload: Stage[] }
  | { type: 'FETCH_STAGES_FAILURE'; payload: string }
  | { type: 'FETCH_SOURCES_START' }
  | { type: 'FETCH_SOURCES_SUCCESS'; payload: Source[] }
  | { type: 'FETCH_SOURCES_FAILURE'; payload: string }
  | { type: 'SELECT_LEAD'; payload: Lead | null }
  | { type: 'UPDATE_LEAD'; payload: Lead }
  | { type: 'DELETE_LEAD'; payload: number }
  | { type: 'CLEAR_ERROR' };

// Initial state
const initialState: LeadState = {
  leads: [],
  selectedLead: null,
  stages: [],
  sources: [],
  pagination: {
    total: 0,
    pages: 0,
    currentPage: 1,
    perPage: 20,
  },
  isLoading: false,
  isLoadingStages: false,
  isLoadingSources: false,
  error: null,
};

// Reducer
function leadReducer(state: LeadState, action: LeadAction): LeadState {
  switch (action.type) {
    case 'FETCH_LEADS_START':
      return { ...state, isLoading: true, error: null };
    case 'FETCH_LEADS_SUCCESS':
      return {
        ...state,
        isLoading: false,
        leads: action.payload.items,
        pagination: {
          total: action.payload.total,
          pages: action.payload.pages,
          currentPage: action.payload.current_page,
          perPage: action.payload.per_page,
        },
      };
    case 'FETCH_LEADS_FAILURE':
      return { ...state, isLoading: false, error: action.payload };
    case 'FETCH_STAGES_START':
      return { ...state, isLoadingStages: true };
    case 'FETCH_STAGES_SUCCESS':
      return { ...state, isLoadingStages: false, stages: action.payload };
    case 'FETCH_STAGES_FAILURE':
      return { ...state, isLoadingStages: false, error: action.payload };
    case 'FETCH_SOURCES_START':
      return { ...state, isLoadingSources: true };
    case 'FETCH_SOURCES_SUCCESS':
      return { ...state, isLoadingSources: false, sources: action.payload };
    case 'FETCH_SOURCES_FAILURE':
      return { ...state, isLoadingSources: false, error: action.payload };
    case 'SELECT_LEAD':
      return { ...state, selectedLead: action.payload };
    case 'UPDATE_LEAD':
      return {
        ...state,
        leads: state.leads.map((lead) =>
          lead.id === action.payload.id ? action.payload : lead
        ),
        selectedLead:
          state.selectedLead?.id === action.payload.id
            ? action.payload
            : state.selectedLead,
      };
    case 'DELETE_LEAD':
      return {
        ...state,
        leads: state.leads.filter((lead) => lead.id !== action.payload),
        selectedLead:
          state.selectedLead?.id === action.payload ? null : state.selectedLead,
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

// Context
interface LeadContextType {
  state: LeadState;
  dispatch: React.Dispatch<LeadAction>;
}

const LeadContext = createContext<LeadContextType | undefined>(undefined);

// Provider
export function LeadProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(leadReducer, initialState);

  return (
    <LeadContext.Provider value={{ state, dispatch }}>
      {children}
    </LeadContext.Provider>
  );
}

// Hook
export function useLeadStore() {
  const context = useContext(LeadContext);
  if (context === undefined) {
    throw new Error('useLeadStore must be used within a LeadProvider');
  }
  return context;
}

// Actions
export const fetchLeadsStart = (): LeadAction => ({ type: 'FETCH_LEADS_START' });

export const fetchLeadsSuccess = (response: PaginatedResponse<Lead>): LeadAction => ({
  type: 'FETCH_LEADS_SUCCESS',
  payload: response,
});

export const fetchLeadsFailure = (error: string): LeadAction => ({
  type: 'FETCH_LEADS_FAILURE',
  payload: error,
});

export const fetchStagesStart = (): LeadAction => ({ type: 'FETCH_STAGES_START' });

export const fetchStagesSuccess = (stages: Stage[]): LeadAction => ({
  type: 'FETCH_STAGES_SUCCESS',
  payload: stages,
});

export const fetchStagesFailure = (error: string): LeadAction => ({
  type: 'FETCH_STAGES_FAILURE',
  payload: error,
});

export const fetchSourcesStart = (): LeadAction => ({ type: 'FETCH_SOURCES_START' });

export const fetchSourcesSuccess = (sources: Source[]): LeadAction => ({
  type: 'FETCH_SOURCES_SUCCESS',
  payload: sources,
});

export const fetchSourcesFailure = (error: string): LeadAction => ({
  type: 'FETCH_SOURCES_FAILURE',
  payload: error,
});

export const selectLead = (lead: Lead | null): LeadAction => ({
  type: 'SELECT_LEAD',
  payload: lead,
});

export const updateLead = (lead: Lead): LeadAction => ({
  type: 'UPDATE_LEAD',
  payload: lead,
});

export const deleteLead = (leadId: number): LeadAction => ({
  type: 'DELETE_LEAD',
  payload: leadId,
});

export const clearError = (): LeadAction => ({ type: 'CLEAR_ERROR' });

// Selectors
export const selectLeads = (state: LeadState): Lead[] => state.leads;
export const selectSelectedLead = (state: LeadState): Lead | null => state.selectedLead;
export const selectStages = (state: LeadState): Stage[] => state.stages;
export const selectSources = (state: LeadState): Source[] => state.sources;
export const selectLeadStages = (state: LeadState): Stage[] => 
  state.stages.filter(s => s.type === 'lead');
export const selectPagination = (state: LeadState) => state.pagination;
export const selectIsLoading = (state: LeadState): boolean => state.isLoading;
export const selectError = (state: LeadState): string | null => state.error;

export const selectLeadById = (state: LeadState, leadId: number): Lead | undefined =>
  state.leads.find((lead) => lead.id === leadId);

export const selectStageById = (state: LeadState, stageId: number): Stage | undefined =>
  state.stages.find((stage) => stage.id === stageId);

export const selectSourceById = (state: LeadState, sourceId: number): Source | undefined =>
  state.sources.find((source) => source.id === sourceId);
