import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { ApiResponse } from '@/types/api.types';

const MUTATING_METHODS = new Set(['post', 'put', 'patch', 'delete']);

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

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1',
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
  (error: AxiosError<ApiResponse<unknown>>) => {
    const message =
      error.response?.data?.message ??
      error.message ??
      'Something went wrong';
    return Promise.reject(new ApiError(message, error.response?.status));
  },
);
