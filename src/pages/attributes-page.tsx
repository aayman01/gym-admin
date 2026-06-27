import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { type ColumnDef } from '@tanstack/react-table';
import { Plus, Pencil, Trash2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { DataTable, DataTableColumnHeader } from '@/components/data-table';
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
import {
  useDeleteProductAttribute,
  useGetProductAttributes,
} from '@/hooks/api/admin/use-product-attributes';
import { ApiError } from '@/lib/api-client';
import type { ProductAttributeListItem } from '@/types/product-attribute-type';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function AttributesPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const query = useMemo(
    () => ({
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      search: filters.search || undefined,
    }),
    [filters, pagination.pageIndex, pagination.pageSize],
  );

  const { data, isLoading, isError, refetch, isFetching } =
    useGetProductAttributes(query);
  const deleteAttr = useDeleteProductAttribute();

  async function handleDelete(id: string) {
    try {
      await deleteAttr.mutateAsync(id);
      toast.success('Attribute deleted');
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : 'Failed to delete attribute';
      toast.error(msg);
    } finally {
      setDeleteId(null);
    }
  }

  const columns = useMemo<ColumnDef<ProductAttributeListItem>[]>(
    () => [
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Name" />
        ),
        cell: ({ row }) => (
          <button
            type="button"
            onClick={() => navigate(`/attributes/${row.original.id}/edit`)}
            className="text-left hover:text-primary"
          >
            <p className="font-medium">{row.original.name}</p>
          </button>
        ),
      },
      {
        accessorKey: 'optionsCount',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Options" />
        ),
        cell: ({ row }) => (
          <Badge variant="secondary" className="rounded-full">
            {row.original.optionsCount}
          </Badge>
        ),
      },
      {
        id: 'optionValues',
        header: 'Values',
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1 max-w-xs">
            {row.original.options.slice(0, 5).map((o) => (
              <Badge
                key={o}
                variant="outline"
                className="rounded-full text-xs"
              >
                {o}
              </Badge>
            ))}
            {row.original.options.length > 5 && (
              <Badge variant="outline" className="rounded-full text-xs">
                +{row.original.options.length - 5} more
              </Badge>
            )}
          </div>
        ),
        enableSorting: false,
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
              onClick={() => navigate(`/attributes/${row.original.id}/edit`)}
            >
              <Pencil className="size-4" />
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => setDeleteId(row.original.id)}
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

  const filterConfig = [
    {
      key: 'search',
      type: 'search' as const,
      label: 'Search',
      placeholder: 'Search by name...',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Attributes</h1>
          <p className="text-sm text-muted-foreground">
            Manage product attributes and their option values.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isFetching && !isLoading && (
            <RefreshCw className="size-4 animate-spin text-muted-foreground" />
          )}
          <Button
            className="rounded-sm shadow-lg shadow-primary/20"
            onClick={() => navigate('/attributes/new')}
          >
            <Plus className="size-4" />
            Add Attribute
          </Button>
        </div>
      </div>

      {isError ? (
        <Card className="rounded-sm ring-primary/10">
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <p className="text-sm text-muted-foreground">
              Failed to load attributes. Please try again.
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
            <CardTitle>All Attributes</CardTitle>
            <CardDescription>
              {data?.meta.total ?? 0} attributes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={data?.data ?? []}
              filters={filterConfig}
              filterValues={filters}
              onFilterChange={(key, value) => {
                setFilters((prev) => ({ ...prev, [key]: value }));
                setPagination((prev) => ({ ...prev, pageIndex: 0 }));
              }}
              onFiltersReset={() => {
                setFilters({});
                setPagination((prev) => ({ ...prev, pageIndex: 0 }));
              }}
              isLoading={isLoading}
              emptyMessage="No attributes found."
              manualPagination
              pageCount={data?.meta.totalPages ?? 0}
              pagination={pagination}
              onPaginationChange={setPagination}
            />
          </CardContent>
        </Card>
      )}

      <AlertDialog open={Boolean(deleteId)} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete attribute?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the attribute and all its options. This
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteId && void handleDelete(deleteId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
