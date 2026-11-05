import { toApiError } from '@/api/errors';

export type AuthErrorCode =
  | 'two_factor_invalid_code'
  | 'two_factor_challenge_expired'
  | 'two_factor_challenge_invalid'
  | 'account_locked'
  | 'account_inactive'
  | 'play_services_unavailable'
  | 'google_network'
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
  two_factor_invalid_code:
    'That code is not valid. Check the code and try again.',
  two_factor_challenge_expired: 'Your sign-in attempt expired. Start again.',
  two_factor_challenge_invalid: 'Your sign-in attempt is invalid. Start again.',
  account_locked: 'Too many failed attempts. Wait a few minutes and try again.',
  account_inactive:
    'This WasteWise account is inactive. Contact support if you need help.',
  play_services_unavailable:
    'Google Play Services is unavailable or needs an update.',
  google_network:
    'Google Sign-In couldn’t reach Google. Check your internet connection and try again.',
  network:
    'We couldn’t connect to WasteWise. Check your connection and try again.',
  server: 'WasteWise is temporarily unavailable. Please try again in a moment.',
  unauthorized: 'We couldn’t verify your Google account. Please try again.',
  too_many_attempts: 'Too many attempts. Please wait a moment and try again.',
  unknown: 'Something went wrong. Please try again.',
};

export function authFailure(
  code: AuthErrorCode,
  message?: string,
): AuthFailure {
  return { code, message: message ?? authFailureMessages[code] };
}

function hasErrorCode(error: unknown, code: string): boolean {
  return (
    error instanceof Error &&
    'code' in error &&
    (error as Error & { code?: unknown }).code === code
  );
}

// Google Play Services reports connectivity failures as ApiException
// NETWORK_ERROR (status code 7). This is not a WasteWise API failure.
function isGoogleNetworkError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const code = (error as Error & { code?: unknown }).code;
  return (
    (code === 7 || code === '7' || /NETWORK_ERROR/.test(error.message)) &&
    !('isAxiosError' in error)
  );
}

const apiCodeMap: Record<string, AuthErrorCode> = {
  TWO_FACTOR_INVALID_CODE: 'two_factor_invalid_code',
  TWO_FACTOR_CHALLENGE_EXPIRED: 'two_factor_challenge_expired',
  TWO_FACTOR_CHALLENGE_INVALID: 'two_factor_challenge_invalid',
  ACCOUNT_LOCKED: 'account_locked',
  ACCOUNT_INACTIVE: 'account_inactive',
};

export function toAuthFailure(error: unknown): AuthFailure {
  if (hasErrorCode(error, 'PLAY_SERVICES_NOT_AVAILABLE')) {
    return authFailure('play_services_unavailable');
  }

  if (isGoogleNetworkError(error)) {
    return authFailure('google_network');
  }

  const apiError = toApiError(error);

  const code = apiError.code ? apiCodeMap[apiError.code] : undefined;
  if (code) {
    return authFailure(
      code,
      code === 'account_locked' ? apiError.message : undefined,
    );
  }

  if (apiError.status === 401 || apiError.status === 403) {
    return authFailure('unauthorized');
  }
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
