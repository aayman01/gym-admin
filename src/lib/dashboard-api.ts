import { api } from '@/lib/api';
import type { DashboardData, DashboardPeriod } from '@/types/dashboard.types';

export function getDashboard(period: DashboardPeriod = '30d') {
  return api.get<DashboardData>('/admin/dashboard', {
    params: { period },
  });
}
