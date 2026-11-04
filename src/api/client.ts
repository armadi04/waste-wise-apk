import axios, {
  create as createAxios,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios';

import {
  clearTokens,
  getCachedAccessToken,
  loadTokens,
  saveTokens,
} from '@/auth/token-storage';
import { API_BASE_URL } from '@/lib/config';

import { ApiError, toApiError } from './errors';
import { isAuthRoute, isCodeRejection, isInvalidSessionError } from './session';

type UnauthorizedHandler = () => void | Promise<void>;

let unauthorizedHandler: UnauthorizedHandler | null = null;
let refreshing: Promise<string> | null = null;

export function setUnauthorizedHandler(
  handler: UnauthorizedHandler | null,
): void {
  unauthorizedHandler = handler;
}

async function refreshAccessToken(): Promise<string> {
  if (refreshing) return refreshing;

  refreshing = (async () => {
    const tokens = await loadTokens();
    if (!tokens?.refreshToken) {
      throw new ApiError('No refresh token available', 401, 'UNAUTHORIZED');
    }

    const response = await axios.post<{
      accessToken: string;
      refreshToken: string;
      sessionExpiresAt: string;
    }>(
      `${API_BASE_URL}/auth/mobile/refresh`,
      { refreshToken: tokens.refreshToken },
      {
        timeout: 20_000,
        headers: {
          'Content-Type': 'application/json',
          'X-Client': 'WasteWise-Mobile',
        },
      },
    );

    await saveTokens(response.data);
    return response.data.accessToken;
  })().finally(() => {
    refreshing = null;
  });

  return refreshing;
}

const api = createAxios({
  baseURL: API_BASE_URL,
  timeout: 30_000,
  headers: {
    'X-Client': 'WasteWise-Mobile',
  },
});

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const accessToken =
    getCachedAccessToken() ?? (await loadTokens())?.accessToken;
  if (accessToken) {
    config.headers.set('Authorization', `Bearer ${accessToken}`);
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const original = error.config as
      (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const url = original?.url ?? '';
    if (
      status === 401 &&
      original &&
      !original._retry &&
      !isAuthRoute(url) &&
      !isCodeRejection(error.response?.data)
    ) {
      original._retry = true;
      try {
        const accessToken = await refreshAccessToken();
        original.headers.set('Authorization', `Bearer ${accessToken}`);
        return api(original);
      } catch (refreshError) {
        if (isInvalidSessionError(refreshError)) {
          await clearTokens();
          await unauthorizedHandler?.();
          return Promise.reject(
            new ApiError(
              'Your session has expired. Please sign in again.',
              401,
              'UNAUTHORIZED',
            ),
          );
        }
        return Promise.reject(toApiError(refreshError));
      }
    }

    return Promise.reject(toApiError(error));
  },
);

export default api;
