import { toApiError } from '@/api/errors';
import { isInvalidSessionError } from '@/api/session';

export type AuthErrorCode =
  | 'two_factor_required'
  | 'play_services_unavailable'
  | 'network'
  | 'server'
  | 'unauthorized'
  | 'too_many_attempts'
  | 'unknown';

export interface AuthFailure {
  code: AuthErrorCode;
  message: string;
}

const authFailureMessages: Record<AuthErrorCode, string> = {
  two_factor_required:
    'This account uses two-factor authentication. Complete verification in the web app, then try again.',
  play_services_unavailable:
    'Google Play Services is unavailable or needs an update.',
  network:
    'We couldn’t connect to WasteWise. Check your connection and try again.',
  server: 'WasteWise is temporarily unavailable. Please try again in a moment.',
  unauthorized: 'We couldn’t verify your Google account. Please try again.',
  too_many_attempts: 'Too many attempts. Please wait a moment and try again.',
  unknown: 'Something went wrong. Please try again.',
};

export function authFailure(code: AuthErrorCode): AuthFailure {
  return { code, message: authFailureMessages[code] };
}

function hasErrorCode(error: unknown, code: string): boolean {
  return (
    error instanceof Error &&
    'code' in error &&
    (error as Error & { code?: unknown }).code === code
  );
}

export function toAuthFailure(error: unknown): AuthFailure {
  if (hasErrorCode(error, 'PLAY_SERVICES_NOT_AVAILABLE')) {
    return authFailure('play_services_unavailable');
  }

  if (isInvalidSessionError(error)) {
    return authFailure('unauthorized');
  }

  const apiError = toApiError(error);
  if (apiError.status === 429) {
    return authFailure('too_many_attempts');
  }
  if (apiError.status !== null && apiError.status >= 500) {
    return authFailure('server');
  }
  if (apiError.status === null) {
    return authFailure('network');
  }

  return authFailure('unknown');
}
