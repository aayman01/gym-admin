import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { MessageSquarePlus } from 'lucide-react';
import { OrderTimeline } from '@/components/orders/order-timeline';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAddOrderNote, useUpdateOrderStatus } from '@/hooks/api/admin/use-orders';
import { ApiError } from '@/lib/api-client';
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

function formatCurrency(value: string, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(Number(value));
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
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

function formatAddress(
  address: {
    recipientName: string;
    addressLine1: string;
    addressLine2?: string | null;
    city: string;
    stateOrDivision: string;
    postalCode?: string | null;
    country: string;
    phone?: string;
  },
) {
  const lines = [
    address.recipientName,
    address.addressLine1,
    address.addressLine2,
    [address.city, address.stateOrDivision, address.postalCode]
      .filter(Boolean)
      .join(', '),
    address.country,
    address.phone,
  ].filter(Boolean);
  return lines;
}

type OrderDetailProps = {
  order: Order;
};

export function OrderDetail({ order }: OrderDetailProps) {
  const updateStatus = useUpdateOrderStatus();
  const addNote = useAddOrderNote();
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(order.status);
  const [statusNote, setStatusNote] = useState('');
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    setSelectedStatus(order.status);
  }, [order.status]);

  async function handleStatusChange(status: OrderStatus) {
    if (status === order.status) return;

    setSelectedStatus(status);
    try {
      await updateStatus.mutateAsync({
        orderId: order.id,
        payload: { status, note: statusNote.trim() || null },
      });
      toast.success('Order status updated');
      setStatusNote('');
    } catch (error) {
      setSelectedStatus(order.status);
      const message =
        error instanceof ApiError
          ? error.message
          : 'Failed to update order status';
      toast.error(message);
    }
  }

  async function handleAddNote() {
    const trimmed = noteText.trim();
    if (!trimmed) return;
    try {
      await addNote.mutateAsync({ orderId: order.id, payload: { note: trimmed } });
      toast.success('Note added');
      setNoteText('');
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'Failed to add note';
      toast.error(message);
    }
  }

  const currency = order.currency || 'USD';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {order.orderNumber}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Placed {formatDate(order.createdAt)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            className={cn(
              'rounded-full border-0 text-[10px] font-bold uppercase tracking-wider',
              orderStatusBadgeClass[order.status] ?? defaultStatusBadgeClass,
            )}
          >
            {order.status}
          </Badge>
          <Badge
            className={cn(
              'rounded-full border-0 text-[10px] font-bold uppercase tracking-wider',
              paymentStatusBadgeClass[order.paymentStatus] ??
                defaultStatusBadgeClass,
            )}
          >
            {order.paymentStatus.replace(/_/g, ' ')}
          </Badge>
          {order.returnStatus !== 'NONE' ? (
            <Badge
              className={cn(
                'rounded-full border-0 text-[10px] font-bold uppercase tracking-wider',
                defaultStatusBadgeClass,
              )}
            >
              {order.returnStatus.replace(/_/g, ' ')}
            </Badge>
          ) : null}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="rounded-sm ring-primary/10">
            <CardHeader>
              <CardTitle>Line items</CardTitle>
              <CardDescription>{order.items.length} items</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-primary/10 hover:bg-transparent">
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Unit</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow
                      key={item.id}
                      className="border-primary/10 hover:bg-primary/5"
                    >
                      <TableCell>
                        <div className="font-medium">{item.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {item.unit}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.sku}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatCurrency(item.unitPrice, currency)}
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {formatCurrency(item.lineTotal, currency)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="grid gap-6 sm:grid-cols-2">
            <Card className="rounded-sm ring-primary/10">
              <CardHeader>
                <CardTitle>Customer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <p className="font-medium">{formatCustomerName(order)}</p>
                <p className="text-muted-foreground">{order.customer.email}</p>
              </CardContent>
            </Card>

            <Card className="rounded-sm ring-primary/10">
              <CardHeader>
                <CardTitle>Update status</CardTitle>
                <CardDescription>Change the order fulfillment status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Select
                  value={selectedStatus}
                  onValueChange={(value) =>
                    void handleStatusChange(value as OrderStatus)
                  }
                  disabled={updateStatus.isPending}
                >
                  <SelectTrigger className="w-full rounded-sm">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {ORDER_STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="space-y-1">
                  <Label htmlFor="status-note" className="text-xs text-muted-foreground">
                    Note (optional)
                  </Label>
                  <Textarea
                    id="status-note"
                    placeholder="Reason for status change..."
                    rows={2}
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    className="rounded-sm text-sm"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {order.billing ? (
              <Card className="rounded-sm ring-primary/10">
                <CardHeader>
                  <CardTitle>Billing address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  {formatAddress({ ...order.billing, phone: order.billing.phone }).map(
                    (line) => (
                      <p key={line} className="text-muted-foreground">
                        {line}
                      </p>
                    ),
                  )}
                  <p className="pt-2 text-muted-foreground">{order.billing.email}</p>
                </CardContent>
              </Card>
            ) : null}

            {order.shipping ? (
              <Card className="rounded-sm ring-primary/10">
                <CardHeader>
                  <CardTitle>Shipping address</CardTitle>
                  {order.shipping.shippingMethod ? (
                    <CardDescription>
                      {order.shipping.shippingMethod.name}
                    </CardDescription>
                  ) : null}
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  {formatAddress(order.shipping).map((line) => (
                    <p key={line} className="text-muted-foreground">
                      {line}
                    </p>
                  ))}
                </CardContent>
              </Card>
            ) : null}
          </div>
        </div>

        <div className="space-y-6">
          <Card className="rounded-sm ring-primary/10">
            <CardHeader>
              <CardTitle>Order summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="tabular-nums">
                  {formatCurrency(order.itemTotal, currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span className="tabular-nums">
                  {formatCurrency(order.taxAmount, currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="tabular-nums">
                  {formatCurrency(order.shippingAmount, currency)}
                </span>
              </div>
              {Number(order.discountAmount) > 0 ? (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="tabular-nums">
                    -{formatCurrency(order.discountAmount, currency)}
                  </span>
                </div>
              ) : null}
              <div className="flex justify-between border-t border-primary/10 pt-3 font-semibold">
                <span>Total</span>
                <span className="tabular-nums">
                  {formatCurrency(order.totalAmount, currency)}
                </span>
              </div>
              {order.paymentMethod ? (
                <div className="border-t border-primary/10 pt-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Payment method
                  </p>
                  <p className="mt-1 font-medium">{order.paymentMethod.name}</p>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card className="rounded-sm ring-primary/10">
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
              <CardDescription>Order activity history</CardDescription>
            </CardHeader>
            <CardContent>
              <OrderTimeline events={order.events ?? []} />
            </CardContent>
          </Card>

          <Card className="rounded-sm ring-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquarePlus className="size-4" />
                Add internal note
              </CardTitle>
              <CardDescription>
                Notes are only visible to admins.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                placeholder="Write a note..."
                rows={3}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="rounded-sm text-sm"
              />
              <Button
                size="sm"
                className="rounded-sm"
                disabled={!noteText.trim() || addNote.isPending}
                onClick={() => void handleAddNote()}
              >
                {addNote.isPending ? 'Adding...' : 'Add note'}
              </Button>
            </CardContent>
          </Card>

          <Link
            to="/orders"
            className="inline-block text-sm text-primary hover:underline"
          >
            Back to all orders
          </Link>
        </div>
      </div>
    </div>
  );
}
