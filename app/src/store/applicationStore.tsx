import { createContext, useContext, useReducer, ReactNode } from 'react';
import { Application, PaginatedResponse } from '@/types';

// State interface
interface ApplicationState {
  applications: Application[];
  selectedApplication: Application | null;
  pagination: {
    total: number;
    pages: number;
    currentPage: number;
    perPage: number;
  };
  stats: {
    total: number;
    completed: number;
    in_progress: number;
    cancelled: number;
    completion_rate: number;
  } | null;
  isLoading: boolean;
  isLoadingStats: boolean;
  error: string | null;
}

// Action types
type ApplicationAction =
  | { type: 'FETCH_APPLICATIONS_START' }
  | { type: 'FETCH_APPLICATIONS_SUCCESS'; payload: PaginatedResponse<Application> }
  | { type: 'FETCH_APPLICATIONS_FAILURE'; payload: string }
  | { type: 'FETCH_STATS_START' }
  | { type: 'FETCH_STATS_SUCCESS'; payload: ApplicationState['stats'] }
  | { type: 'FETCH_STATS_FAILURE'; payload: string }
  | { type: 'SELECT_APPLICATION'; payload: Application | null }
  | { type: 'UPDATE_APPLICATION'; payload: Application }
  | { type: 'DELETE_APPLICATION'; payload: number }
  | { type: 'CLEAR_ERROR' };

// Initial state
const initialState: ApplicationState = {
  applications: [],
  selectedApplication: null,
  pagination: {
    total: 0,
    pages: 0,
    currentPage: 1,
    perPage: 20,
  },
  stats: null,
  isLoading: false,
  isLoadingStats: false,
  error: null,
};

// Reducer
function applicationReducer(state: ApplicationState, action: ApplicationAction): ApplicationState {
  switch (action.type) {
    case 'FETCH_APPLICATIONS_START':
      return { ...state, isLoading: true, error: null };
    case 'FETCH_APPLICATIONS_SUCCESS':
      return {
        ...state,
        isLoading: false,
        applications: action.payload.items,
        pagination: {
          total: action.payload.total,
          pages: action.payload.pages,
          currentPage: action.payload.current_page,
          perPage: action.payload.per_page,
        },
      };
    case 'FETCH_APPLICATIONS_FAILURE':
      return { ...state, isLoading: false, error: action.payload };
    case 'FETCH_STATS_START':
      return { ...state, isLoadingStats: true };
    case 'FETCH_STATS_SUCCESS':
      return { ...state, isLoadingStats: false, stats: action.payload };
    case 'FETCH_STATS_FAILURE':
      return { ...state, isLoadingStats: false, error: action.payload };
    case 'SELECT_APPLICATION':
      return { ...state, selectedApplication: action.payload };
    case 'UPDATE_APPLICATION':
      return {
        ...state,
        applications: state.applications.map((app) =>
          app.id === action.payload.id ? action.payload : app
        ),
        selectedApplication:
          state.selectedApplication?.id === action.payload.id
            ? action.payload
            : state.selectedApplication,
      };
    case 'DELETE_APPLICATION':
      return {
        ...state,
        applications: state.applications.filter((app) => app.id !== action.payload),
        selectedApplication:
          state.selectedApplication?.id === action.payload ? null : state.selectedApplication,
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

// Context
interface ApplicationContextType {
  state: ApplicationState;
  dispatch: React.Dispatch<ApplicationAction>;
}

const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

// Provider
export function ApplicationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(applicationReducer, initialState);

  return (
    <ApplicationContext.Provider value={{ state, dispatch }}>
      {children}
    </ApplicationContext.Provider>
  );
}

// Hook
export function useApplicationStore() {
  const context = useContext(ApplicationContext);
  if (context === undefined) {
    throw new Error('useApplicationStore must be used within an ApplicationProvider');
  }
  return context;
}

// Actions
export const fetchApplicationsStart = (): ApplicationAction => ({ 
  type: 'FETCH_APPLICATIONS_START' 
});

export const fetchApplicationsSuccess = (response: PaginatedResponse<Application>): ApplicationAction => ({
  type: 'FETCH_APPLICATIONS_SUCCESS',
  payload: response,
});

export const fetchApplicationsFailure = (error: string): ApplicationAction => ({
  type: 'FETCH_APPLICATIONS_FAILURE',
  payload: error,
});

export const fetchStatsStart = (): ApplicationAction => ({ type: 'FETCH_STATS_START' });

export const fetchStatsSuccess = (stats: ApplicationState['stats']): ApplicationAction => ({
  type: 'FETCH_STATS_SUCCESS',
  payload: stats,
});

export const fetchStatsFailure = (error: string): ApplicationAction => ({
  type: 'FETCH_STATS_FAILURE',
  payload: error,
});

export const selectApplication = (application: Application | null): ApplicationAction => ({
  type: 'SELECT_APPLICATION',
  payload: application,
});

export const updateApplication = (application: Application): ApplicationAction => ({
  type: 'UPDATE_APPLICATION',
  payload: application,
});

export const deleteApplication = (applicationId: number): ApplicationAction => ({
  type: 'DELETE_APPLICATION',
  payload: applicationId,
});

export const clearError = (): ApplicationAction => ({ type: 'CLEAR_ERROR' });

// Selectors
export const selectApplications = (state: ApplicationState): Application[] => state.applications;
export const selectSelectedApplication = (state: ApplicationState): Application | null => state.selectedApplication;
export const selectPagination = (state: ApplicationState) => state.pagination;
export const selectStats = (state: ApplicationState) => state.stats;
export const selectIsLoading = (state: ApplicationState): boolean => state.isLoading;
export const selectIsLoadingStats = (state: ApplicationState): boolean => state.isLoadingStats;
export const selectError = (state: ApplicationState): string | null => state.error;

export const selectApplicationById = (state: ApplicationState, applicationId: number): Application | undefined =>
  state.applications.find((app) => app.id === applicationId);

export const selectApplicationsByLeadId = (state: ApplicationState, leadId: number): Application[] =>
  state.applications.filter((app) => app.lead_id === leadId);
