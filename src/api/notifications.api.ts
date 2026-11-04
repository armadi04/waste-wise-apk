import type { PaginatedNotifications } from '@/types/domain';

import api from './client';

export async function listNotifications(
  page: number,
  limit = 20,
): Promise<PaginatedNotifications> {
  const { data } = await api.get<PaginatedNotifications>('/notifications', {
    params: { page, limit },
  });
  return data;
}

export async function getUnreadNotificationCount(): Promise<number> {
  const { data } = await api.get<number>('/notifications/unread-count');
  return Number(data) || 0;
}

export async function markNotificationRead(id: number): Promise<void> {
  await api.patch(`/notifications/${id}/read`);
}

export async function markAllNotificationsRead(): Promise<void> {
  await api.post('/notifications/read-all');
}
