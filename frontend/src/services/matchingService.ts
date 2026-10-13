import api from './api';
import { MentorRecommendation } from '../types';

export interface FindMentorPayload {
  skill_id: number;
  current_level?: string;
  desired_level?: string;
  preferred_mode?: string;
  preferred_days?: string[];
  preferred_time?: string;
}

export const matchingService = {
  async recommendMentors(payload: FindMentorPayload): Promise<MentorRecommendation[]> {
    const res = await api.post<MentorRecommendation[]>('/matching/recommend', payload);
    return res.data;
  },

  async getDashboardRecommendations(): Promise<MentorRecommendation[]> {
    const res = await api.get<MentorRecommendation[]>('/matching/dashboard-recommendations');
    return res.data;
  }
};
