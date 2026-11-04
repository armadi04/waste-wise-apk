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
