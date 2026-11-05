import { isInvalidSessionError } from '@/api/session';
import type { User } from '@/types/domain';

import type { AuthTokens } from './token-storage';

export type SessionRestoreResult =
  | { status: 'guest' }
  | { status: 'authenticated'; profile: User }
  | { status: 'restore-error'; message: string };

export interface SessionRestoreDependencies {
  loadTokens: () => Promise<AuthTokens | null>;
  getProfile: () => Promise<User>;
  clearTokens: () => Promise<void>;
}

const RECOVERY_MESSAGE =
  'We couldn’t restore your session. Check your connection and try again.';

export async function restoreSession({
  loadTokens,
  getProfile,
  clearTokens,
}: SessionRestoreDependencies): Promise<SessionRestoreResult> {
  const tokens = await loadTokens();
  if (!tokens) {
    return { status: 'guest' };
  }

  try {
    const profile = await getProfile();
    return { status: 'authenticated', profile };
  } catch (error) {
    if (isInvalidSessionError(error)) {
      await clearTokens();
      return { status: 'guest' };
    }
    return { status: 'restore-error', message: RECOVERY_MESSAGE };
  }
}
