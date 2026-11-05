import { describe, expect, it, mock } from 'bun:test';

import { ApiError } from '@/api/errors';
import { restoreSession } from '@/auth/session-restore';
import type { User } from '@/types/domain';

const profile = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
} as unknown as User;

const tokens = {
  accessToken: 'access',
  refreshToken: 'refresh',
  sessionExpiresAt: null,
};

describe('session restore', () => {
  it('returns guest when no tokens exist', async () => {
    const getProfile = mock(async () => profile);

    const result = await restoreSession({
      loadTokens: async () => null,
      getProfile,
      clearTokens: async () => undefined,
    });

    expect(result).toEqual({ status: 'guest' });
    expect(getProfile).not.toHaveBeenCalled();
  });

  it('returns the profile when the session is valid', async () => {
    const result = await restoreSession({
      loadTokens: async () => tokens,
      getProfile: async () => profile,
      clearTokens: async () => undefined,
    });

    expect(result).toEqual({ status: 'authenticated', profile });
  });

  it('clears tokens only when the session is invalid', async () => {
    const clearTokens = mock(async () => undefined);

    const result = await restoreSession({
      loadTokens: async () => tokens,
      getProfile: async () => {
        throw new ApiError('Expired', 401);
      },
      clearTokens,
    });

    expect(result).toEqual({ status: 'guest' });
    expect(clearTokens).toHaveBeenCalledTimes(1);
  });

  it('keeps tokens on transient failures', async () => {
    const clearTokens = mock(async () => undefined);

    const result = await restoreSession({
      loadTokens: async () => tokens,
      getProfile: async () => {
        throw new ApiError('Offline');
      },
      clearTokens,
    });

    expect(result.status).toBe('restore-error');
    expect(clearTokens).not.toHaveBeenCalled();
  });
});
