import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { AdminLoginPayload, AdminUser } from '@/types/auth-type';

const BASE_URL = '/admin/auth';

export const AUTH_QUERY_KEYS = {
  all: ['admin-auth'] as const,
  me: () => [...AUTH_QUERY_KEYS.all, 'me'] as const,
};

// ─── API functions (used by auth store and hooks) ────────────────────────────

export async function loginAdmin(payload: AdminLoginPayload) {
  return api.post<AdminUser>(`${BASE_URL}/login`, payload);
}

export async function getAdminMe() {
  return api.get<AdminUser>(`${BASE_URL}/me`);
}

export async function logoutAdmin() {
  return api.post<null>(`${BASE_URL}/logout`);
}

export async function refreshAdminSession() {
  return api.post<AdminUser>(`${BASE_URL}/refresh`);
}

// ─── Queries ─────────────────────────────────────────────────────────────────

export function useGetAdminMe(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.me(),
    queryFn: getAdminMe,
    enabled: options?.enabled ?? true,
    retry: false,
  });
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loginAdmin,
    onSuccess: (admin) => {
      queryClient.setQueryData(AUTH_QUERY_KEYS.me(), admin);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutAdmin,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: AUTH_QUERY_KEYS.all });
    },
  });
}
