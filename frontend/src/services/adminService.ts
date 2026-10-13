import api from './api';
import { AdminOverview, AdminAnalytics, UserDetail, Skill, SessionItem, ReportItem } from '../types';

export const adminService = {
  async getOverview(): Promise<AdminOverview> {
    const res = await api.get<AdminOverview>('/admin/overview');
    return res.data;
  },

  async getAnalytics(): Promise<AdminAnalytics> {
    const res = await api.get<AdminAnalytics>('/admin/analytics');
    return res.data;
  },

  async getUsers(params?: { search?: string; department?: string; status_filter?: string; role_filter?: string }): Promise<UserDetail[]> {
    const res = await api.get<UserDetail[]>('/admin/users', { params });
    return res.data;
  },

  async updateUserStatus(userId: number, statusAction: 'verify' | 'suspend' | 'activate' | 'reject'): Promise<any> {
    const res = await api.patch(`/admin/users/${userId}/status?status_action=${statusAction}`);
    return res.data;
  },

  async createSkill(data: { name: string; category: string; description?: string }): Promise<Skill> {
    const res = await api.post<Skill>('/admin/skills', data);
    return res.data;
  },

  async updateSkill(skillId: number, data: { name?: string; category?: string; description?: string }): Promise<Skill> {
    const res = await api.put<Skill>(`/admin/skills/${skillId}`, data);
    return res.data;
  },

  async deleteSkill(skillId: number): Promise<void> {
    await api.delete(`/admin/skills/${skillId}`);
  },

  async getAllSessions(statusFilter?: string): Promise<SessionItem[]> {
    const params: any = {};
    if (statusFilter && statusFilter !== 'All') params.status_filter = statusFilter;
    const res = await api.get<SessionItem[]>('/admin/sessions', { params });
    return res.data;
  },

  async getReports(statusFilter?: string): Promise<ReportItem[]> {
    const params: any = {};
    if (statusFilter && statusFilter !== 'All') params.status_filter = statusFilter;
    const res = await api.get<ReportItem[]>('/admin/reports', { params });
    return res.data;
  },

  async updateReportStatus(reportId: number, status: string): Promise<ReportItem> {
    const res = await api.patch<ReportItem>(`/admin/reports/${reportId}/status`, { status });
    return res.data;
  },

  async getReviews(): Promise<any[]> {
    const res = await api.get('/admin/reviews');
    return res.data;
  },

  async deleteReview(reviewId: number): Promise<void> {
    await api.delete(`/admin/reviews/${reviewId}`);
  },

  async getSettings(): Promise<any> {
    const res = await api.get('/admin/settings');
    return res.data;
  }
};
