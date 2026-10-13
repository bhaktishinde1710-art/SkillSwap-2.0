import api from './api';
import { User } from '../types';

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export const authService = {
  async register(data: any): Promise<LoginResponse> {
    const res = await api.post<LoginResponse>('/auth/register', data);
    return res.data;
  },

  async login(credentials: { college_email: string; password: string }): Promise<LoginResponse> {
    const res = await api.post<LoginResponse>('/auth/login', credentials);
    return res.data;
  },

  async getMe(): Promise<User> {
    const res = await api.get<User>('/auth/me');
    return res.data;
  },

  async forgotPassword(college_email: string): Promise<{ message: string }> {
    const res = await api.post<{ message: string }>('/auth/forgot-password', { college_email });
    return res.data;
  },

  async resetPassword(token: string, new_password: string): Promise<{ message: string }> {
    const res = await api.post<{ message: string }>('/auth/reset-password', { token, new_password });
    return res.data;
  }
};
