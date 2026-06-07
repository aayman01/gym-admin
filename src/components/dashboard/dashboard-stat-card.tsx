import { cn } from '@/lib/utils';
import { trendBadgeClass } from '@/lib/status-styles';
import { TrendingDown, TrendingUp } from 'lucide-react';

interface DashboardStatCardProps {
  title: string;
  value: string;
  changePercent: number | null;
  subtitle?: string;
}

function formatChange(value: number | null): string {
  if (value === null) return '—';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

export function DashboardStatCard({
  title,
  value,
  changePercent,
  subtitle,
}: DashboardStatCardProps) {
  const isPositive = changePercent !== null && changePercent >= 0;
  const isNegative = changePercent !== null && changePercent < 0;

  return (
    <div className="rounded-sm bg-card p-4 ring-1 ring-primary/10 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
      <div className="mt-2 flex items-center gap-2">
        {changePercent !== null && (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
              isPositive && trendBadgeClass.positive,
              isNegative && trendBadgeClass.negative,
            )}
          >
            {isPositive && <TrendingUp className="size-3" />}
            {isNegative && <TrendingDown className="size-3" />}
            {formatChange(changePercent)}
          </span>
        )}
        {changePercent === null && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            No prior data
          </span>
        )}
        {subtitle && (
          <span className="text-xs text-muted-foreground">{subtitle}</span>
        )}
      </div>
    </div>
  );
}
