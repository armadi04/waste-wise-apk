import { describe, expect, it } from 'bun:test';

import { ApiError } from '@/api/errors';
import { isInvalidSessionError } from '@/api/session';

describe('session error detection', () => {
  it('treats 401 and 403 as invalid sessions', () => {
    expect(isInvalidSessionError(new ApiError('Expired', 401))).toBe(true);
    expect(isInvalidSessionError(new ApiError('Forbidden', 403))).toBe(true);
  });

  it('keeps transient failures out of the logout path', () => {
    expect(isInvalidSessionError(new ApiError('Offline'))).toBe(false);
    expect(isInvalidSessionError(new ApiError('Down', 500))).toBe(false);
    expect(isInvalidSessionError(new Error('Timeout'))).toBe(false);
  });
});
