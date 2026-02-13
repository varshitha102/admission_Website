import { createContext, useContext, useReducer, ReactNode } from 'react';
import { 
  DashboardStats, 
  FunnelStage, 
  SourcePerformance, 
  UserPerformance,
  Activity 
} from '@/types';

// State interface
interface ReportState {
  dashboardStats: DashboardStats | null;
  conversionFunnel: FunnelStage[];
  sourcePerformance: SourcePerformance[];
  leadTrends: { date: string; count: number }[];
  userPerformance: UserPerformance[];
  stageDistribution: { stage_id: number; stage_name: string; count: number }[];
  applicationStatus: {
    document_status: Record<string, number>;
    fee_status: Record<string, number>;
    admission_status: Record<string, number>;
  } | null;
  recentActivities: Activity[];
  isLoadingDashboard: boolean;
  isLoadingFunnel: boolean;
  isLoadingSources: boolean;
  isLoadingTrends: boolean;
  isLoadingUsers: boolean;
  error: string | null;
}

// Action types
type ReportAction =
  | { type: 'FETCH_DASHBOARD_START' }
  | { type: 'FETCH_DASHBOARD_SUCCESS'; payload: DashboardStats }
  | { type: 'FETCH_DASHBOARD_FAILURE'; payload: string }
  | { type: 'FETCH_FUNNEL_START' }
  | { type: 'FETCH_FUNNEL_SUCCESS'; payload: FunnelStage[] }
  | { type: 'FETCH_FUNNEL_FAILURE'; payload: string }
  | { type: 'FETCH_SOURCES_START' }
  | { type: 'FETCH_SOURCES_SUCCESS'; payload: SourcePerformance[] }
  | { type: 'FETCH_SOURCES_FAILURE'; payload: string }
  | { type: 'FETCH_TRENDS_START' }
  | { type: 'FETCH_TRENDS_SUCCESS'; payload: { date: string; count: number }[] }
  | { type: 'FETCH_TRENDS_FAILURE'; payload: string }
  | { type: 'FETCH_USERS_START' }
  | { type: 'FETCH_USERS_SUCCESS'; payload: UserPerformance[] }
  | { type: 'FETCH_USERS_FAILURE'; payload: string }
  | { type: 'FETCH_STAGE_DISTRIBUTION_SUCCESS'; payload: { stage_id: number; stage_name: string; count: number }[] }
  | { type: 'FETCH_APPLICATION_STATUS_SUCCESS'; payload: ReportState['applicationStatus'] }
  | { type: 'FETCH_RECENT_ACTIVITIES_SUCCESS'; payload: Activity[] }
  | { type: 'CLEAR_ERROR' };

// Initial state
const initialState: ReportState = {
  dashboardStats: null,
  conversionFunnel: [],
  sourcePerformance: [],
  leadTrends: [],
  userPerformance: [],
  stageDistribution: [],
  applicationStatus: null,
  recentActivities: [],
  isLoadingDashboard: false,
  isLoadingFunnel: false,
  isLoadingSources: false,
  isLoadingTrends: false,
  isLoadingUsers: false,
  error: null,
};

