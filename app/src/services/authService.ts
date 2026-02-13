import apiClient from '@/api/client';
import { LoginRequest, LoginResponse, User } from '@/types';

export const AuthService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  async refreshToken(): Promise<{ access_token: string; user: User }> {
    const response = await apiClient.post('/auth/refresh');
    return response.data;
  },

  async getCurrentUser(): Promise<{ user: User }> {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  async getUsers(params?: { role?: string; is_active?: boolean }): Promise<{ users: User[] }> {
    const response = await apiClient.get('/auth/users', { params });
    return response.data;
  },

  async createUser(userData: {
    name: string;
    email: string;
    password: string;
    role: string;
    is_active?: boolean;
  }): Promise<{ user: User }> {
    const response = await apiClient.post('/auth/users', userData);
    return response.data;
  },

  async updateUser(userId: number, userData: Partial<User>): Promise<{ user: User }> {
    const response = await apiClient.put(`/auth/users/${userId}`, userData);
    return response.data;
  },

  async deleteUser(userId: number): Promise<{ message: string }> {
    const response = await apiClient.delete(`/auth/users/${userId}`);
    return response.data;
  },

  async getExecutives(): Promise<{ executives: User[] }> {
    const response = await apiClient.get('/auth/executives');
    return response.data;
  },
};
