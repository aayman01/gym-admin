import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { DashboardStatCard } from '@/components/dashboard/dashboard-stat-card';
import { DashboardSkeleton } from '@/components/dashboard/dashboard-skeleton';
import { LowStockList } from '@/components/dashboard/low-stock-list';
import { OrdersByStatus } from '@/components/dashboard/orders-by-status';
import { RecentOrdersTable } from '@/components/dashboard/recent-orders-table';
import { RevenueChart } from '@/components/dashboard/revenue-chart';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useGetDashboard } from '@/hooks/api/admin/use-dashboard';
import type { DashboardPeriod } from '@/types/dashboard-type';

const PERIOD_OPTIONS: { value: DashboardPeriod; label: string }[] = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
];

function formatCurrency(value: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(value));
}

function formatCount(value: number) {
  return new Intl.NumberFormat('en-US').format(value);
}

export function DashboardPage() {
  const [period, setPeriod] = useState<DashboardPeriod>('30d');
  const { data, isLoading, isError, refetch, isFetching } =
    useGetDashboard(period);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (isError || !data) {
    return (
      <div className="space-y-6">
        <DashboardHeader
          period={period}
          onPeriodChange={setPeriod}
          isFetching={isFetching}
        />
        <Card className="rounded-sm ring-primary/10">
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <p className="text-sm text-muted-foreground">
              Failed to load dashboard data. Please try again.
            </p>
            <Button onClick={() => refetch()} variant="outline">
              <RefreshCw className="size-4" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { stats, revenueChart, ordersByStatus, recentOrders, lowStockAlerts } =
    data;

  return (
    <div className="space-y-6">
      <DashboardHeader
        period={period}
        onPeriodChange={setPeriod}
        isFetching={isFetching}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardStatCard
          title="Revenue"
          value={formatCurrency(stats.totalRevenue)}
          changePercent={stats.revenueChangePercent}
          subtitle="vs previous period"
        />
        <DashboardStatCard
          title="Orders"
          value={formatCount(stats.totalOrders)}
          changePercent={stats.ordersChangePercent}
          subtitle="vs previous period"
        />
        <DashboardStatCard
          title="Products"
          value={formatCount(stats.totalProducts)}
          changePercent={stats.productsChangePercent}
          subtitle="new this period"
        />
        <DashboardStatCard
          title="Customers"
          value={formatCount(stats.totalCustomers)}
          changePercent={stats.customersChangePercent}
          subtitle="new this period"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="rounded-sm ring-primary/10 xl:col-span-2">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>
              Daily revenue for the selected period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RevenueChart data={revenueChart} />
          </CardContent>
        </Card>

        <Card className="rounded-sm ring-primary/10">
          <CardHeader>
            <CardTitle>Orders by Status</CardTitle>
            <CardDescription>All-time order distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <OrdersByStatus data={ordersByStatus} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card className="rounded-sm ring-primary/10">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest 8 orders across the store</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentOrdersTable orders={recentOrders} />
          </CardContent>
        </Card>

        <Card className="rounded-sm ring-primary/10">
          <CardHeader>
            <CardTitle>Low Stock Alerts</CardTitle>
            <CardDescription>
              Variants at or below their threshold
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LowStockList items={lowStockAlerts} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DashboardHeader({
  period,
  onPeriodChange,
  isFetching,
}: {
  period: DashboardPeriod;
  onPeriodChange: (period: DashboardPeriod) => void;
  isFetching: boolean;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Business Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Store performance metrics and operational insights.
        </p>
      </div>
      <div className="flex items-center gap-2">
        {isFetching && (
          <RefreshCw className="size-4 animate-spin text-muted-foreground" />
        )}
        <Select
          value={period}
          onValueChange={(value) => onPeriodChange(value as DashboardPeriod)}
        >
          <SelectTrigger className="w-[160px] rounded-sm bg-primary/5 ring-1 ring-primary/10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PERIOD_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
