import type {
  MobileGoogleLoginResponse,
  MobileTwoFactorVerifyResponse,
  TwoFactorVerifyPayload,
  User,
} from '@/types/domain';

import api from './client';

export async function googleMobileLogin(
  idToken: string,
): Promise<MobileGoogleLoginResponse> {
  const { data } = await api.post<MobileGoogleLoginResponse>(
    '/auth/mobile/google',
    { token: idToken },
  );
  return data;
}

export async function verifyMobileTwoFactor(
  payload: TwoFactorVerifyPayload,
): Promise<MobileTwoFactorVerifyResponse> {
  const { data } = await api.post<MobileTwoFactorVerifyResponse>(
    '/auth/mobile/2fa/verify',
    payload,
  );
  return data;
}

export async function logoutMobile(refreshToken: string): Promise<void> {
  await api.post('/auth/mobile/logout', { refreshToken });
}

export async function getProfile(): Promise<User> {
  const { data } = await api.get<User>('/auth/profile');
  return data;
}
