import type { PaginatedQuery } from '@/types/pagination-type';

export type ShippingMethod = {
  id: string;
  name: string;
  price: string;
  deliveryDays: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type GetShippingMethodsQuery = PaginatedQuery & {
  search?: string;
  isActive?: boolean;
};

export type CreateShippingMethodPayload = {
  name: string;
  price: number;
  deliveryDays: number;
  isActive?: boolean;
};

export type UpdateShippingMethodPayload =
  Partial<CreateShippingMethodPayload>;
