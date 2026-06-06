import { api } from '@/lib/api';
import type { AdminUser } from '@/types/api.types';

export function login(email: string, password: string) {
  return api.post<AdminUser>('/admin/auth/login', { email, password });
}

export function getMe() {
  return api.get<AdminUser>('/admin/auth/me');
}

export function logout() {
  return api.post<null>('/admin/auth/logout');
}
