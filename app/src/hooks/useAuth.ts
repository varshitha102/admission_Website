import { useCallback } from 'react';
import { useAuth as useAuthContext, loginStart, loginSuccess, loginFailure, logout as logoutAction, updateUser, clearError } from '@/store/authStore';
import { AuthService } from '@/services';
import { setTokens, clearTokens } from '@/api/client';
import { LoginRequest, User } from '@/types';
import { toast } from 'sonner';

export function useAuth() {
  const { state, dispatch } = useAuthContext();

  const login = useCallback(async (credentials: LoginRequest) => {
    dispatch(loginStart());
    try {
      const response = await AuthService.login(credentials);
      setTokens(response.access_token, response.refresh_token);
      localStorage.setItem('user', JSON.stringify(response.user));
      dispatch(loginSuccess(response.user));
      toast.success('Login successful');
      return response;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      dispatch(loginFailure(message));
      toast.error(message);
      throw error;
    }
  }, [dispatch]);

  const logout = useCallback(() => {
    clearTokens();
    dispatch(logoutAction());
    toast.info('Logged out');
  }, [dispatch]);

  const refreshUser = useCallback(async () => {
    try {
      const response = await AuthService.getCurrentUser();
      localStorage.setItem('user', JSON.stringify(response.user));
      dispatch(updateUser(response.user));
      return response.user;
    } catch (error) {
      console.error('Failed to refresh user:', error);
      throw error;
    }
  }, [dispatch]);

  const handleClearError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    role: state.user?.role || null,
    isAdmin: state.user?.role === 'Admin',
    isTeamLead: state.user?.role === 'Team Lead',
    isManager: ['Admin', 'Team Lead', 'Digital Manager'].includes(state.user?.role || ''),
    login,
    logout,
    refreshUser,
    clearError: handleClearError,
  };
}
