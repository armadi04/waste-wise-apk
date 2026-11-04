import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/api/query-keys';
import {
  disableTwoFactor,
  enableTwoFactor,
  getTwoFactorStatus,
  regenerateRecoveryCodes,
  startTwoFactorSetup,
} from '@/api/two-factor.api';

export function useTwoFactorStatus() {
  return useQuery({
    queryKey: queryKeys.auth.twoFactor,
    queryFn: getTwoFactorStatus,
    staleTime: 30_000,
  });
}

function useRefreshStatus() {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.auth.twoFactor });
}

export function useStartTwoFactorSetup() {
  return useMutation({ mutationFn: startTwoFactorSetup });
}

export function useEnableTwoFactor() {
  const refresh = useRefreshStatus();
  return useMutation({ mutationFn: enableTwoFactor, onSuccess: refresh });
}

export function useDisableTwoFactor() {
  const refresh = useRefreshStatus();
  return useMutation({ mutationFn: disableTwoFactor, onSuccess: refresh });
}

export function useRegenerateRecoveryCodes() {
  const refresh = useRefreshStatus();
  return useMutation({
    mutationFn: regenerateRecoveryCodes,
    onSuccess: refresh,
  });
}
