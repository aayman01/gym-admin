import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import {
  defaultStatusBadgeClass,
  orderStatusBadgeClass,
  paymentStatusBadgeClass,
} from '@/lib/status-styles';
import type { RecentOrder } from '@/types/dashboard-type';

const STATUS_VARIANT = orderStatusBadgeClass;
const PAYMENT_VARIANT = paymentStatusBadgeClass;

interface RecentOrdersTableProps {
  orders: RecentOrder[];
}

function formatCurrency(value: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(value));
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function RecentOrdersTable({ orders }: RecentOrdersTableProps) {
  if (orders.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        No recent orders.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-primary/10 hover:bg-transparent">
          <TableHead>Order</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Payment</TableHead>
          <TableHead className="text-right">Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow
            key={order.id}
            className="border-primary/10 hover:bg-primary/5"
          >
            <TableCell>
              <div className="font-medium">{order.orderNumber}</div>
              <div className="text-xs text-muted-foreground">
                {formatDate(order.createdAt)}
              </div>
            </TableCell>
            <TableCell className="max-w-[140px] truncate">
              {order.customerName}
            </TableCell>
            <TableCell>
              <Badge
                className={cn(
                  'rounded-full border-0 text-[10px] font-bold uppercase tracking-wider',
                  STATUS_VARIANT[order.status] ?? defaultStatusBadgeClass,
                )}
              >
                {order.status}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge
                className={cn(
                  'rounded-full border-0 text-[10px] font-bold uppercase tracking-wider',
                  PAYMENT_VARIANT[order.paymentStatus] ??
                    defaultStatusBadgeClass,
                )}
              >
                {order.paymentStatus.replace(/_/g, ' ')}
              </Badge>
            </TableCell>
            <TableCell className="text-right font-medium tabular-nums">
              {formatCurrency(order.totalAmount)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
