import { cn } from '@/lib/utils';
import type { OrderStatusCount } from '@/types/dashboard-type';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-500/20 text-amber-400',
  CONFIRMED: 'bg-blue-500/20 text-blue-400',
  PROCESSING: 'bg-yellow-500/20 text-yellow-400',
  SHIPPED: 'bg-indigo-500/20 text-indigo-400',
  DELIVERED: 'bg-emerald-500/20 text-emerald-400',
  CANCELLED: 'bg-destructive/20 text-destructive',
  REFUNDED: 'bg-muted text-muted-foreground',
};

interface OrdersByStatusProps {
  data: OrderStatusCount[];
}

export function OrdersByStatus({ data }: OrdersByStatusProps) {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  if (total === 0) {
    return (
      <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
        No orders yet.
      </div>
    );
  }

  const sorted = [...data].sort((a, b) => b.count - a.count);

  return (
    <div className="flex h-[280px] flex-col gap-3 overflow-y-auto pr-1">
      {sorted.map((item) => {
        const pct = total > 0 ? (item.count / total) * 100 : 0;
        return (
          <div key={item.status} className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span
                className={cn(
                  'inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                  STATUS_COLORS[item.status] ?? 'bg-primary/20 text-primary',
                )}
              >
                {item.status.replace(/_/g, ' ')}
              </span>
              <span className="text-xs font-medium tabular-nums">
                {item.count}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-sm bg-primary/10">
              <div
                className="h-full rounded-sm bg-primary transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
