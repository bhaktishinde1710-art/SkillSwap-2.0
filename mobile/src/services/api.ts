import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { storage } from './storage';
import {
  User,
  UserDetail,
  Skill,
  UserSkill,
  LearningInterest,
  Availability,
  SessionItem,
  ReviewItem,
  MentorRecommendation,
  NotificationItem,
  ReportItem,
  AdminOverview,
  AdminAnalytics,
  LoginResponse
} from '../types';

/**
 * Normalizes any backend URL ensuring proper scheme and '/api/v1' path without duplicates.
 */
export function normalizeApiUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  let url = rawUrl.trim().replace(/\/+$/, '');

  // Add http scheme if missing
  if (!/^https?:\/\//i.test(url)) {
    url = `http://${url}`;
  }

  // Ensure /api/v1 prefix is cleanly present once
  if (!url.endsWith('/api/v1')) {
    // If it already ends with /api, just append /v1
    if (url.endsWith('/api')) {
      url = `${url}/v1`;
    } else {
      url = `${url}/api/v1`;
    }
  }

  return url;
}

/**
 * Dynamically resolves the API base URL:
 * 1. Checks EXPO_PUBLIC_API_URL environment variable first (normalized).
 * 2. In Expo Go / Dev mode, dynamically extracts the developer PC's Wi-Fi LAN IP from Metro hostUri
 *    (ONLY if it matches an actual IPv4 address, avoiding tunnel hostnames).
 * 3. Falls back to 10.0.2.2 for Android Emulator or 127.0.0.1 for local web/simulator.
 */
export function resolveApiBaseUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return normalizeApiUrl(process.env.EXPO_PUBLIC_API_URL);
  }

  // Attempt to read host IP from Expo's Metro bundler connection
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any).manifest2?.extra?.expoGo?.debuggerHost ||
    (Constants as any).manifest?.debuggerHost;

  if (hostUri) {
    const hostIp = hostUri.split(':')[0];
    // Check if hostIp is an actual IPv4 address (e.g., 10.x.x.x, 192.168.x.x)
    const isIPv4 = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostIp);
    if (isIPv4 && hostIp !== '127.0.0.1' && hostIp !== 'localhost') {
      return normalizeApiUrl(`http://${hostIp}:8000/api/v1`);
    }
  }

  return Platform.OS === 'android' ? 'http://10.0.2.2:8000/api/v1' : 'http://127.0.0.1:8000/api/v1';
}

export const DEFAULT_API_URL = resolveApiBaseUrl();
console.log('[SkillSwap Mobile] Active API Base URL:', DEFAULT_API_URL);

