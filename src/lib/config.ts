const DEFAULT_API_URL = 'http://10.0.2.2:3000/api/v1';

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

export const API_BASE_URL = trimTrailingSlash(
  process.env.EXPO_PUBLIC_API_URL?.trim() || DEFAULT_API_URL,
);

export const API_ORIGIN = API_BASE_URL.replace(/\/api\/v1$/, '');

export const GOOGLE_WEB_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim() ?? '';

export const IS_GOOGLE_CONFIGURED = GOOGLE_WEB_CLIENT_ID.length > 0;
