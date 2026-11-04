import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/api/query-keys';
import {
  getTimeZoneConfig,
  getTimeZonePreference,
  updateTimeZonePreference,
} from '@/api/time-zone.api';
import { updateProfile, type ProfileUpdate } from '@/api/users.api';
import type { TimeZonePreference } from '@/types/domain';

export function useTimeZoneConfig() {
  return useQuery({
    queryKey: queryKeys.timeZone.config,
    queryFn: getTimeZoneConfig,
    staleTime: 60 * 60_000,
  });
}

export function useTimeZonePreference() {
  return useQuery({
    queryKey: queryKeys.timeZone.preference,
    queryFn: getTimeZonePreference,
  });
}

export function useSaveProfile(userId: number | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      profile,
      timeZone,
    }: {
      profile: ProfileUpdate;
      /** Only sent when it changed. */
      timeZone?: Partial<TimeZonePreference>;
    }) => {
      if (!userId) throw new Error('Your profile is not loaded yet.');
      if (timeZone) {
        const saved = await updateTimeZonePreference(timeZone);
        queryClient.setQueryData(queryKeys.timeZone.preference, saved);
      }
      return updateProfile(userId, profile);
    },
  });
}
