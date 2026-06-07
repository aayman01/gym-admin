import { AlertTriangle } from 'lucide-react';
import type { LowStockAlert } from '@/types/dashboard-type';

interface LowStockListProps {
  items: LowStockAlert[];
}

export function LowStockList({ items }: LowStockListProps) {
  if (items.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        All products are above their low-stock thresholds.
      </div>
    );
  }

  return (
    <ul className="divide-y divide-primary/10">
      {items.map((item) => (
        <li
          key={`${item.productId}-${item.variantSku}`}
          className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"
        >
          <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-sm bg-destructive/10 text-destructive">
            <AlertTriangle className="size-3.5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{item.productTitle}</p>
            <p className="text-xs text-muted-foreground">SKU: {item.variantSku}</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-sm font-bold tabular-nums text-destructive">
              {item.availableStock}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              / {item.lowStockThreshold} min
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
