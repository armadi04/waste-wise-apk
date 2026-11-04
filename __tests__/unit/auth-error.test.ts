import { describe, expect, it } from 'bun:test';

import { ApiError } from '@/api/errors';
import { authFailure, toAuthFailure } from '@/auth/auth-error';

describe('auth error mapping', () => {
  it('maps invalid sessions to unauthorized', () => {
    expect(toAuthFailure(new ApiError('Nope', 401)).code).toBe('unauthorized');
    expect(toAuthFailure(new ApiError('Nope', 403)).code).toBe('unauthorized');
  });

  it('maps rate limits and server failures', () => {
    expect(toAuthFailure(new ApiError('Slow down', 429)).code).toBe(
      'too_many_attempts',
    );
    expect(toAuthFailure(new ApiError('Down', 500)).code).toBe('server');
    expect(toAuthFailure(new ApiError('Down', 503)).code).toBe('server');
  });

  it('treats connection failures as network errors', () => {
    expect(toAuthFailure(new ApiError('Offline')).code).toBe('network');
    expect(toAuthFailure(new Error('Offline')).code).toBe('network');
  });

  it('keeps other API failures generic', () => {
    expect(toAuthFailure(new ApiError('Bad request', 400)).code).toBe(
      'unknown',
    );
  });

  it('maps unavailable Play Services', () => {
    const error = Object.assign(new Error('Missing'), {
      code: 'PLAY_SERVICES_NOT_AVAILABLE',
    });
    expect(toAuthFailure(error).code).toBe('play_services_unavailable');
  });

  it('maps structured 2FA and account errors', () => {
    expect(
      toAuthFailure(new ApiError('Invalid', 401, 'TWO_FACTOR_INVALID_CODE'))
        .code,
    ).toBe('two_factor_invalid_code');
    expect(
      toAuthFailure(
        new ApiError('Expired', 401, 'TWO_FACTOR_CHALLENGE_EXPIRED'),
      ).code,
    ).toBe('two_factor_challenge_expired');
    expect(
      toAuthFailure(new ApiError('Locked', 403, 'ACCOUNT_LOCKED')).code,
    ).toBe('account_locked');
    expect(
      toAuthFailure(new ApiError('Inactive', 403, 'ACCOUNT_INACTIVE')).code,
    ).toBe('account_inactive');
  });

  it('keeps the backend lockout message', () => {
    const failure = toAuthFailure(
      new ApiError('Try again in 4 minutes.', 403, 'ACCOUNT_LOCKED'),
    );
    expect(failure.message).toBe('Try again in 4 minutes.');
  });

  it('provides a user-facing message for every failure', () => {
    expect(authFailure('two_factor_invalid_code').message).toContain('code');
    expect(authFailure('network').message).toContain('connection');
    expect(authFailure('unknown').message).toBeTruthy();
  });
});
