import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { type ColumnDef } from '@tanstack/react-table';
import {
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCw,
  Star,
  StarOff,
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
  useActivateTax,
  useDeactivateTax,
  useDeleteTax,
  useGetTaxes,
  useSetDefaultTax,
  useUnsetDefaultTax,
} from '@/hooks/api/admin/use-taxes';
import { ApiError } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import {
  defaultStatusBadgeClass,
  itemStatusBadgeClass,
} from '@/lib/status-styles';
import type { Tax } from '@/types/tax-type';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatRate(tax: Tax) {
  const rate = Number(tax.rate);
  if (tax.type === 'PERCENTAGE') {
    return `${rate}%`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(rate);
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

type TaxRowActionsProps = {
  tax: Tax;
  onDelete: (tax: Tax) => void;
};

function TaxRowActions({ tax, onDelete }: TaxRowActionsProps) {
  const navigate = useNavigate();
  const setDefault = useSetDefaultTax();
  const unsetDefault = useUnsetDefaultTax();
  const activate = useActivateTax();
  const deactivate = useDeactivateTax();

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

  const isBusy =
    setDefault.isPending ||
    unsetDefault.isPending ||
    activate.isPending ||
    deactivate.isPending;

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
          onClick={() => navigate(`/taxes/${tax.id}/edit`)}
        >
          <Pencil className="size-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {tax.isDefault ? (
          <DropdownMenuItem
            onClick={() =>
              void runAction(
                () => unsetDefault.mutateAsync(tax.id),
                'Default tax unset',
                'Failed to unset default tax',
              )
            }
          >
            <StarOff className="size-4" />
            Unset default
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            disabled={!tax.isActive}
            onClick={() =>
              void runAction(
                () => setDefault.mutateAsync(tax.id),
                'Default tax updated',
                'Failed to set default tax',
              )
            }
          >
            <Star className="size-4" />
            Set as default
          </DropdownMenuItem>
        )}
        {tax.isActive ? (
          <DropdownMenuItem
            disabled={tax.isDefault}
            onClick={() =>
              void runAction(
                () => deactivate.mutateAsync(tax.id),
                'Tax deactivated',
                'Failed to deactivate tax',
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
                () => activate.mutateAsync(tax.id),
                'Tax activated',
                'Failed to activate tax',
              )
            }
          >
            <ToggleRight className="size-4" />
            Activate
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          disabled={tax.isDefault}
          onClick={() => onDelete(tax)}
        >
          <Trash2 className="size-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function TaxesPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [deleteTarget, setDeleteTarget] = useState<Tax | null>(null);

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

  const { data, isLoading, isError, refetch, isFetching } = useGetTaxes(query);
  const deleteTax = useDeleteTax();

  const columns = useMemo<ColumnDef<Tax>[]>(
    () => [
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Name" />
        ),
        cell: ({ row }) => (
          <button
            type="button"
            onClick={() => navigate(`/taxes/${row.original.id}/edit`)}
            className="text-left font-medium hover:text-primary"
          >
            {row.original.name}
          </button>
        ),
      },
      {
        id: 'rate',
        header: 'Rate',
        cell: ({ row }) => formatRate(row.original),
      },
      {
        accessorKey: 'type',
        header: 'Type',
        cell: ({ row }) => (
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            {row.original.type}
          </span>
        ),
      },
      {
        accessorKey: 'isDefault',
        header: 'Default',
        cell: ({ row }) =>
          row.original.isDefault ? (
            <Badge className="rounded-full border-0 bg-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider">
              Default
            </Badge>
          ) : (
            '—'
          ),
      },
      {
        accessorKey: 'isActive',
        header: 'Active',
        cell: ({ row }) => (
          <Badge
            className={cn(
              'rounded-full border-0 text-[10px] font-bold uppercase tracking-wider',
              row.original.isActive
                ? (itemStatusBadgeClass.ACTIVE ?? defaultStatusBadgeClass)
                : (itemStatusBadgeClass.INACTIVE ?? defaultStatusBadgeClass),
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
          <TaxRowActions tax={row.original} onDelete={setDeleteTarget} />
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
      await deleteTax.mutateAsync(deleteTarget.id);
      toast.success('Tax deleted');
      setDeleteTarget(null);
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'Failed to delete tax';
      toast.error(message);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Taxes</h1>
          <p className="text-sm text-muted-foreground">
            Manage tax rates applied to products.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isFetching && !isLoading && (
            <RefreshCw className="size-4 animate-spin text-muted-foreground" />
          )}
          <Button
            className="rounded-sm shadow-lg shadow-primary/20"
            onClick={() => navigate('/taxes/new')}
          >
            <Plus className="size-4" />
            Add Tax
          </Button>
        </div>
      </div>

      {isError ? (
        <Card className="rounded-sm ring-primary/10">
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <p className="text-sm text-muted-foreground">
              Failed to load taxes. Please try again.
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
            <CardTitle>All Taxes</CardTitle>
            <CardDescription>{data?.meta.total ?? 0} taxes</CardDescription>
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
              emptyMessage="No taxes found."
              manualPagination
              pageCount={data?.meta.totalPages ?? 0}
              pagination={pagination}
              onPaginationChange={setPagination}
            />
            {!isLoading && data?.data.length === 0 && (
              <div className="mt-4 flex justify-center">
                <Button variant="outline" onClick={() => navigate('/taxes/new')}>
                  Add your first tax
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
            <AlertDialogTitle>Delete tax?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.isDefault
                ? 'Default taxes cannot be deleted. Unset default first.'
                : `This will permanently delete "${deleteTarget?.name}".`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleDelete()}
              disabled={deleteTax.isPending || deleteTarget?.isDefault}
            >
              {deleteTax.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
