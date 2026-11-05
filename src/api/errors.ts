import { isAxiosError } from 'axios';

export class ApiError extends Error {
  readonly status: number | null;
  readonly code: string | null;

  constructor(
    message: string,
    status: number | null = null,
    code: string | null = null,
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

function firstMessage(value: unknown): string | null {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) {
    for (const item of value) {
      const message = firstMessage(item);
      if (message) return message;
    }
  }
  if (value && typeof value === 'object' && 'message' in value) {
    return firstMessage((value as { message?: unknown }).message);
  }
  return null;
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  if (isAxiosError(error)) {
    const status = error.response?.status ?? null;
    const body = error.response?.data as
      { message?: unknown; code?: unknown } | undefined;
    const fallback =
      status === 401
        ? 'Your session has expired. Please sign in again.'
        : status === 403
          ? 'You do not have access to this resource.'
          : status === 404
            ? 'The requested item could not be found.'
            : status === 429
              ? 'Too many attempts. Please wait a moment and try again.'
              : status === 503
                ? 'The service is temporarily unavailable. Please try again.'
                : error.code === 'ECONNABORTED'
                  ? 'The request timed out. Check your connection and try again.'
                  : 'Something went wrong. Please try again.';
    return new ApiError(
      firstMessage(body?.message) || fallback,
      status,
      typeof body?.code === 'string' ? body.code : null,
    );
  }
  if (error instanceof Error && error.message) {
    return new ApiError(error.message);
  }
  return new ApiError('Something went wrong. Please try again.');
}

export function errorMessage(error: unknown): string {
  return toApiError(error).message;
}
