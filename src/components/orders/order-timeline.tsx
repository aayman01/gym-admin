import { cn } from '@/lib/utils';
import type { OrderEvent, OrderEventActionBy } from '@/types/order-type';

const ACTION_BY_LABEL: Record<OrderEventActionBy, string> = {
  CUSTOMER: 'Customer',
  ADMIN: 'Admin',
  SYSTEM: 'System',
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getEventLabel(event: OrderEvent): string {
  switch (event.eventType) {
    case 'ORDER_PLACED':
      return 'Order placed';
    case 'STATUS_CHANGED': {
      const prev = event.metadata?.previousStatus;
      const next = event.metadata?.newStatus;
      if (prev && next) {
        return `Status changed: ${prev} → ${next}`;
      }
      return 'Status changed';
    }
    case 'PAYMENT_RECEIVED':
      return 'Payment received';
    case 'PAYMENT_FAILED':
      return 'Payment failed';
    case 'ORDER_CANCELLED':
      return 'Order cancelled';
    case 'REFUND_INITIATED':
      return 'Refund initiated';
    case 'REFUND_COMPLETED':
      return 'Refund completed';
    case 'NOTE_ADDED':
      return event.metadata?.note
        ? `Note: ${String(event.metadata.note)}`
        : event.metadata?.notes
          ? `Note: ${String(event.metadata.notes)}`
          : 'Note added';
    default: {
      const eventType = event.eventType as string;
      return eventType.replace(/_/g, ' ');
    }
  }
}

type OrderTimelineProps = {
  events: OrderEvent[];
};

export function OrderTimeline({ events }: OrderTimelineProps) {
  if (events.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No timeline events yet.</p>
    );
  }

  return (
    <ol className="relative space-y-0">
      {events.map((event, index) => (
        <li key={event.id} className="relative flex gap-4 pb-6 last:pb-0">
          {index < events.length - 1 ? (
            <span
              className="absolute top-2 left-[7px] h-full w-px bg-primary/20"
              aria-hidden
            />
          ) : null}
          <span
            className={cn(
              'relative z-10 mt-1.5 size-3.5 shrink-0 rounded-full ring-2 ring-background',
              index === 0 ? 'bg-primary' : 'bg-primary/40',
            )}
            aria-hidden
          />
          <div className="min-w-0 flex-1 space-y-1">
            <p className="text-sm font-medium leading-snug">
              {getEventLabel(event)}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDateTime(event.occurredAt)}
              {event.actionBy ? (
                <> · {ACTION_BY_LABEL[event.actionBy]}</>
              ) : null}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
