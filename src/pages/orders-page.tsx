import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { type ColumnDef } from '@tanstack/react-table';
import { Eye, RefreshCw } from 'lucide-react';
import { DataTable, DataTableColumnHeader } from '@/components/data-table';
import type { DataTableFilterConfig } from '@/components/data-table/data-table.types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useGetOrders } from '@/hooks/api/admin/use-orders';
import {
  defaultStatusBadgeClass,
  orderStatusBadgeClass,
  paymentStatusBadgeClass,
} from '@/lib/status-styles';
import { cn } from '@/lib/utils';
import {
  ORDER_STATUS_OPTIONS,
  type Order,
  type OrderStatus,
} from '@/types/order-type';

function formatCurrency(value: string, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
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

function formatCustomerName(order: Order) {
  const name = [order.customer.firstName, order.customer.lastName]
    .filter(Boolean)
    .join(' ')
    .trim();
  return name || order.customer.email;
}

const filterConfig: DataTableFilterConfig[] = [
  {
    key: 'search',
    type: 'search',
    label: 'Search',
    placeholder: 'Order number or customer email...',
  },
  {
    key: 'status',
    type: 'select',
    label: 'Status',
    placeholder: 'All',
    options: ORDER_STATUS_OPTIONS.map((option) => ({
      label: option.label,
      value: option.value,
    })),
  },
];

export function OrdersPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });

  const query = useMemo(
    () => ({
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      search: filters.search || undefined,
      status: (filters.status as OrderStatus | undefined) || undefined,
    }),
    [filters, pagination.pageIndex, pagination.pageSize],
  );

  const { data, isLoading, isError, refetch, isFetching } = useGetOrders(query);

  const columns = useMemo<ColumnDef<Order>[]>(
    () => [
      {
        accessorKey: 'orderNumber',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Order" />
        ),
        cell: ({ row }) => (
          <button
            type="button"
            onClick={() => navigate(`/orders/${row.original.id}`)}
            className="text-left"
          >
            <div className="font-medium hover:text-primary">
              {row.original.orderNumber}
            </div>
            <div className="text-xs text-muted-foreground">
              {formatDate(row.original.createdAt)}
            </div>
          </button>
        ),
      },
      {
        id: 'customer',
        header: 'Customer',
        cell: ({ row }) => (
          <span className="max-w-[180px] truncate">
            {formatCustomerName(row.original)}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Badge
            className={cn(
              'rounded-full border-0 text-[10px] font-bold uppercase tracking-wider',
              orderStatusBadgeClass[row.original.status] ??
                defaultStatusBadgeClass,
            )}
          >
            {row.original.status}
          </Badge>
        ),
      },
      {
        accessorKey: 'paymentStatus',
        header: 'Payment',
        cell: ({ row }) => (
          <Badge
            className={cn(
              'rounded-full border-0 text-[10px] font-bold uppercase tracking-wider',
              paymentStatusBadgeClass[row.original.paymentStatus] ??
                defaultStatusBadgeClass,
            )}
          >
            {row.original.paymentStatus.replace(/_/g, ' ')}
          </Badge>
        ),
      },
      {
        accessorKey: 'totalAmount',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Total" />
        ),
        cell: ({ row }) => (
          <span className="font-medium tabular-nums">
            {formatCurrency(row.original.totalAmount, row.original.currency)}
          </span>
        ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/orders/${row.original.id}`)}
          >
            <Eye className="size-4" />
            View
          </Button>
        ),
        enableSorting: false,
      },
    ],
    [navigate],
  );

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
          <p className="text-sm text-muted-foreground">
            View and manage customer orders.
          </p>
        </div>
        {isFetching && !isLoading ? (
          <RefreshCw className="size-4 animate-spin text-muted-foreground" />
        ) : null}
      </div>

      {isError ? (
        <Card className="rounded-sm ring-primary/10">
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <p className="text-sm text-muted-foreground">
              Failed to load orders. Please try again.
            </p>
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="size-4" />
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="rounded-sm ring-primary/10">
          <CardHeader>
            <CardTitle>All Orders</CardTitle>
            <CardDescription>{data?.meta.total ?? 0} orders</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={data?.data ?? []}
              filters={filterConfig}
              filterValues={filters}
              onFilterChange={handleFilterChange}
              onFiltersReset={() => {
                setFilters({});
                setPagination((prev) => ({ ...prev, pageIndex: 0 }));
              }}
              isLoading={isLoading}
              emptyMessage="No orders found."
              manualPagination
              pageCount={data?.meta.totalPages ?? 0}
              pagination={pagination}
              onPaginationChange={setPagination}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
