import api from './api';
import { UserDetail, Availability } from '../types';

export const userService = {
  async getProfile(): Promise<UserDetail> {
    const res = await api.get<UserDetail>('/users/profile');
    return res.data;
  },

  async updateProfile(data: any): Promise<UserDetail> {
    const res = await api.put<UserDetail>('/users/profile', data);
    return res.data;
  },

  async completeOnboarding(data: any): Promise<UserDetail> {
    const res = await api.post<UserDetail>('/users/onboarding', data);
    return res.data;
  },

  async getMentors(params?: { search?: string; department?: string; skill_name?: string; sort_by?: string }): Promise<UserDetail[]> {
    const res = await api.get<UserDetail[]>('/users/mentors', { params });
    return res.data;
  },

  async getMentorById(mentorId: number): Promise<UserDetail> {
    const res = await api.get<UserDetail>(`/users/mentors/${mentorId}`);
    return res.data;
  },

  async getMyAvailability(): Promise<Availability[]> {
    const res = await api.get<Availability[]>('/users/availability');
    return res.data;
  },

  async setMyAvailability(availabilities: { day: string; start_time: string; end_time: string; available: boolean }[]): Promise<Availability[]> {
    const res = await api.put<Availability[]>('/users/availability', availabilities);
    return res.data;
  }
};
