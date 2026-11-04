import type { ReleaseNotes } from '@/types/domain';

import api from './client';

export async function listReleases(): Promise<ReleaseNotes[]> {
  const { data } = await api.get<ReleaseNotes[]>('/changelog');
  return data;
}
