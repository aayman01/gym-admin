import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { type ColumnDef } from '@tanstack/react-table';
import { Plus, Pencil, Archive, RotateCcw, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
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
import { cn } from '@/lib/utils';
import {
  defaultStatusBadgeClass,
  itemStatusBadgeClass,
} from '@/lib/status-styles';
import {
  useArchiveProduct,
  useGetProducts,
  useRestoreProduct,
} from '@/hooks/api/admin/use-products';
import { ApiError } from '@/lib/api-client';
import type { ItemStatus, Product, ProductType } from '@/types/product-type';

const STATUS_VARIANT = itemStatusBadgeClass;

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
    year: 'numeric',
  });
}

type ArchiveView = 'active' | 'archived' | 'all';

export function ProductsPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [archiveView, setArchiveView] = useState<ArchiveView>('active');
  const [confirmArchiveId, setConfirmArchiveId] = useState<string | null>(null);

  const archiveProduct = useArchiveProduct();
  const restoreProduct = useRestoreProduct();

  const query = useMemo(
    () => ({
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      search: filters.search || undefined,
      status: (filters.status as ItemStatus) || undefined,
      type: (filters.type as ProductType) || undefined,
      archivedOnly: archiveView === 'archived' ? true : undefined,
      includeArchived: archiveView === 'all' ? true : undefined,
    }),
    [filters, pagination.pageIndex, pagination.pageSize, archiveView],
  );

  const { data, isLoading, isError, refetch, isFetching } = useGetProducts(query);

  async function handleArchive(productId: string) {
    try {
      await archiveProduct.mutateAsync(productId);
      toast.success('Product archived');
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to archive product';
      toast.error(msg);
    } finally {
      setConfirmArchiveId(null);
    }
  }

  async function handleRestore(productId: string) {
    try {
      await restoreProduct.mutateAsync(productId);
      toast.success('Product restored');
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to restore product';
      toast.error(msg);
    }
  }

  const filterConfig: DataTableFilterConfig[] = [
    {
      key: 'search',
      type: 'search',
      label: 'Search',
      placeholder: 'Search by title or slug...',
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
    {
      key: 'type',
      type: 'select',
      label: 'Type',
      placeholder: 'All types',
      options: [
        { label: 'Physical', value: 'PHYSICAL' },
        { label: 'Digital', value: 'DIGITAL' },
        { label: 'Service', value: 'SERVICE' },
      ],
    },
  ];

  const columns = useMemo<ColumnDef<Product>[]>(
    () => [
      {
        accessorKey: 'thumbnail',
        header: 'Image',
        cell: ({ row }) => {
          const url = row.original.thumbnail?.url;
          return url ? (
            <img
              src={url}
              alt={row.original.title}
              className="size-10 rounded-sm object-cover ring-1 ring-primary/10"
            />
          ) : (
            <div className="size-10 rounded-sm bg-primary/5 ring-1 ring-primary/10" />
          );
        },
        enableSorting: false,
      },
      {
        accessorKey: 'title',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Title" />
        ),
        cell: ({ row }) => (
          <div>
            <button
              type="button"
              onClick={() => navigate(`/products/${row.original.id}/edit`)}
              className="text-left hover:text-primary"
            >
              <p className="font-medium">{row.original.title}</p>
              <p className="text-xs text-muted-foreground">{row.original.slug}</p>
            </button>
            {row.original.deletedAt && (
              <Badge className="mt-1 rounded-full border-0 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-wider dark:bg-gray-800 dark:text-gray-400">
                Archived
              </Badge>
            )}
          </div>
        ),
      },
      {
        id: 'category',
        header: 'Category',
        cell: ({ row }) => row.original.category.name,
      },
      {
        id: 'brand',
        header: 'Brand',
        cell: ({ row }) => row.original.brand?.name ?? '—',
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
        accessorKey: 'basePrice',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Base Price" />
        ),
        cell: ({ row }) => formatCurrency(row.original.basePrice),
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
        cell: ({ row }) => {
          const isArchived = Boolean(row.original.deletedAt);
          return (
            <div className="flex items-center gap-1">
              {!isArchived && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/products/${row.original.id}/edit`)}
                >
                  <Pencil className="size-4" />
                  Edit
                </Button>
              )}
              {isArchived ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => void handleRestore(row.original.id)}
                  disabled={restoreProduct.isPending}
                >
                  <RotateCcw className="size-4" />
                  Restore
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => setConfirmArchiveId(row.original.id)}
                >
                  <Archive className="size-4" />
                </Button>
              )}
            </div>
          );
        },
        enableSorting: false,
      },
    ],
    [navigate, restoreProduct.isPending],
  );

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground">
            Manage your catalog, inventory, and product details.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isFetching && !isLoading && (
            <RefreshCw className="size-4 animate-spin text-muted-foreground" />
          )}
          <Button
            className="rounded-sm shadow-lg shadow-primary/20"
            onClick={() => navigate('/products/new')}
          >
            <Plus className="size-4" />
            Add Product
          </Button>
        </div>
      </div>

      <div className="flex gap-2">
        {(['active', 'archived', 'all'] as ArchiveView[]).map((v) => (
          <Button
            key={v}
            variant={archiveView === v ? 'default' : 'outline'}
            size="sm"
            className="rounded-sm capitalize"
            onClick={() => {
              setArchiveView(v);
              setPagination((prev) => ({ ...prev, pageIndex: 0 }));
            }}
          >
            {v}
          </Button>
        ))}
      </div>

      {isError ? (
        <Card className="rounded-sm ring-primary/10">
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <p className="text-sm text-muted-foreground">
              Failed to load products. Please try again.
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
            <CardTitle>
              {archiveView === 'archived' ? 'Archived Products' : 'Products'}
            </CardTitle>
            <CardDescription>
              {data?.meta.total ?? 0} products
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
              emptyMessage="No products found."
              manualPagination
              pageCount={data?.meta.totalPages ?? 0}
              pagination={pagination}
              onPaginationChange={setPagination}
            />
            {!isLoading && data?.data.length === 0 && archiveView === 'active' && (
              <div className="mt-4 flex justify-center">
                <Button variant="outline" onClick={() => navigate('/products/new')}>
                  Add your first product
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <AlertDialog
        open={Boolean(confirmArchiveId)}
        onOpenChange={() => setConfirmArchiveId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive product?</AlertDialogTitle>
            <AlertDialogDescription>
              This will hide the product from the storefront and active admin
              lists. You can restore it later from the Archived view.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => confirmArchiveId && void handleArchive(confirmArchiveId)}
            >
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