export const api = axios.create({
  baseURL: DEFAULT_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

api.interceptors.request.use(
  async (config) => {
    const token = await storage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const fullTarget = `${config.baseURL || ''}${config.url || ''}`;
    console.log(`[SkillSwap Mobile] -> ${config.method?.toUpperCase()} ${fullTarget}`);
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const fullTarget = `${error.config?.baseURL || ''}${error.config?.url || ''}`;
    const status = error.response ? error.response.status : 'NO_RESPONSE';
    console.warn(`[SkillSwap Mobile Error] [Status ${status}] ${error.config?.method?.toUpperCase()} ${fullTarget}`);
    console.warn(`[SkillSwap Mobile Error Detail]:`, error.response?.data || error.message);

    if (error.response && error.response.status === 401) {
      // Clear expired auth session
      await storage.clearAll();
    }

    if (!error.response) {
      // Detailed diagnostics for Network Errors (connection refused, timeouts, DNS failures)
      const isTimeout = error.code === 'ECONNABORTED';
      let guidance = `Network Error: Unable to reach backend server.\n\nTarget URL: ${fullTarget}\n\n`;
      if (isTimeout) {
        guidance += 'Request timed out after 15 seconds.\nCheck if your laptop firewall allows incoming port 8000.';
      } else {
        guidance += 'Troubleshooting steps:\n';
        guidance += '1. Ensure FastAPI is running on host 0.0.0.0:8000 on your laptop.\n';
        guidance += '2. Ensure your phone is connected to the same Wi-Fi/Hotspot.\n';
        guidance += '3. Verify your laptop Wi-Fi IP in mobile/.env matches ipconfig.\n';
        guidance += '4. If using mobile hotspot, set the connection profile to Private in Windows.';
      }
      (error as any).userFriendlyMessage = guidance;
    }

    return Promise.reject(error);
  }
);

// Auth Service
export const authApi = {
  async register(data: {
    college_email: string;
    password: string;
    first_name: string;
    last_name: string;
    college: string;
    department: string;
    year: string;
  }): Promise<LoginResponse> {
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
  },
};

// User Service
export const userApi = {
  async getProfile(): Promise<UserDetail> {
    const res = await api.get<UserDetail>('/users/profile');
    return res.data;
  },

  async updateProfile(data: {
    first_name?: string;
    last_name?: string;
    bio?: string;
    department?: string;
    year?: string;
    profile_photo?: string;
  }): Promise<UserDetail> {
    const res = await api.put<UserDetail>('/users/profile', data);
    return res.data;
  },

  async completeOnboarding(data: any): Promise<UserDetail> {
    const res = await api.post<UserDetail>('/users/onboarding', data);
    return res.data;
  },

  async getMentors(params?: {
    search?: string;
    department?: string;
    skill_name?: string;
    sort_by?: string;
  }): Promise<UserDetail[]> {
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

  async setMyAvailability(
    availabilities: { day: string; start_time: string; end_time: string; available: boolean }[]
  ): Promise<Availability[]> {
    const res = await api.put<Availability[]>('/users/availability', availabilities);
    return res.data;
  },
};

// Skill Service
export const skillApi = {
  async getSkills(category?: string, search?: string): Promise<Skill[]> {
    const params: Record<string, string> = {};
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

  async addTeachingSkill(data: {
    skill_id: number;
    proficiency_level: string;
    years_of_experience: number;
  }): Promise<UserSkill> {
    const res = await api.post<UserSkill>('/skills/my-teaching', data);
    return res.data;
  },

  async removeTeachingSkill(userSkillId: number): Promise<void> {
    await api.delete(`/skills/my-teaching/${userSkillId}`);
  },

  async addLearningInterest(data: {
    skill_id: number;
    desired_level: string;
    priority: string;
  }): Promise<LearningInterest> {
    const res = await api.post<LearningInterest>('/skills/my-interests', data);
    return res.data;
  },

  async removeLearningInterest(interestId: number): Promise<void> {
    await api.delete(`/skills/my-interests/${interestId}`);
  },
};

// Matching Service
export const matchingApi = {
  async recommendMentors(payload: {
    skill_id: number;
    current_level?: string;
    desired_level?: string;
    preferred_mode?: string;
    preferred_days?: string[];
    preferred_time?: string;
  }): Promise<MentorRecommendation[]> {
    const res = await api.post<MentorRecommendation[]>('/matching/recommend', payload);
    return res.data;
  },

  async getDashboardRecommendations(): Promise<MentorRecommendation[]> {
    const res = await api.get<MentorRecommendation[]>('/matching/dashboard-recommendations');
    return res.data;
  },
};

// Session Service
export const sessionApi = {
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

  async getSessions(
    role: 'all' | 'learner' | 'mentor' = 'all',
    statusFilter?: string
  ): Promise<SessionItem[]> {
    const params: Record<string, string> = { role };
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

  async submitReview(data: {
    session_id: number;
    rating: number;
    comment: string;
  }): Promise<ReviewItem> {
    const res = await api.post<ReviewItem>('/reviews', data);
    return res.data;
  },

  async getUserReviews(userId: number): Promise<ReviewItem[]> {
    const res = await api.get<ReviewItem[]>(`/reviews/user/${userId}`);
    return res.data;
  },
};

// Notification Service
export const notificationApi = {
  async getNotifications(): Promise<NotificationItem[]> {
    const res = await api.get<NotificationItem[]>('/notifications');
    return res.data;
  },

  async getUnreadCount(): Promise<{ unread_count: number }> {
    const res = await api.get<{ unread_count: number }>('/notifications/unread-count');
    return res.data;
  },

  async markAsRead(id: number): Promise<NotificationItem> {
    const res = await api.patch<NotificationItem>(`/notifications/${id}/read`);
    return res.data;
  },

  async markAllAsRead(): Promise<void> {
    await api.post('/notifications/read-all');
  },

  async submitReport(data: {
    reported_user_id: number;
    reason: string;
    description: string;
  }): Promise<any> {
    const res = await api.post('/reports', data);
    return res.data;
  },
};

// Admin Service
export const adminApi = {
  async getOverview(): Promise<AdminOverview> {
    const res = await api.get<AdminOverview>('/admin/overview');
    return res.data;
  },

  async getAnalytics(): Promise<AdminAnalytics> {
    const res = await api.get<AdminAnalytics>('/admin/analytics');
    return res.data;
  },

  async getUsers(params?: {
    search?: string;
    department?: string;
    status_filter?: string;
    role_filter?: string;
  }): Promise<UserDetail[]> {
    const res = await api.get<UserDetail[]>('/admin/users', { params });
    return res.data;
  },

  async updateUserStatus(
    userId: number,
    statusAction: 'verify' | 'suspend' | 'activate' | 'reject'
  ): Promise<any> {
    const res = await api.patch(`/admin/users/${userId}/status?status_action=${statusAction}`);
    return res.data;
  },

  async createSkill(data: { name: string; category: string; description?: string }): Promise<Skill> {
    const res = await api.post<Skill>('/admin/skills', data);
    return res.data;
  },

  async updateSkill(
    skillId: number,
    data: { name?: string; category?: string; description?: string }
  ): Promise<Skill> {
    const res = await api.put<Skill>(`/admin/skills/${skillId}`, data);
    return res.data;
  },

  async deleteSkill(skillId: number): Promise<void> {
    await api.delete(`/admin/skills/${skillId}`);
  },

  async getAllSessions(statusFilter?: string): Promise<SessionItem[]> {
    const params: Record<string, string> = {};
    if (statusFilter && statusFilter !== 'All') params.status_filter = statusFilter;
    const res = await api.get<SessionItem[]>('/admin/sessions', { params });
    return res.data;
  },

  async getReports(statusFilter?: string): Promise<ReportItem[]> {
    const params: Record<string, string> = {};
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
  },
};

export default api;
