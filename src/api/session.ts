import { toApiError } from './errors';

export function isInvalidSessionError(error: unknown): boolean {
  const apiError = toApiError(error);
  return apiError.status === 401 || apiError.status === 403;
}
