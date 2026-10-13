import api from './api';
import { NotificationItem } from '../types';

export const notificationService = {
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

  async submitReport(data: { reported_user_id: number; reason: string; description: string }): Promise<any> {
    const res = await api.post('/reports', data);
    return res.data;
  }
};
