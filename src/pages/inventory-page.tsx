import { useMemo, useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import {
  AlertTriangle,
  ArrowDownCircle,
  ArrowUpCircle,
  ClipboardList,
  RefreshCw,
} from 'lucide-react';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  useAdjustInventory,
  useGetInventory,
  useGetInventoryTransactions,
} from '@/hooks/api/admin/use-inventory';
import { ApiError } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import type { AdjustInventoryPayload, InventoryRow } from '@/types/inventory-type';

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const filterConfig: DataTableFilterConfig[] = [
  {
    key: 'search',
    type: 'search',
    label: 'Search',
    placeholder: 'Search by product or SKU...',
  },
  {
    key: 'lowStockOnly',
    type: 'select',
    label: 'Stock',
    placeholder: 'All',
    options: [{ label: 'Low stock only', value: 'true' }],
  },
];

function TransactionHistorySheet({
  variantId,
  open,
  onClose,
}: {
  variantId: string;
  open: boolean;
  onClose: () => void;
}) {
  const { data, isLoading } = useGetInventoryTransactions(variantId, {
    enabled: open && Boolean(variantId),
  });

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            Transaction History
            {data ? ` — ${data.variant.sku}` : ''}
          </SheetTitle>
          <SheetDescription>
            {data
              ? `${data.variant.product.title} · On hand: ${data.variant.quantityOnHand} · Reserved: ${data.variant.quantityReserved}`
              : 'Loading...'}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-2">
          {isLoading && (
            <div className="flex items-center gap-2 text-muted-foreground text-sm py-4">
              <RefreshCw className="size-4 animate-spin" /> Loading...
            </div>
          )}
          {!isLoading && data?.transactions.length === 0 && (
            <p className="text-sm text-muted-foreground py-4">No transactions recorded yet.</p>
          )}
          {!isLoading &&
            data?.transactions.map((t) => {
              const isIn = t.movementDirection === 'IN';
              return (
                <div
                  key={t.id}
                  className="flex items-start justify-between rounded-sm border border-border/50 px-3 py-2 text-sm"
                >
                  <div className="flex items-center gap-2">
                    {isIn ? (
                      <ArrowUpCircle className="size-4 text-emerald-500 shrink-0" />
                    ) : (
                      <ArrowDownCircle className="size-4 text-rose-500 shrink-0" />
                    )}
                    <div>
                      <p className="font-medium">{t.type.replace(/_/g, ' ')}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(t.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={cn(
                        'font-semibold tabular-nums',
                        isIn ? 'text-emerald-600' : 'text-rose-600',
                      )}
                    >
                      {isIn ? '+' : ''}{t.quantityChange}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      → {t.resultingQuantity}
                    </p>
                  </div>
                </div>
              );
            })}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function AdjustStockDialog({
  row,
  open,
  onClose,
}: {
  row: InventoryRow;
  open: boolean;
  onClose: () => void;
}) {
  const [type, setType] = useState<'STOCK_IN' | 'STOCK_OUT'>('STOCK_IN');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const adjustInv = useAdjustInventory();

  async function handleSubmit() {
    const qty = parseInt(quantity, 10);
    if (!qty || qty <= 0) {
      toast.error('Enter a valid positive quantity');
      return;
    }
    try {
      const result = await adjustInv.mutateAsync({
        variantId: row.variantId,
        payload: { type, quantity: qty, reason: reason.trim() || null } satisfies AdjustInventoryPayload,
      });
      toast.success(
        `Stock adjusted. New on-hand: ${result.newOnHand}`,
      );
      onClose();
      setQuantity('');
      setReason('');
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to adjust stock';
      toast.error(msg);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adjust Stock</DialogTitle>
          <DialogDescription>
            {row.product.title}
            {row.attributeLabel ? ` · ${row.attributeLabel}` : ''} · SKU:{' '}
            {row.sku}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setType('STOCK_IN')}
              className={cn(
                'flex items-center justify-center gap-2 rounded-sm border p-3 text-sm font-medium transition-colors',
                type === 'STOCK_IN'
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                  : 'border-border hover:bg-muted',
              )}
            >
              <ArrowUpCircle className="size-4" /> Stock In
            </button>
            <button
              type="button"
              onClick={() => setType('STOCK_OUT')}
              className={cn(
                'flex items-center justify-center gap-2 rounded-sm border p-3 text-sm font-medium transition-colors',
                type === 'STOCK_OUT'
                  ? 'border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400'
                  : 'border-border hover:bg-muted',
              )}
            >
              <ArrowDownCircle className="size-4" /> Stock Out
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 rounded-sm border p-3 text-sm">
            <div className="text-center">
              <p className="text-muted-foreground text-xs">On Hand</p>
              <p className="font-bold">{row.quantityOnHand}</p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground text-xs">Reserved</p>
              <p className="font-bold">{row.quantityReserved}</p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground text-xs">Available</p>
              <p className="font-bold">{row.available}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="adj-quantity">Quantity</Label>
            <Input
              id="adj-quantity"
              type="number"
              min={1}
              placeholder="Enter quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="adj-reason">Reason (optional)</Label>
            <Textarea
              id="adj-reason"
              placeholder="e.g. Supplier delivery, manual correction..."
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => void handleSubmit()}
            disabled={adjustInv.isPending}
            className={cn(
              'rounded-sm',
              type === 'STOCK_IN'
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-rose-600 hover:bg-rose-700',
            )}
          >
            {adjustInv.isPending && <RefreshCw className="size-4 animate-spin" />}
            {type === 'STOCK_IN' ? 'Add Stock' : 'Remove Stock'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function InventoryPage() {
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });
  const [adjustRow, setAdjustRow] = useState<InventoryRow | null>(null);
  const [txVariantId, setTxVariantId] = useState<string | null>(null);

  const query = useMemo(
    () => ({
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      search: filters.search || undefined,
      lowStockOnly: filters.lowStockOnly === 'true' || undefined,
    }),
    [filters, pagination.pageIndex, pagination.pageSize],
  );

  const { data, isLoading, isError, refetch, isFetching } = useGetInventory(query);

  const columns = useMemo<ColumnDef<InventoryRow>[]>(
    () => [
      {
        id: 'product',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Product / SKU" />
        ),
        cell: ({ row }) => (
          <div>
            <p className="font-medium">{row.original.product.title}</p>
            {row.original.attributeLabel && (
              <p className="text-xs text-muted-foreground">
                {row.original.attributeLabel}
              </p>
            )}
            <p className="text-xs text-muted-foreground font-mono">
              {row.original.sku}
            </p>
          </div>
        ),
        enableSorting: false,
      },
      {
        accessorKey: 'quantityOnHand',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="On Hand" />
        ),
        cell: ({ row }) => (
          <span className="tabular-nums font-medium">
            {row.original.quantityOnHand}
          </span>
        ),
      },
      {
        accessorKey: 'quantityReserved',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Reserved" />
        ),
        cell: ({ row }) => (
          <span className="tabular-nums text-muted-foreground">
            {row.original.quantityReserved}
          </span>
        ),
      },
      {
        accessorKey: 'available',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Available" />
        ),
        cell: ({ row }) => (
          <span className="tabular-nums font-medium">{row.original.available}</span>
        ),
      },
      {
        id: 'lowStock',
        header: 'Status',
        cell: ({ row }) =>
          row.original.isLowStock ? (
            <Badge className="gap-1 rounded-full border-0 bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wider dark:bg-amber-900/30 dark:text-amber-400">
              <AlertTriangle className="size-3" /> Low stock
            </Badge>
          ) : (
            <Badge className="rounded-full border-0 bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider dark:bg-emerald-900/30 dark:text-emerald-400">
              OK
            </Badge>
          ),
        enableSorting: false,
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAdjustRow(row.original)}
            >
              Adjust
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTxVariantId(row.original.variantId)}
              title="View transaction history"
            >
              <ClipboardList className="size-4" />
            </Button>
          </div>
        ),
        enableSorting: false,
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
          <p className="text-sm text-muted-foreground">
            Monitor stock levels and make manual adjustments.
          </p>
        </div>
        {isFetching && !isLoading && (
          <RefreshCw className="size-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {isError ? (
        <Card className="rounded-sm ring-primary/10">
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <p className="text-sm text-muted-foreground">
              Failed to load inventory. Please try again.
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
            <CardTitle>All Variants</CardTitle>
            <CardDescription>{data?.meta.total ?? 0} variants</CardDescription>
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
              emptyMessage="No inventory records found."
              manualPagination
              pageCount={data?.meta.totalPages ?? 0}
              pagination={pagination}
              onPaginationChange={setPagination}
            />
          </CardContent>
        </Card>
      )}

      {adjustRow && (
        <AdjustStockDialog
          row={adjustRow}
          open={Boolean(adjustRow)}
          onClose={() => setAdjustRow(null)}
        />
      )}

      {txVariantId && (
        <TransactionHistorySheet
          variantId={txVariantId}
          open={Boolean(txVariantId)}
          onClose={() => setTxVariantId(null)}
        />
      )}
    </div>
  );
}
