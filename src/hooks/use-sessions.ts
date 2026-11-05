import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/api/query-keys';
import {
  listMySessions,
  revokeMySession,
  revokeOtherSessions,
} from '@/api/sessions.api';

export function useMySessions() {
  return useQuery({
    queryKey: queryKeys.sessions.mine,
    queryFn: listMySessions,
    staleTime: 15_000,
  });
}

function useRefreshSessions() {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.sessions.mine });
}

export function useRevokeSession() {
  const refresh = useRefreshSessions();
  return useMutation({ mutationFn: revokeMySession, onSuccess: refresh });
}

export function useRevokeOtherSessions() {
  const refresh = useRefreshSessions();
  return useMutation({ mutationFn: revokeOtherSessions, onSuccess: refresh });
}
