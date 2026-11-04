import api from './client';
import type {
  AuthSession,
  MobileGoogleLoginResponse,
  User,
} from '@/types/domain';

export async function googleMobileLogin(idToken: string): Promise<MobileGoogleLoginResponse> {
  const { data } = await api.post<MobileGoogleLoginResponse>(
    '/auth/mobile/google',
    { token: idToken },
  );
  return data;
}

export async function refreshMobileSession(
  refreshToken: string,
): Promise<AuthSession> {
  const { data } = await api.post<AuthSession>('/auth/mobile/refresh', {
    refreshToken,
  });
  return data;
}

export async function logoutMobile(refreshToken: string): Promise<void> {
  await api.post('/auth/mobile/logout', { refreshToken });
}

export async function getProfile(): Promise<User> {
  const { data } = await api.get<User>('/auth/profile');
  return data;
}

export interface SessionIdentity {
  userId: number;
  email: string;
  roles: string[];
  permissions: string[];
  emailVerified: boolean;
  activeRole?: string;
}

export async function getSessionIdentity(): Promise<SessionIdentity> {
  const { data } = await api.get<SessionIdentity>('/auth/me');
  return data;
}
