import { describe, expect, it } from 'bun:test';

import { ApiError, errorMessage, toApiError } from '@/api/errors';

describe('api error mapping', () => {
  it('keeps an existing ApiError', () => {
    const error = new ApiError('Nope', 403, 'FORBIDDEN');
    expect(toApiError(error)).toBe(error);
  });

  it('maps a generic Error message', () => {
    expect(errorMessage(new Error('Network failed'))).toBe('Network failed');
  });

  it('uses a safe fallback for unknown values', () => {
    expect(errorMessage({ unexpected: true })).toBe(
      'Something went wrong. Please try again.',
    );
  });
});
