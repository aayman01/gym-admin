import { create } from 'zustand';
import type { AdminUser } from '@/types/auth-type';
import {
  getAdminMe,
  loginAdmin,
  logoutAdmin,
} from '@/hooks/api/admin/use-auth';
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

/** Dedupes concurrent session checks (e.g. React StrictMode double-mount in dev). */
let sessionCheckInFlight: Promise<boolean> | null = null;

export const useAuthStore = create<AuthState>((set) => ({
  admin: null,
  isLoading: false,
  isInitialized: false,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const admin = await loginAdmin({ email, password });
      set({ admin, isLoading: false, isInitialized: true });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await logoutAdmin();
    } finally {
      set({ admin: null, isLoading: false, isInitialized: true });
    }
  },

  checkSession: async () => {
    if (sessionCheckInFlight) {
      return sessionCheckInFlight;
    }

    sessionCheckInFlight = (async () => {
      set({ isLoading: true });
      try {
        const admin = await getAdminMe();
        set({ admin, isLoading: false, isInitialized: true });
        return true;
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          set({ admin: null, isLoading: false, isInitialized: true });
          return false;
        }
        set({ admin: null, isLoading: false, isInitialized: true });
        return false;
      } finally {
        sessionCheckInFlight = null;
      }
    })();

    return sessionCheckInFlight;
  },

  clearSession: () => {
    set({ admin: null, isInitialized: true });
  },
}));
