import { toApiError } from './errors';

export function isInvalidSessionError(error: unknown): boolean {
  const apiError = toApiError(error);
  return apiError.status === 401 || apiError.status === 403;
}

const AUTH_ROUTES = [
  '/auth/mobile/refresh',
  '/auth/mobile/google',
  '/auth/mobile/2fa/verify',
  '/auth/mobile/logout',
] as const;

/**
 * Pre-login and token endpoints whose 401s carry their own error codes and
 * must never trigger a refresh-and-retry.
 */
export function isAuthRoute(url: string): boolean {
  return AUTH_ROUTES.some((route) => url.includes(route));
}

const CODE_REJECTION_CODES = new Set([
  'TWO_FACTOR_INVALID_CODE',
  'TWO_FACTOR_CHALLENGE_EXPIRED',
  'TWO_FACTOR_CHALLENGE_INVALID',
]);
const CODE_REJECTION_MESSAGES = new Set(['That code is not valid']);

/**
 * A 401 that rejects a submitted code (2FA enable/disable/regenerate) rather
 * than an expired access token. Refreshing and replaying it would only burn a
 * throttled attempt.
 */
export function isCodeRejection(body: unknown): boolean {
  if (!body || typeof body !== 'object') return false;
  const { code, message } = body as { code?: unknown; message?: unknown };
  return (
    (typeof code === 'string' && CODE_REJECTION_CODES.has(code)) ||
    (typeof message === 'string' && CODE_REJECTION_MESSAGES.has(message))
  );
}
