import { useQuery } from '@tanstack/react-query';
import { getDashboard } from '@/lib/dashboard-api';
import type { DashboardPeriod } from '@/types/dashboard.types';

export function useDashboard(period: DashboardPeriod) {
  return useQuery({
    queryKey: ['dashboard', period],
    queryFn: () => getDashboard(period),
  });
}
