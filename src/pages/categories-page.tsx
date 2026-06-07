import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { type ColumnDef } from '@tanstack/react-table';
import { Plus, Pencil, RefreshCw, Trash2 } from 'lucide-react';
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
import { useDeleteCategory, useGetCategories } from '@/hooks/api/admin/use-categories';
import { ApiError } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import {
  defaultStatusBadgeClass,
  itemStatusBadgeClass,
} from '@/lib/status-styles';
import type { Category } from '@/types/category-type';
import type { ItemStatus } from '@/types/product-type';

const STATUS_VARIANT = itemStatusBadgeClass;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const filterConfig: DataTableFilterConfig[] = [
  {
    key: 'search',
    type: 'search',
    label: 'Search',
    placeholder: 'Search by name or slug...',
  },
  {
    key: 'status',
    type: 'select',
    label: 'Status',
    placeholder: 'All statuses',
    options: [
      { label: 'Active', value: 'ACTIVE' },
      { label: 'Inactive', value: 'INACTIVE' },
      { label: 'Draft', value: 'DRAFT' },
    ],
  },
];

export function CategoriesPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const statusFilter = filters.status as ItemStatus | undefined;
  const useClientPagination = Boolean(statusFilter);

  const query = useMemo(
    () => ({
      page: useClientPagination ? 1 : pagination.pageIndex + 1,
      limit: useClientPagination ? 100 : pagination.pageSize,
      search: filters.search || undefined,
    }),
    [
      filters.search,
      pagination.pageIndex,
      pagination.pageSize,
      useClientPagination,
    ],
  );

  const { data, isLoading, isError, refetch, isFetching } =
    useGetCategories(query);
  const deleteCategory = useDeleteCategory();

  const tableData = useMemo(() => {
    const rows = data?.data ?? [];
    if (!statusFilter) return rows;
    return rows.filter((row) => row.status === statusFilter);
  }, [data?.data, statusFilter]);

  const paginatedData = useMemo(() => {
    if (!useClientPagination) return tableData;
    const start = pagination.pageIndex * pagination.pageSize;
    return tableData.slice(start, start + pagination.pageSize);
  }, [tableData, useClientPagination, pagination.pageIndex, pagination.pageSize]);

  const pageCount = useClientPagination
    ? Math.ceil(tableData.length / pagination.pageSize) || 0
    : (data?.meta.totalPages ?? 0);

  const columns = useMemo<ColumnDef<Category>[]>(
    () => [
      {
        accessorKey: 'imageUrl',
        header: 'Image',
        cell: ({ row }) => {
          const url = row.original.imageUrl;
          return url ? (
            <img
              src={url}
              alt={row.original.name}
              className="size-10 rounded-sm object-cover ring-1 ring-primary/10"
            />
          ) : (
            <div className="size-10 rounded-sm bg-primary/5 ring-1 ring-primary/10" />
          );
        },
        enableSorting: false,
      },
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Name" />
        ),
        cell: ({ row }) => (
          <button
            type="button"
            onClick={() => navigate(`/categories/${row.original.id}/edit`)}
            className="text-left hover:text-primary"
          >
            <p className="font-medium">{row.original.name}</p>
            <p className="text-xs text-muted-foreground">{row.original.slug}</p>
          </button>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Badge
            className={cn(
              'rounded-full border-0 text-[10px] font-bold uppercase tracking-wider',
              STATUS_VARIANT[row.original.status] ?? defaultStatusBadgeClass,
            )}
          >
            {row.original.status}
          </Badge>
        ),
      },
      {
        accessorKey: 'order',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Order" />
        ),
      },
      {
        accessorKey: 'isFeature',
        header: 'Featured',
        cell: ({ row }) => (row.original.isFeature ? 'Yes' : '—'),
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
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/categories/${row.original.id}/edit`)}
            >
              <Pencil className="size-4" />
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeleteTarget(row.original)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
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
      await deleteCategory.mutateAsync(deleteTarget.id);
      toast.success('Category deleted');
      setDeleteTarget(null);
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'Failed to delete category';
      toast.error(message);
    }
  }

  const totalCount = useClientPagination
    ? tableData.length
    : (data?.meta.total ?? 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
          <p className="text-sm text-muted-foreground">
            Organize products into categories.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isFetching && !isLoading && (
            <RefreshCw className="size-4 animate-spin text-muted-foreground" />
          )}
          <Button
            className="rounded-sm shadow-lg shadow-primary/20"
            onClick={() => navigate('/categories/new')}
          >
            <Plus className="size-4" />
            Add Category
          </Button>
        </div>
      </div>

      {isError ? (
        <Card className="rounded-sm ring-primary/10">
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <p className="text-sm text-muted-foreground">
              Failed to load categories. Please try again.
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
            <CardTitle>All Categories</CardTitle>
            <CardDescription>{totalCount} categories</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={paginatedData}
              filters={filterConfig}
              filterValues={filters}
              onFilterChange={handleFilterChange}
              onFiltersReset={() => {
                setFilters({});
                setPagination((prev) => ({ ...prev, pageIndex: 0 }));
              }}
              isLoading={isLoading}
              emptyMessage="No categories found."
              manualPagination
              pageCount={pageCount}
              pagination={pagination}
              onPaginationChange={setPagination}
            />
            {!isLoading && paginatedData.length === 0 && (
              <div className="mt-4 flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => navigate('/categories/new')}
                >
                  Add your first category
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
            <AlertDialogTitle>Delete category?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{deleteTarget?.name}&quot;. Products
              using this category may be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleDelete()}
              disabled={deleteCategory.isPending}
            >
              {deleteCategory.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
