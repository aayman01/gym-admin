import type { PaginatedQuery } from '@/types/pagination-type';

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

export type PaymentStatus =
  | 'PENDING'
  | 'PAID'
  | 'FAILED'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED';

export type OrderReturnStatus =
  | 'NONE'
  | 'PARTIALLY_RETURNED'
  | 'FULLY_RETURNED';

export type OrderEventType =
  | 'ORDER_PLACED'
  | 'PAYMENT_RECEIVED'
  | 'PAYMENT_FAILED'
  | 'STATUS_CHANGED'
  | 'NOTE_ADDED'
  | 'REFUND_INITIATED'
  | 'REFUND_COMPLETED'
  | 'ORDER_CANCELLED';

export type OrderEventActionBy = 'CUSTOMER' | 'ADMIN' | 'SYSTEM';

export type OrderCustomer = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
};

export type OrderItem = {
  id: string;
  productId: string | null;
  variantId: string | null;
  title: string;
  sku: string;
  unit: string;
  quantity: number;
  unitPrice: string;
  lineTotal: string;
};

export type OrderBillingInfo = {
  id: string;
  orderId: string;
  recipientName: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  stateOrDivision: string;
  postalCode: string | null;
  country: string;
  phone: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};

export type OrderShippingMethod = {
  id: string;
  name: string;
  price: string;
  isActive: boolean;
  deliveryDays: number;
  createdAt: string;
  updatedAt: string;
};

export type OrderShippingInfo = {
  id: string;
  orderId: string;
  recipientName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  stateOrDivision: string;
  postalCode: string | null;
  country: string;
  shippingMethodId: string | null;
  createdAt: string;
  updatedAt: string;
  shippingMethod: OrderShippingMethod | null;
};

export type OrderPaymentMethod = {
  id: string;
  code: string;
  name: string;
};

export type OrderEventMetadata = {
  previousStatus?: string;
  newStatus?: string;
  notes?: string;
  note?: string;
  [key: string]: unknown;
};

export type OrderEvent = {
  id: string;
  eventType: OrderEventType;
  occurredAt: string;
  actionBy: OrderEventActionBy | null;
  metadata: OrderEventMetadata | null;
};

export type Order = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  returnStatus: OrderReturnStatus;
  currency: string;
  createdAt: string;
  updatedAt: string;
  itemTotal: string;
  taxAmount: string;
  shippingAmount: string;
  totalAmount: string;
  discountAmount: string;
  customer: OrderCustomer;
  items: OrderItem[];
  billing: OrderBillingInfo | null;
  shipping: OrderShippingInfo | null;
  paymentMethod: OrderPaymentMethod | null;
  events?: OrderEvent[];
};

export type GetOrdersQuery = PaginatedQuery & {
  status?: OrderStatus;
};

export type UpdateOrderStatusPayload = {
  status: OrderStatus;
  note?: string | null;
};

export type AddOrderNotePayload = {
  note: string;
};

export const ORDER_STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'SHIPPED', label: 'Shipped' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'REFUNDED', label: 'Refunded' },
];
