import api from './api';
import { SessionItem, ReviewItem } from '../types';

export const sessionService = {
  async bookSession(data: {
    mentor_id: number;
    skill_id: number;
    scheduled_date: string;
    start_time: string;
    end_time: string;
    mode: string;
    location?: string;
    notes?: string;
  }): Promise<SessionItem> {
    const res = await api.post<SessionItem>('/sessions', data);
    return res.data;
  },

  async getSessions(role: 'all' | 'learner' | 'mentor' = 'all', statusFilter?: string): Promise<SessionItem[]> {
    const params: any = { role };
    if (statusFilter && statusFilter !== 'All') params.status_filter = statusFilter;
    const res = await api.get<SessionItem[]>('/sessions', { params });
    return res.data;
  },

  async getMentorRequests(): Promise<SessionItem[]> {
    const res = await api.get<SessionItem[]>('/sessions/mentor/requests');
    return res.data;
  },

  async getSessionDetail(id: number): Promise<SessionItem> {
    const res = await api.get<SessionItem>(`/sessions/${id}`);
    return res.data;
  },

  async updateSessionStatus(
    id: number,
    data: { status: string; meeting_link?: string; cancellation_reason?: string }
  ): Promise<SessionItem> {
    const res = await api.patch<SessionItem>(`/sessions/${id}/status`, data);
    return res.data;
  },

  async submitReview(data: { session_id: number; rating: number; comment: string }): Promise<ReviewItem> {
    const res = await api.post<ReviewItem>('/reviews', data);
    return res.data;
  },

  async getUserReviews(userId: number): Promise<ReviewItem[]> {
    const res = await api.get<ReviewItem[]>(`/reviews/user/${userId}`);
    return res.data;
  }
};
