import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { type ColumnDef } from '@tanstack/react-table';
import { Plus, Pencil, RefreshCw } from 'lucide-react';
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
import { useGetBrands } from '@/hooks/api/admin/use-brands';
import { cn } from '@/lib/utils';
import {
  defaultStatusBadgeClass,
  itemStatusBadgeClass,
} from '@/lib/status-styles';
import type { Brand } from '@/types/brand-type';
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

export function BrandsPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const query = useMemo(
    () => ({
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      search: filters.search || undefined,
      status: (filters.status as ItemStatus) || undefined,
    }),
    [filters, pagination.pageIndex, pagination.pageSize],
  );

  const { data, isLoading, isError, refetch, isFetching } = useGetBrands(query);

  const columns = useMemo<ColumnDef<Brand>[]>(
    () => [
      {
        accessorKey: 'logoUrl',
        header: 'Logo',
        cell: ({ row }) => {
          const url = row.original.logoUrl;
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
            onClick={() => navigate(`/brands/${row.original.id}/edit`)}
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/brands/${row.original.id}/edit`)}
          >
            <Pencil className="size-4" />
            Edit
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
          <h1 className="text-2xl font-bold tracking-tight">Brands</h1>
          <p className="text-sm text-muted-foreground">
            Manage product brands for your catalog.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isFetching && !isLoading && (
            <RefreshCw className="size-4 animate-spin text-muted-foreground" />
          )}
          <Button
            className="rounded-sm shadow-lg shadow-primary/20"
            onClick={() => navigate('/brands/new')}
          >
            <Plus className="size-4" />
            Add Brand
          </Button>
        </div>
      </div>

      {isError ? (
        <Card className="rounded-sm ring-primary/10">
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <p className="text-sm text-muted-foreground">
              Failed to load brands. Please try again.
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
            <CardTitle>All Brands</CardTitle>
            <CardDescription>{data?.meta.total ?? 0} brands</CardDescription>
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
              emptyMessage="No brands found."
              manualPagination
              pageCount={data?.meta.totalPages ?? 0}
              pagination={pagination}
              onPaginationChange={setPagination}
            />
            {!isLoading && data?.data.length === 0 && (
              <div className="mt-4 flex justify-center">
                <Button variant="outline" onClick={() => navigate('/brands/new')}>
                  Add your first brand
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