// Reducer
function reportReducer(state: ReportState, action: ReportAction): ReportState {
  switch (action.type) {
    case 'FETCH_DASHBOARD_START':
      return { ...state, isLoadingDashboard: true, error: null };
    case 'FETCH_DASHBOARD_SUCCESS':
      return { ...state, isLoadingDashboard: false, dashboardStats: action.payload };
    case 'FETCH_DASHBOARD_FAILURE':
      return { ...state, isLoadingDashboard: false, error: action.payload };
    case 'FETCH_FUNNEL_START':
      return { ...state, isLoadingFunnel: true };
    case 'FETCH_FUNNEL_SUCCESS':
      return { ...state, isLoadingFunnel: false, conversionFunnel: action.payload };
    case 'FETCH_FUNNEL_FAILURE':
      return { ...state, isLoadingFunnel: false, error: action.payload };
    case 'FETCH_SOURCES_START':
      return { ...state, isLoadingSources: true };
    case 'FETCH_SOURCES_SUCCESS':
      return { ...state, isLoadingSources: false, sourcePerformance: action.payload };
    case 'FETCH_SOURCES_FAILURE':
      return { ...state, isLoadingSources: false, error: action.payload };
    case 'FETCH_TRENDS_START':
      return { ...state, isLoadingTrends: true };
    case 'FETCH_TRENDS_SUCCESS':
      return { ...state, isLoadingTrends: false, leadTrends: action.payload };
    case 'FETCH_TRENDS_FAILURE':
      return { ...state, isLoadingTrends: false, error: action.payload };
    case 'FETCH_USERS_START':
      return { ...state, isLoadingUsers: true };
    case 'FETCH_USERS_SUCCESS':
      return { ...state, isLoadingUsers: false, userPerformance: action.payload };
    case 'FETCH_USERS_FAILURE':
      return { ...state, isLoadingUsers: false, error: action.payload };
    case 'FETCH_STAGE_DISTRIBUTION_SUCCESS':
      return { ...state, stageDistribution: action.payload };
    case 'FETCH_APPLICATION_STATUS_SUCCESS':
      return { ...state, applicationStatus: action.payload };
    case 'FETCH_RECENT_ACTIVITIES_SUCCESS':
      return { ...state, recentActivities: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

// Context
interface ReportContextType {
  state: ReportState;
  dispatch: React.Dispatch<ReportAction>;
}

const ReportContext = createContext<ReportContextType | undefined>(undefined);

// Provider
export function ReportProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reportReducer, initialState);

  return (
    <ReportContext.Provider value={{ state, dispatch }}>
      {children}
    </ReportContext.Provider>
  );
}

// Hook
export function useReportStore() {
  const context = useContext(ReportContext);
  if (context === undefined) {
    throw new Error('useReportStore must be used within a ReportProvider');
  }
  return context;
}

// Actions
export const fetchDashboardStart = (): ReportAction => ({ type: 'FETCH_DASHBOARD_START' });

export const fetchDashboardSuccess = (stats: DashboardStats): ReportAction => ({
  type: 'FETCH_DASHBOARD_SUCCESS',
  payload: stats,
});

export const fetchDashboardFailure = (error: string): ReportAction => ({
  type: 'FETCH_DASHBOARD_FAILURE',
  payload: error,
});

export const fetchFunnelStart = (): ReportAction => ({ type: 'FETCH_FUNNEL_START' });

export const fetchFunnelSuccess = (funnel: FunnelStage[]): ReportAction => ({
  type: 'FETCH_FUNNEL_SUCCESS',
  payload: funnel,
});

export const fetchFunnelFailure = (error: string): ReportAction => ({
  type: 'FETCH_FUNNEL_FAILURE',
  payload: error,
});

export const fetchSourcesStart = (): ReportAction => ({ type: 'FETCH_SOURCES_START' });

export const fetchSourcesSuccess = (performance: SourcePerformance[]): ReportAction => ({
  type: 'FETCH_SOURCES_SUCCESS',
  payload: performance,
});

export const fetchSourcesFailure = (error: string): ReportAction => ({
  type: 'FETCH_SOURCES_FAILURE',
  payload: error,
});

export const fetchTrendsStart = (): ReportAction => ({ type: 'FETCH_TRENDS_START' });

export const fetchTrendsSuccess = (trends: { date: string; count: number }[]): ReportAction => ({
  type: 'FETCH_TRENDS_SUCCESS',
  payload: trends,
});

export const fetchTrendsFailure = (error: string): ReportAction => ({
  type: 'FETCH_TRENDS_FAILURE',
  payload: error,
});

export const fetchUsersStart = (): ReportAction => ({ type: 'FETCH_USERS_START' });

export const fetchUsersSuccess = (users: UserPerformance[]): ReportAction => ({
  type: 'FETCH_USERS_SUCCESS',
  payload: users,
});

export const fetchUsersFailure = (error: string): ReportAction => ({
  type: 'FETCH_USERS_FAILURE',
  payload: error,
});

export const setStageDistribution = (distribution: { stage_id: number; stage_name: string; count: number }[]): ReportAction => ({
  type: 'FETCH_STAGE_DISTRIBUTION_SUCCESS',
  payload: distribution,
});

export const setApplicationStatus = (status: ReportState['applicationStatus']): ReportAction => ({
  type: 'FETCH_APPLICATION_STATUS_SUCCESS',
  payload: status,
});

export const setRecentActivities = (activities: Activity[]): ReportAction => ({
  type: 'FETCH_RECENT_ACTIVITIES_SUCCESS',
  payload: activities,
});

export const clearError = (): ReportAction => ({ type: 'CLEAR_ERROR' });

// Selectors
export const selectDashboardStats = (state: ReportState): DashboardStats | null => state.dashboardStats;
export const selectConversionFunnel = (state: ReportState): FunnelStage[] => state.conversionFunnel;
export const selectSourcePerformance = (state: ReportState): SourcePerformance[] => state.sourcePerformance;
export const selectLeadTrends = (state: ReportState) => state.leadTrends;
export const selectUserPerformance = (state: ReportState): UserPerformance[] => state.userPerformance;
export const selectStageDistribution = (state: ReportState) => state.stageDistribution;
export const selectApplicationStatus = (state: ReportState) => state.applicationStatus;
export const selectRecentActivities = (state: ReportState): Activity[] => state.recentActivities;
export const selectIsLoadingDashboard = (state: ReportState): boolean => state.isLoadingDashboard;
export const selectError = (state: ReportState): string | null => state.error;
