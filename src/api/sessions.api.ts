import type { OwnSession } from '@/types/domain';

import api from './client';

export async function listMySessions(): Promise<OwnSession[]> {
  const { data } = await api.get<OwnSession[]>('/sessions/me');
  return data;
}

export async function revokeMySession(id: number): Promise<void> {
  await api.delete(`/sessions/me/${id}`);
}

export async function revokeOtherSessions(): Promise<{ revoked: number }> {
  const { data } = await api.post<{ revoked: number }>(
    '/sessions/me/revoke-others',
  );
  return data;
}
