import { useQueryClient } from '@tanstack/react-query';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

import { isErrorWithCode, statusCodes } from '@react-native-google-signin/google-signin';

import {
  getProfile,
  googleMobileLogin,
  logoutMobile,
} from '@/api/auth.api';
import { setUnauthorizedHandler } from '@/api/client';
import { errorMessage } from '@/api/errors';
import { queryKeys } from '@/api/query-keys';
import { clearTokens, loadTokens, saveTokens } from '@/auth/token-storage';
import type { AuthSession, User } from '@/types/domain';
import { requestGoogleIdToken, signOutFromGoogle } from './google-signin';

type AuthStatus = 'loading' | 'authenticated' | 'guest';

interface AuthContextValue {
  status: AuthStatus;
  user: User | null;
  isSigningIn: boolean;
  signInWithGoogle: () => Promise<{ cancelled: boolean }>;
  signOut: () => Promise<void>;
  reloadProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<User | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const loadProfile = useCallback(async () => {
    const profile = await getProfile();
    setUser(profile);
    setStatus('authenticated');
    queryClient.setQueryData(queryKeys.auth.profile, profile);
    return profile;
  }, [queryClient]);

  useEffect(() => {
    let active = true;
    (async () => {
      const tokens = await loadTokens();
      if (!tokens) {
        if (active) setStatus('guest');
        return;
      }
      try {
        const profile = await getProfile();
        if (!active) return;
        setUser(profile);
        setStatus('authenticated');
        queryClient.setQueryData(queryKeys.auth.profile, profile);
      } catch {
        await clearTokens();
        if (active) {
          setUser(null);
          setStatus('guest');
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [queryClient]);

  useEffect(() => {
    setUnauthorizedHandler(async () => {
      await clearTokens();
      setUser(null);
      setStatus('guest');
      queryClient.clear();
    });
    return () => setUnauthorizedHandler(null);
  }, [queryClient]);

  const signInWithGoogle = useCallback(async () => {
    setIsSigningIn(true);
    try {
      const idToken = await requestGoogleIdToken();
      if (!idToken) {
        return { cancelled: true };
      }

      const result = await googleMobileLogin(idToken);
      if ('twoFactorRequired' in result) {
        throw new Error(
          'This account uses two-factor authentication. Complete verification in the web app, then try again.',
        );
      }

      const session: AuthSession = result;
      await saveTokens(session);
      await loadProfile();
      await queryClient.invalidateQueries();
      return { cancelled: false };
    } catch (error) {
      if (
        isErrorWithCode(error) &&
        error.code === statusCodes.SIGN_IN_CANCELLED
      ) {
        return { cancelled: true };
      }
      if (
        isErrorWithCode(error) &&
        error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE
      ) {
        throw new Error(
          'Google Play Services is unavailable or needs an update.',
        );
      }
      throw new Error(errorMessage(error));
    } finally {
      setIsSigningIn(false);
    }
  }, [loadProfile, queryClient]);

  const signOut = useCallback(async () => {
    const tokens = await loadTokens();
    if (tokens?.refreshToken) {
      await logoutMobile(tokens.refreshToken).catch(() => undefined);
    }
    await signOutFromGoogle();
    await clearTokens();
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
      signInWithGoogle,
      signOut,
      reloadProfile,
    }),
    [isSigningIn, reloadProfile, signInWithGoogle, signOut, status, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
