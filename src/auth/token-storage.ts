import * as SecureStore from 'expo-secure-store';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  sessionExpiresAt: string | null;
}

const ACCESS_KEY = 'wastewise.access-token';
const REFRESH_KEY = 'wastewise.refresh-token';
const EXPIRES_KEY = 'wastewise.session-expires-at';

let cache: AuthTokens | null | undefined;

function warnDevelopment(message: string): void {
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    console.warn(message);
  }
}

async function read(key: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

async function write(key: string, value: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch {
    warnDevelopment(`Secure storage could not persist ${key}.`);
  }
}

async function remove(key: string): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch {
    // Nothing to clean up.
  }
}

export async function loadTokens(): Promise<AuthTokens | null> {
  if (cache !== undefined) return cache;
  const [accessToken, refreshToken, sessionExpiresAt] = await Promise.all([
    read(ACCESS_KEY),
    read(REFRESH_KEY),
    read(EXPIRES_KEY),
  ]);
  cache =
    accessToken && refreshToken
      ? { accessToken, refreshToken, sessionExpiresAt }
      : null;
  return cache;
}

export function getCachedAccessToken(): string | null {
  return cache?.accessToken ?? null;
}

export async function saveTokens(tokens: AuthTokens): Promise<void> {
  cache = tokens;
  await Promise.all([
    write(ACCESS_KEY, tokens.accessToken),
    write(REFRESH_KEY, tokens.refreshToken),
    write(EXPIRES_KEY, tokens.sessionExpiresAt ?? ''),
  ]);
}

export async function clearTokens(): Promise<void> {
  cache = null;
  await Promise.all([
    remove(ACCESS_KEY),
    remove(REFRESH_KEY),
    remove(EXPIRES_KEY),
  ]);
}
