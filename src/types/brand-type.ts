import type { ItemStatus } from '@/types/product-type';
import type { PaginatedQuery } from '@/types/pagination-type';

export type Brand = {
  id: string;
  name: string;
  slug: string;
  status: ItemStatus;
  order: number;
  logoId: string | null;
  logoUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type GetBrandsQuery = PaginatedQuery & {
  search?: string;
  status?: ItemStatus;
};

export type CreateBrandPayload = {
  name: string;
  slug: string;
  status?: ItemStatus;
  logoId?: string;
};

export type UpdateBrandPayload = Partial<
  Omit<CreateBrandPayload, 'logoId'> & { logoId: string | null }
>;
