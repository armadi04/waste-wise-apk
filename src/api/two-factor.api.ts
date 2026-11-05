import type {
  RecoveryCodes,
  TwoFactorSetup,
  TwoFactorStatus,
} from '@/types/domain';

import api from './client';

export async function getTwoFactorStatus(): Promise<TwoFactorStatus> {
  const { data } = await api.get<TwoFactorStatus>('/auth/2fa');
  return data;
}

export async function startTwoFactorSetup(): Promise<TwoFactorSetup> {
  const { data } = await api.post<TwoFactorSetup>('/auth/2fa/setup');
  return data;
}

export async function enableTwoFactor(code: string): Promise<RecoveryCodes> {
  const { data } = await api.post<RecoveryCodes>('/auth/2fa/enable', { code });
  return data;
}

export async function disableTwoFactor(code: string): Promise<void> {
  await api.post('/auth/2fa/disable', { code });
}

export async function regenerateRecoveryCodes(
  code: string,
): Promise<RecoveryCodes> {
  const { data } = await api.post<RecoveryCodes>('/auth/2fa/recovery-codes', {
    code,
  });
  return data;
}
