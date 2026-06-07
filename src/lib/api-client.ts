import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios';
import { config } from '@/config';
import { handleUnauthorized } from '@/lib/auth-session-handler';
import type { ApiResponse } from '@/types/api.types';

const MUTATING_METHODS = new Set(['post', 'put', 'patch', 'delete']);

declare module 'axios' {
  export interface AxiosRequestConfig {
    _retry?: boolean;
    _skipAuthRefresh?: boolean;
  }

  export interface InternalAxiosRequestConfig {
    _retry?: boolean;
    _skipAuthRefresh?: boolean;
  }
}

function getCsrfToken(): string | null {
  const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

function toApiError(error: AxiosError<ApiResponse<unknown>>): ApiError {
  const message =
    error.response?.data?.message ??
    error.message ??
    'Something went wrong';
  return new ApiError(message, error.response?.status);
}

function isAuthLoginUrl(url?: string) {
  return url?.includes('/admin/auth/login') ?? false;
}

function isAuthRefreshUrl(url?: string) {
  return url?.includes('/admin/auth/refresh') ?? false;
}

function isAuthMeUrl(url?: string) {
  return url?.includes('/admin/auth/me') ?? false;
}

let isRefreshing = false;
let refreshQueue: Array<{
  resolve: () => void;
  reject: (error: unknown) => void;
}> = [];

function processRefreshQueue(error: unknown | null) {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve();
  });
  refreshQueue = [];
}

async function refreshAccessToken() {
  await apiClient.post('/admin/auth/refresh', undefined, {
    _skipAuthRefresh: true,
  });
}

export const apiClient = axios.create({
  baseURL: config.api.baseUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const method = config.method?.toLowerCase();
  if (method && MUTATING_METHODS.has(method)) {
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      config.headers.set('x-xsrf-token', csrfToken);
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    const payload = response.data as ApiResponse<unknown>;
    if (payload && typeof payload === 'object' && payload.success === false) {
      return Promise.reject(new ApiError(payload.message, response.status));
    }
    return response;
  },
  async (error: AxiosError<ApiResponse<unknown>>) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._skipAuthRefresh
    ) {
      const url = originalRequest.url;

      if (isAuthLoginUrl(url) || isAuthMeUrl(url)) {
        return Promise.reject(toApiError(error));
      }

      if (isAuthRefreshUrl(url)) {
        handleUnauthorized();
        return Promise.reject(toApiError(error));
      }

      if (originalRequest._retry) {
        handleUnauthorized();
        return Promise.reject(toApiError(error));
      }

      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise<void>((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        })
          .then(() => apiClient(originalRequest))
          .catch((queueError) => Promise.reject(queueError));
      }

      isRefreshing = true;

      try {
        await refreshAccessToken();
        processRefreshQueue(null);
        return apiClient(originalRequest);
      } catch (refreshError) {
        processRefreshQueue(refreshError);
        handleUnauthorized();
        return Promise.reject(toApiError(error));
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(toApiError(error));
  },
);
