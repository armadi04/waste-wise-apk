import { getCachedAccessToken } from '@/auth/token-storage';

import { API_BASE_URL } from './config';

/**
 * expo-image source for a photo URL. Report photos are private, so requests to
 * our own API carry the session's Bearer token; local files and third-party
 * URLs are passed through untouched so the token never leaves the API origin.
 */
export function mediaImageSource(uri: string): {
  uri: string;
  headers?: Record<string, string>;
} {
  const token = getCachedAccessToken();
  if (!token || !uri.startsWith(`${API_BASE_URL}/`)) return { uri };
  return { uri, headers: { Authorization: `Bearer ${token}` } };
}
