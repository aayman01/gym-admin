import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { RevenueChartPoint } from '@/types/dashboard-type';

interface RevenueChartProps {
  data: RevenueChartPoint[];
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatAxisDate(date: string) {
  const d = new Date(`${date}T00:00:00`);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function RevenueChart({ data }: RevenueChartProps) {
  const chartData = data.map((point) => ({
    ...point,
    revenueNum: Number(point.revenue),
  }));

  const hasData = chartData.some((point) => point.revenueNum > 0);

  if (!hasData) {
    return (
      <div className="flex h-[280px] items-center justify-center rounded-sm bg-primary/5 text-sm text-muted-foreground">
        No revenue recorded for this period.
      </div>
    );
  }

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={formatAxisDate}
            tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            minTickGap={24}
          />
          <YAxis
            tickFormatter={(v) => formatCurrency(v)}
            tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={72}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--card)',
              border: '1px solid var(--chart-tooltip-border)',
              borderRadius: '2px',
              fontSize: '12px',
              color: 'var(--foreground)',
            }}
            labelFormatter={(label) => formatAxisDate(String(label))}
            formatter={(value, name) => {
              if (name === 'revenueNum') {
                return [formatCurrency(Number(value)), 'Revenue'];
              }
              return [value, 'Orders'];
            }}
          />
          <Area
            type="monotone"
            dataKey="revenueNum"
            stroke="var(--primary)"
            strokeWidth={2}
            fill="url(#revenueGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
