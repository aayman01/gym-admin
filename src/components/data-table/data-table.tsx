import { useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
  type PaginationState,
} from '@tanstack/react-table';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar';
import { DataTablePagination } from '@/components/data-table/data-table-pagination';
import type { DataTableProps } from '@/components/data-table/data-table.types';

/**
 * Generic data table powered by TanStack Table.
 *
 * @example
 * <DataTable
 *   columns={columns}
 *   data={rows}
 *   filters={filterConfig}
 *   filterValues={filters}
 *   onFilterChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))}
 *   onFiltersReset={() => setFilters({})}
 * />
 */
export function DataTable<TData>({
  columns,
  data,
  filters,
  filterValues,
  onFilterChange,
  onFiltersReset,
  isLoading = false,
  emptyMessage = 'No results found.',
  manualPagination = false,
  pageCount,
  pagination: controlledPagination,
  onPaginationChange,
  manualSorting = false,
  sorting: controlledSorting,
  onSortingChange,
}: DataTableProps<TData>) {
  const [internalSorting, setInternalSorting] = useState<SortingState>([]);
  const [internalPagination, setInternalPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const sorting = controlledSorting ?? internalSorting;
  const pagination = controlledPagination ?? internalPagination;

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      pagination,
    },
    onSortingChange: onSortingChange ?? setInternalSorting,
    onPaginationChange: onPaginationChange ?? setInternalPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: manualSorting ? undefined : getSortedRowModel(),
    getPaginationRowModel: manualPagination ? undefined : getPaginationRowModel(),
    manualPagination,
    manualSorting,
    pageCount: manualPagination ? pageCount : undefined,
  });

  const columnCount = table.getVisibleLeafColumns().length;
  const skeletonRows = Array.from({ length: pagination.pageSize }, (_, index) => index);

  return (
    <div className="space-y-4">
      <DataTableToolbar
        filters={filters}
        filterValues={filterValues}
        onFilterChange={onFilterChange}
        onFiltersReset={onFiltersReset}
      />

      <div className="overflow-hidden rounded-sm bg-card ring-1 ring-primary/10">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="border-primary/10 hover:bg-transparent"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="h-11 px-3">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {isLoading
              ? skeletonRows.map((row) => (
                  <TableRow key={row} className="border-primary/10">
                    {Array.from({ length: columnCount }, (_, cell) => (
                      <TableCell key={cell} className="px-3 py-3">
                        <Skeleton className="h-4 w-full max-w-40 rounded-sm" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : null}

            {!isLoading && table.getRowModel().rows.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={columnCount}
                  className="h-24 px-3 text-center text-sm text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : null}

            {!isLoading
              ? table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className={cn('border-primary/10 hover:bg-primary/5')}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="px-3 py-3">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : null}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} />
    </div>
  );
}
