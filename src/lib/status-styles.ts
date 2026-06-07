/**
 * Theme-aware status badge classes backed by CSS variables in index.css.
 * Update colors globally via --status-* tokens in :root / .dark.
 */

export const itemStatusBadgeClass: Record<string, string> = {
  ACTIVE:
    'bg-[var(--status-success-bg)] text-[var(--status-success-fg)]',
  INACTIVE:
    'bg-[var(--status-neutral-bg)] text-[var(--status-neutral-fg)]',
  DRAFT:
    'bg-[var(--status-warning-bg)] text-[var(--status-warning-fg)]',
};

export const orderStatusBadgeClass: Record<string, string> = {
  PENDING:
    'bg-[var(--status-warning-bg)] text-[var(--status-warning-fg)]',
  CONFIRMED:
    'bg-[var(--status-info-bg)] text-[var(--status-info-fg)]',
  PROCESSING:
    'bg-[var(--status-processing-bg)] text-[var(--status-processing-fg)]',
  SHIPPED:
    'bg-[var(--status-shipped-bg)] text-[var(--status-shipped-fg)]',
  DELIVERED:
    'bg-[var(--status-success-bg)] text-[var(--status-success-fg)]',
  CANCELLED:
    'bg-[var(--status-danger-bg)] text-[var(--status-danger-fg)]',
  REFUNDED:
    'bg-[var(--status-neutral-bg)] text-[var(--status-neutral-fg)]',
};

export const paymentStatusBadgeClass: Record<string, string> = {
  PAID: 'bg-[var(--status-success-bg)] text-[var(--status-success-fg)]',
  PENDING:
    'bg-[var(--status-warning-bg)] text-[var(--status-warning-fg)]',
  FAILED: 'bg-[var(--status-danger-bg)] text-[var(--status-danger-fg)]',
  REFUNDED:
    'bg-[var(--status-neutral-bg)] text-[var(--status-neutral-fg)]',
  PARTIALLY_REFUNDED:
    'bg-[var(--status-processing-bg)] text-[var(--status-processing-fg)]',
};

export const trendBadgeClass = {
  positive:
    'bg-[var(--status-success-bg)] text-[var(--status-success-fg)]',
  negative: 'bg-[var(--status-danger-bg)] text-[var(--status-danger-fg)]',
} as const;

export const defaultStatusBadgeClass =
  'bg-primary/20 text-primary';
