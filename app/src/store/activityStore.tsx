import { createContext, useContext, useReducer, ReactNode } from 'react';
import { Activity, PaginatedResponse } from '@/types';

// State interface
interface ActivityState {
  activities: Activity[];
  leadActivities: Activity[];
  recentActivities: Activity[];
  pagination: {
    total: number;
    pages: number;
    currentPage: number;
    perPage: number;
  };
  isLoading: boolean;
  isLoadingRecent: boolean;
  error: string | null;
}

// Action types
type ActivityAction =
  | { type: 'FETCH_ACTIVITIES_START' }
  | { type: 'FETCH_ACTIVITIES_SUCCESS'; payload: PaginatedResponse<Activity> }
  | { type: 'FETCH_ACTIVITIES_FAILURE'; payload: string }
  | { type: 'FETCH_LEAD_ACTIVITIES_START' }
  | { type: 'FETCH_LEAD_ACTIVITIES_SUCCESS'; payload: Activity[] }
  | { type: 'FETCH_LEAD_ACTIVITIES_FAILURE'; payload: string }
  | { type: 'FETCH_RECENT_START' }
  | { type: 'FETCH_RECENT_SUCCESS'; payload: Activity[] }
  | { type: 'FETCH_RECENT_FAILURE'; payload: string }
  | { type: 'ADD_ACTIVITY'; payload: Activity }
  | { type: 'CLEAR_ERROR' };

// Initial state
const initialState: ActivityState = {
  activities: [],
  leadActivities: [],
  recentActivities: [],
  pagination: {
    total: 0,
    pages: 0,
    currentPage: 1,
    perPage: 50,
  },
  isLoading: false,
  isLoadingRecent: false,
  error: null,
};

// Reducer
function activityReducer(state: ActivityState, action: ActivityAction): ActivityState {
  switch (action.type) {
    case 'FETCH_ACTIVITIES_START':
      return { ...state, isLoading: true, error: null };
    case 'FETCH_ACTIVITIES_SUCCESS':
      return {
        ...state,
        isLoading: false,
        activities: action.payload.items,
        pagination: {
          total: action.payload.total,
          pages: action.payload.pages,
          currentPage: action.payload.current_page,
          perPage: action.payload.per_page,
        },
      };
    case 'FETCH_ACTIVITIES_FAILURE':
      return { ...state, isLoading: false, error: action.payload };
    case 'FETCH_LEAD_ACTIVITIES_START':
      return { ...state, isLoading: true };
    case 'FETCH_LEAD_ACTIVITIES_SUCCESS':
      return { ...state, isLoading: false, leadActivities: action.payload };
    case 'FETCH_LEAD_ACTIVITIES_FAILURE':
      return { ...state, isLoading: false, error: action.payload };
    case 'FETCH_RECENT_START':
      return { ...state, isLoadingRecent: true };
    case 'FETCH_RECENT_SUCCESS':
      return { ...state, isLoadingRecent: false, recentActivities: action.payload };
    case 'FETCH_RECENT_FAILURE':
      return { ...state, isLoadingRecent: false, error: action.payload };
    case 'ADD_ACTIVITY':
      return {
        ...state,
        activities: [action.payload, ...state.activities],
        recentActivities: [action.payload, ...state.recentActivities.slice(0, 49)],
        leadActivities: [action.payload, ...state.leadActivities],
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

// Context
interface ActivityContextType {
  state: ActivityState;
  dispatch: React.Dispatch<ActivityAction>;
}

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

// Provider
export function ActivityProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(activityReducer, initialState);

  return (
    <ActivityContext.Provider value={{ state, dispatch }}>
      {children}
    </ActivityContext.Provider>
  );
}

// Hook
export function useActivityStore() {
  const context = useContext(ActivityContext);
  if (context === undefined) {
    throw new Error('useActivityStore must be used within an ActivityProvider');
  }
  return context;
}

// Actions
export const fetchActivitiesStart = (): ActivityAction => ({ type: 'FETCH_ACTIVITIES_START' });

export const fetchActivitiesSuccess = (response: PaginatedResponse<Activity>): ActivityAction => ({
  type: 'FETCH_ACTIVITIES_SUCCESS',
  payload: response,
});

export const fetchActivitiesFailure = (error: string): ActivityAction => ({
  type: 'FETCH_ACTIVITIES_FAILURE',
  payload: error,
});

export const fetchLeadActivitiesStart = (): ActivityAction => ({ type: 'FETCH_LEAD_ACTIVITIES_START' });

export const fetchLeadActivitiesSuccess = (activities: Activity[]): ActivityAction => ({
  type: 'FETCH_LEAD_ACTIVITIES_SUCCESS',
  payload: activities,
});

export const fetchLeadActivitiesFailure = (error: string): ActivityAction => ({
  type: 'FETCH_LEAD_ACTIVITIES_FAILURE',
  payload: error,
});

export const fetchRecentStart = (): ActivityAction => ({ type: 'FETCH_RECENT_START' });

export const fetchRecentSuccess = (activities: Activity[]): ActivityAction => ({
  type: 'FETCH_RECENT_SUCCESS',
  payload: activities,
});

export const fetchRecentFailure = (error: string): ActivityAction => ({
  type: 'FETCH_RECENT_FAILURE',
  payload: error,
});

export const addActivity = (activity: Activity): ActivityAction => ({
  type: 'ADD_ACTIVITY',
  payload: activity,
});

export const clearError = (): ActivityAction => ({ type: 'CLEAR_ERROR' });

// Selectors
export const selectActivities = (state: ActivityState): Activity[] => state.activities;
export const selectLeadActivities = (state: ActivityState): Activity[] => state.leadActivities;
export const selectRecentActivities = (state: ActivityState): Activity[] => state.recentActivities;
export const selectPagination = (state: ActivityState) => state.pagination;
export const selectIsLoading = (state: ActivityState): boolean => state.isLoading;
export const selectIsLoadingRecent = (state: ActivityState): boolean => state.isLoadingRecent;
export const selectError = (state: ActivityState): string | null => state.error;

export const selectActivitiesByLeadId = (state: ActivityState, leadId: number): Activity[] =>
  state.activities.filter((activity) => activity.lead_id === leadId);

export const selectActivitiesByType = (state: ActivityState, type: string): Activity[] =>
  state.activities.filter((activity) => activity.type === type);
