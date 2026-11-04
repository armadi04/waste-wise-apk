import { describe, expect, it } from 'bun:test';

import { ApiError } from '@/api/errors';
import {
  isAuthRoute,
  isCodeRejection,
  isInvalidSessionError,
} from '@/api/session';

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

describe('auth route detection', () => {
  it('skips refresh for pre-login and token endpoints', () => {
    expect(isAuthRoute('/auth/mobile/2fa/verify')).toBe(true);
    expect(isAuthRoute('/auth/mobile/google')).toBe(true);
    expect(isAuthRoute('/auth/mobile/refresh')).toBe(true);
    expect(isAuthRoute('/auth/mobile/logout')).toBe(true);
  });

  it('keeps authenticated routes refreshable', () => {
    expect(isAuthRoute('/reports')).toBe(false);
    expect(isAuthRoute('/auth/profile')).toBe(false);
  });
});

describe('code rejection detection', () => {
  it('recognises rejected 2FA codes', () => {
    expect(isCodeRejection({ message: 'That code is not valid' })).toBe(true);
    expect(isCodeRejection({ code: 'TWO_FACTOR_INVALID_CODE' })).toBe(true);
  });

  it('leaves expired-token 401s refreshable', () => {
    expect(isCodeRejection({ message: 'Unauthorized' })).toBe(false);
    expect(isCodeRejection(undefined)).toBe(false);
    expect(isCodeRejection('nope')).toBe(false);
  });
});
