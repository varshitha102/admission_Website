import { createContext, useContext, useReducer, ReactNode } from 'react';
import { User, UserRole, LoginResponse } from '@/types';
import { setTokens, clearTokens } from '@/api/client';

// State interface
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Action types
type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'CLEAR_ERROR' };

// Initial state
const initialState: AuthState = {
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  isAuthenticated: !!localStorage.getItem('access_token'),
  isLoading: false,
  error: null,
};

// Reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, isLoading: true, error: null };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        error: null,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

// Context
interface AuthContextType {
  state: AuthState;
  dispatch: React.Dispatch<AuthAction>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  return (
    <AuthContext.Provider value={{ state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Actions
export const loginStart = (): AuthAction => ({ type: 'LOGIN_START' });

export const loginSuccess = (user: User): AuthAction => ({
  type: 'LOGIN_SUCCESS',
  payload: { user },
});

export const loginFailure = (error: string): AuthAction => ({
  type: 'LOGIN_FAILURE',
  payload: error,
});

export const logout = (): AuthAction => {
  clearTokens();
  return { type: 'LOGOUT' };
};

export const updateUser = (user: User): AuthAction => ({
  type: 'UPDATE_USER',
  payload: user,
});

export const clearError = (): AuthAction => ({ type: 'CLEAR_ERROR' });

// Selectors
export const selectUser = (state: AuthState): User | null => state.user;
export const selectIsAuthenticated = (state: AuthState): boolean => state.isAuthenticated;
export const selectIsLoading = (state: AuthState): boolean => state.isLoading;
export const selectError = (state: AuthState): string | null => state.error;
export const selectUserRole = (state: AuthState): UserRole | null => state.user?.role || null;
export const selectIsAdmin = (state: AuthState): boolean => state.user?.role === 'Admin';
export const selectIsTeamLead = (state: AuthState): boolean => state.user?.role === 'Team Lead';
export const selectIsManager = (state: AuthState): boolean => 
  ['Admin', 'Team Lead', 'Digital Manager'].includes(state.user?.role || '');

// Helper functions
export const hasRole = (state: AuthState, roles: UserRole[]): boolean => {
  return state.user ? roles.includes(state.user.role) : false;
};

export const canAccessLead = (state: AuthState, leadAssignedTo?: number): boolean => {
  if (!state.user) return false;
  
  const { role, id } = state.user;
  
  // Admin can access all
  if (role === 'Admin') return true;
  
  // Team Lead can access team records (simplified)
  if (role === 'Team Lead') return true;
  
  // Executive can only access assigned leads
  if (role === 'Executive') return leadAssignedTo === id;
  
  // Consultant can only access early stages (handled separately)
  if (role === 'Consultant') return leadAssignedTo === id;
  
  return false;
};

export const canEditLead = (state: AuthState, leadAssignedTo?: number): boolean => {
  if (!state.user) return false;
  
  const { role, id } = state.user;
  
  // Admin and Team Lead can edit all
  if (role === 'Admin' || role === 'Team Lead') return true;
  
  // Others can only edit their assigned leads
  return leadAssignedTo === id;
};
