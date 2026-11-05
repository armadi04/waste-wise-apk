import { useQueryClient } from '@tanstack/react-query';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';

import {
  isErrorWithCode,
  statusCodes,
} from '@react-native-google-signin/google-signin';

import {
  getProfile,
  googleMobileLogin,
  logoutMobile,
  verifyMobileTwoFactor,
} from '@/api/auth.api';
import { setUnauthorizedHandler } from '@/api/client';
import { queryKeys } from '@/api/query-keys';
import {
  authFailure,
  toAuthFailure,
  type AuthFailure,
} from '@/auth/auth-error';
import { clearTokens, loadTokens, saveTokens } from '@/auth/token-storage';
import type { AuthSession, User } from '@/types/domain';

import { requestGoogleIdToken, signOutFromGoogle } from './google-signin';
import { restoreSession } from './session-restore';

type AuthStatus = 'loading' | 'guest' | 'authenticated' | 'restore-error';

export type GoogleSignInResult =
  | { status: 'success' }
  | { status: 'cancelled' }
  | { status: 'two-factor-required' }
  | { status: 'error'; error: AuthFailure };

export type TwoFactorVerifyResult =
  { status: 'success' } | { status: 'error'; error: AuthFailure };

interface AuthContextValue {
  status: AuthStatus;
  user: User | null;
  isSigningIn: boolean;
  isTwoFactorPending: boolean;
  isVerifyingTwoFactor: boolean;
  signInWithGoogle: () => Promise<GoogleSignInResult>;
  verifyTwoFactor: (code: string) => Promise<TwoFactorVerifyResult>;
  cancelTwoFactor: () => void;
  retrySessionRestore: () => Promise<void>;
  signOut: () => Promise<void>;
  reloadProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<User | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isTwoFactorPending, setIsTwoFactorPending] = useState(false);
  const [isVerifyingTwoFactor, setIsVerifyingTwoFactor] = useState(false);
  const [twoFactorChallenge, setTwoFactorChallenge] = useState<string | null>(
    null,
  );
  const signingInRef = useRef(false);
  const verifyingTwoFactorRef = useRef(false);

  const applyAuthenticated = useCallback(
    (profile: User) => {
      setUser(profile);
      setStatus('authenticated');
      queryClient.setQueryData(queryKeys.auth.profile, profile);
    },
    [queryClient],
  );

  const loadProfile = useCallback(async () => {
    const profile = await getProfile();
    applyAuthenticated(profile);
    return profile;
  }, [applyAuthenticated]);

  const applyRestoreResult = useCallback(
    (result: Awaited<ReturnType<typeof restoreSession>>): void => {
      if (result.status === 'authenticated') {
        applyAuthenticated(result.profile);
        return;
      }
      if (result.status === 'guest') {
        setUser(null);
        setStatus('guest');
        return;
      }
      setUser(null);
      setStatus('restore-error');
    },
    [applyAuthenticated],
  );

  const restore = useCallback(async () => {
    try {
      const result = await restoreSession({
        loadTokens,
        getProfile,
        clearTokens,
      });
      applyRestoreResult(result);
    } catch {
      setUser(null);
      setStatus('restore-error');
    }
  }, [applyRestoreResult]);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const result = await restoreSession({
          loadTokens,
          getProfile,
          clearTokens,
        });
        if (active) applyRestoreResult(result);
      } catch {
        if (active) {
          setUser(null);
          setStatus('restore-error');
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [applyRestoreResult]);

  useEffect(() => {
    setUnauthorizedHandler(async () => {
      await clearTokens();
      setUser(null);
      setStatus('guest');
      queryClient.clear();
    });
    return () => setUnauthorizedHandler(null);
  }, [queryClient]);

  const signInWithGoogle =
    useCallback(async (): Promise<GoogleSignInResult> => {
      if (signingInRef.current) {
        return { status: 'error', error: authFailure('unknown') };
      }

      signingInRef.current = true;
      setIsSigningIn(true);
      setTwoFactorChallenge(null);
      setIsTwoFactorPending(false);

      try {
        const idToken = await requestGoogleIdToken();
        if (!idToken) {
          return { status: 'cancelled' };
        }

        const result = await googleMobileLogin(idToken);
        if ('twoFactorRequired' in result) {
          setTwoFactorChallenge(result.challengeToken);
          setIsTwoFactorPending(true);
          return { status: 'two-factor-required' };
        }

        const session: AuthSession = result;
        await saveTokens(session);
        await loadProfile();
        await queryClient.invalidateQueries();
        setTwoFactorChallenge(null);
        setIsTwoFactorPending(false);
        return { status: 'success' };
      } catch (error) {
        if (
          isErrorWithCode(error) &&
          error.code === statusCodes.SIGN_IN_CANCELLED
        ) {
          return { status: 'cancelled' };
        }
        return { status: 'error', error: toAuthFailure(error) };
      } finally {
        signingInRef.current = false;
        setIsSigningIn(false);
      }
    }, [loadProfile, queryClient]);

  const verifyTwoFactor = useCallback(
    async (code: string): Promise<TwoFactorVerifyResult> => {
      if (!twoFactorChallenge) {
        return {
          status: 'error',
          error: authFailure('two_factor_challenge_expired'),
        };
      }
      if (verifyingTwoFactorRef.current) {
        return { status: 'error', error: authFailure('unknown') };
      }

      verifyingTwoFactorRef.current = true;
      setIsVerifyingTwoFactor(true);

      try {
        const session = await verifyMobileTwoFactor({
          challengeToken: twoFactorChallenge,
          code,
        });
        await saveTokens(session);
        await loadProfile();
        await queryClient.invalidateQueries();
        setTwoFactorChallenge(null);
        setIsTwoFactorPending(false);
        return { status: 'success' };
      } catch (error) {
        return { status: 'error', error: toAuthFailure(error) };
      } finally {
        verifyingTwoFactorRef.current = false;
        setIsVerifyingTwoFactor(false);
      }
    },
    [loadProfile, queryClient, twoFactorChallenge],
  );

  const cancelTwoFactor = useCallback(() => {
    setTwoFactorChallenge(null);
    setIsTwoFactorPending(false);
  }, []);

  const retrySessionRestore = useCallback(async () => {
    await restore();
  }, [restore]);

  const signOut = useCallback(async () => {
    const tokens = await loadTokens();
    if (tokens?.refreshToken) {
      await logoutMobile(tokens.refreshToken).catch(() => undefined);
    }
    await signOutFromGoogle();
    await clearTokens();
    setTwoFactorChallenge(null);
    setIsTwoFactorPending(false);
    setUser(null);
    setStatus('guest');
    queryClient.clear();
  }, [queryClient]);

  const reloadProfile = useCallback(async () => {
    if (status !== 'authenticated') return;
    try {
      await loadProfile();
    } catch {
      // Keep the last known profile; the query layer surfaces refresh errors.
    }
  }, [loadProfile, status]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      isSigningIn,
      isTwoFactorPending,
      isVerifyingTwoFactor,
      signInWithGoogle,
      verifyTwoFactor,
      cancelTwoFactor,
      retrySessionRestore,
      signOut,
      reloadProfile,
    }),
    [
      cancelTwoFactor,
      isSigningIn,
      isTwoFactorPending,
      isVerifyingTwoFactor,
      reloadProfile,
      retrySessionRestore,
      signInWithGoogle,
      signOut,
      status,
      user,
      verifyTwoFactor,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
