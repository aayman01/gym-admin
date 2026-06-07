import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { DashboardData, DashboardPeriod } from '@/types/dashboard-type';

const BASE_URL = '/admin/dashboard';

export const DASHBOARD_QUERY_KEYS = {
  all: ['admin-dashboard'] as const,
  detail: (period: DashboardPeriod) =>
    [...DASHBOARD_QUERY_KEYS.all, period] as const,
};

// ─── Queries ─────────────────────────────────────────────────────────────────

export function useGetDashboard(
  period: DashboardPeriod = '30d',
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.detail(period),
    queryFn: () =>
      api.get<DashboardData>(BASE_URL, {
        params: { period },
      }),
    enabled: options?.enabled ?? true,
  });
}

/** @deprecated Prefer `useGetDashboard` */
export const useDashboard = useGetDashboard;
