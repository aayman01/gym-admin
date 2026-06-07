import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { type ColumnDef } from '@tanstack/react-table';
import {
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { DataTable, DataTableColumnHeader } from '@/components/data-table';
import type { DataTableFilterConfig } from '@/components/data-table/data-table.types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  useActivateShippingMethod,
  useDeactivateShippingMethod,
  useDeleteShippingMethod,
  useGetShippingMethods,
} from '@/hooks/api/admin/use-shipping-methods';
import { ApiError } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import { itemStatusBadgeClass } from '@/lib/status-styles';
import type { ShippingMethod } from '@/types/shipping-method-type';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatPrice(value: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(value));
}

const filterConfig: DataTableFilterConfig[] = [
  {
    key: 'search',
    type: 'search',
    label: 'Search',
    placeholder: 'Search by name...',
  },
  {
    key: 'isActive',
    type: 'select',
    label: 'Active',
    placeholder: 'All',
    options: [
      { label: 'Active', value: 'true' },
      { label: 'Inactive', value: 'false' },
    ],
  },
];

type ShippingRowActionsProps = {
  method: ShippingMethod;
  onDelete: (method: ShippingMethod) => void;
};

function ShippingRowActions({ method, onDelete }: ShippingRowActionsProps) {
  const navigate = useNavigate();
  const activate = useActivateShippingMethod();
  const deactivate = useDeactivateShippingMethod();

  async function runAction(
    action: () => Promise<unknown>,
    successMessage: string,
    errorFallback: string,
  ) {
    try {
      await action();
      toast.success(successMessage);
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : errorFallback;
      toast.error(message);
    }
  }

  const isBusy = activate.isPending || deactivate.isPending;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="sm" disabled={isBusy}>
            <MoreHorizontal className="size-4" />
            Actions
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => navigate(`/shipping/${method.id}/edit`)}
        >
          <Pencil className="size-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {method.isActive ? (
          <DropdownMenuItem
            onClick={() =>
              void runAction(
                () => deactivate.mutateAsync(method.id),
                'Shipping method deactivated',
                'Failed to deactivate shipping method',
              )
            }
          >
            <ToggleLeft className="size-4" />
            Deactivate
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            onClick={() =>
              void runAction(
                () => activate.mutateAsync(method.id),
                'Shipping method activated',
                'Failed to activate shipping method',
              )
            }
          >
            <ToggleRight className="size-4" />
            Activate
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={() => onDelete(method)}>
          <Trash2 className="size-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ShippingPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [deleteTarget, setDeleteTarget] = useState<ShippingMethod | null>(null);

  const query = useMemo(
    () => ({
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      search: filters.search || undefined,
      isActive:
        filters.isActive === 'true'
          ? true
          : filters.isActive === 'false'
            ? false
            : undefined,
    }),
    [filters, pagination.pageIndex, pagination.pageSize],
  );

  const { data, isLoading, isError, refetch, isFetching } =
    useGetShippingMethods(query);
  const deleteShippingMethod = useDeleteShippingMethod();

  const columns = useMemo<ColumnDef<ShippingMethod>[]>(
    () => [
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Name" />
        ),
        cell: ({ row }) => (
          <button
            type="button"
            onClick={() => navigate(`/shipping/${row.original.id}/edit`)}
            className="text-left font-medium hover:text-primary"
          >
            {row.original.name}
          </button>
        ),
      },
      {
        id: 'price',
        header: 'Price',
        cell: ({ row }) => formatPrice(row.original.price),
      },
      {
        accessorKey: 'deliveryDays',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Delivery Days" />
        ),
        cell: ({ row }) =>
          row.original.deliveryDays === 1
            ? '1 day'
            : `${row.original.deliveryDays} days`,
      },
      {
        accessorKey: 'isActive',
        header: 'Active',
        cell: ({ row }) => (
          <Badge
            className={cn(
              'rounded-full border-0 text-[10px] font-bold uppercase tracking-wider',
              row.original.isActive
                ? itemStatusBadgeClass.ACTIVE
                : itemStatusBadgeClass.INACTIVE,
            )}
          >
            {row.original.isActive ? 'Active' : 'Inactive'}
          </Badge>
        ),
      },
      {
        accessorKey: 'updatedAt',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Updated" />
        ),
        cell: ({ row }) => formatDate(row.original.updatedAt),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <ShippingRowActions
            method={row.original}
            onDelete={setDeleteTarget}
          />
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

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteShippingMethod.mutateAsync(deleteTarget.id);
      toast.success('Shipping method deleted');
      setDeleteTarget(null);
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : 'Failed to delete shipping method';
      toast.error(message);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Shipping</h1>
          <p className="text-sm text-muted-foreground">
            Manage shipping methods and rates for checkout.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isFetching && !isLoading && (
            <RefreshCw className="size-4 animate-spin text-muted-foreground" />
          )}
          <Button
            className="rounded-sm shadow-lg shadow-primary/20"
            onClick={() => navigate('/shipping/new')}
          >
            <Plus className="size-4" />
            Add Shipping Method
          </Button>
        </div>
      </div>

      {isError ? (
        <Card className="rounded-sm ring-primary/10">
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <p className="text-sm text-muted-foreground">
              Failed to load shipping methods. Please try again.
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
            <CardTitle>All Shipping Methods</CardTitle>
            <CardDescription>
              {data?.meta.total ?? 0} shipping methods
            </CardDescription>
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
              emptyMessage="No shipping methods found."
              manualPagination
              pageCount={data?.meta.totalPages ?? 0}
              pagination={pagination}
              onPaginationChange={setPagination}
            />
            {!isLoading && data?.data.length === 0 && (
              <div className="mt-4 flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => navigate('/shipping/new')}
                >
                  Add your first shipping method
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete shipping method?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{deleteTarget?.name}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleDelete()}
              disabled={deleteShippingMethod.isPending}
            >
              {deleteShippingMethod.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
