import type { PaginatedQuery } from '@/types/pagination-type';

export type TaxType = 'PERCENTAGE' | 'FIXED';

export type Tax = {
  id: string;
  name: string;
  rate: string;
  type: TaxType;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type GetTaxesQuery = PaginatedQuery & {
  search?: string;
  isActive?: boolean;
};

export type CreateTaxPayload = {
  name: string;
  rate: number;
  type: TaxType;
  isDefault?: boolean;
  isActive?: boolean;
};

export type UpdateTaxPayload = Partial<
  Pick<CreateTaxPayload, 'name' | 'rate' | 'type'>
>;
