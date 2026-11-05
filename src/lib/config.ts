const DEFAULT_API_URL = 'http://10.0.2.2:3000/api/v1';
const isDevelopment = typeof __DEV__ === 'undefined' ? true : __DEV__;

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
const configuredGoogleClientId =
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim() ?? '';

if (!isDevelopment) {
  if (!configuredApiUrl) {
    throw new Error('EXPO_PUBLIC_API_URL is required for production builds.');
  }
  if (!configuredGoogleClientId) {
    throw new Error(
      'EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID is required for production builds.',
    );
  }
}

export const API_BASE_URL = trimTrailingSlash(
  configuredApiUrl || DEFAULT_API_URL,
);

export const API_ORIGIN = API_BASE_URL.replace(/\/api\/v1$/, '');

export const GOOGLE_WEB_CLIENT_ID = configuredGoogleClientId;

export const IS_GOOGLE_CONFIGURED = GOOGLE_WEB_CLIENT_ID.length > 0;
