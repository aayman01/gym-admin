import { create } from 'zustand';
import type { AdminUser } from '@/types/api.types';
import * as authApi from '@/lib/auth-api';
import { ApiError } from '@/lib/api-client';

type AuthState = {
  admin: AdminUser | null;
  isLoading: boolean;
  isInitialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<boolean>;
  clearSession: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  admin: null,
  isLoading: false,
  isInitialized: false,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const admin = await authApi.login(email, password);
      set({ admin, isLoading: false, isInitialized: true });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authApi.logout();
    } finally {
      set({ admin: null, isLoading: false, isInitialized: true });
    }
  },

  checkSession: async () => {
    set({ isLoading: true });
    try {
      const admin = await authApi.getMe();
      set({ admin, isLoading: false, isInitialized: true });
      return true;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        set({ admin: null, isLoading: false, isInitialized: true });
        return false;
      }
      set({ admin: null, isLoading: false, isInitialized: true });
      return false;
    }
  },

  clearSession: () => {
    set({ admin: null, isInitialized: true });
  },
}));
