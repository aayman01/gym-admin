import type { ItemStatus } from '@/types/product-type';
import type { PaginatedQuery } from '@/types/pagination-type';

export type Category = {
  id: string;
  name: string;
  slug: string;
  status: ItemStatus;
  isFeature: boolean;
  order: number;
  imageId: string | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type GetCategoriesQuery = PaginatedQuery & {
  search?: string;
};

export type CreateCategoryPayload = {
  name: string;
  slug: string;
  status?: ItemStatus;
  isFeature?: boolean;
  imageId?: string;
  order?: number;
};

export type UpdateCategoryPayload = Partial<
  Omit<CreateCategoryPayload, 'imageId'> & { imageId: string | null }
>;
