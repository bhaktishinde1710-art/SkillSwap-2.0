import api from './api';
import { Skill, UserSkill, LearningInterest } from '../types';

export const skillService = {
  async getSkills(category?: string, search?: string): Promise<Skill[]> {
    const params: any = {};
    if (category && category !== 'All') params.category = category;
    if (search) params.search = search;
    const res = await api.get<Skill[]>('/skills', { params });
    return res.data;
  },

  async getCategories(): Promise<string[]> {
    const res = await api.get<string[]>('/skills/categories');
    return res.data;
  },

  async getSkill(id: number): Promise<Skill> {
    const res = await api.get<Skill>(`/skills/${id}`);
    return res.data;
  },

  async addTeachingSkill(data: { skill_id: number; proficiency_level: string; years_of_experience: number }): Promise<UserSkill> {
    const res = await api.post<UserSkill>('/skills/my-teaching', data);
    return res.data;
  },

  async removeTeachingSkill(userSkillId: number): Promise<void> {
    await api.delete(`/skills/my-teaching/${userSkillId}`);
  },

  async addLearningInterest(data: { skill_id: number; desired_level: string; priority: string }): Promise<LearningInterest> {
    const res = await api.post<LearningInterest>('/skills/my-interests', data);
    return res.data;
  },

  async removeLearningInterest(interestId: number): Promise<void> {
    await api.delete(`/skills/my-interests/${interestId}`);
  }
};
