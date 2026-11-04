import type { TimeZoneConfig, TimeZonePreference } from '@/types/domain';

import api from './client';

export async function getTimeZoneConfig(): Promise<TimeZoneConfig> {
  const { data } = await api.get<TimeZoneConfig>('/time-zone/config');
  return data;
}

export async function getTimeZonePreference(): Promise<TimeZonePreference> {
  const { data } = await api.get<TimeZonePreference>('/time-zone/preferences');
  return data;
}

export async function updateTimeZonePreference(
  preference: Partial<TimeZonePreference>,
): Promise<TimeZonePreference> {
  const { data } = await api.patch<TimeZonePreference>(
    '/time-zone/preferences',
    preference,
  );
  return data;
}
