import { useQueries, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { PaginatedList, PaginatedQuery } from '@/types/pagination-type';
import type {
  ProductAttributeDetail,
  ProductAttributeListItem,
} from '@/types/product-attribute-type';

const BASE_URL = '/admin/product-attributes';

export const PRODUCT_ATTRIBUTE_QUERY_KEYS = {
  all: ['admin-product-attributes'] as const,
  lists: () => [...PRODUCT_ATTRIBUTE_QUERY_KEYS.all, 'list'] as const,
  list: (query: PaginatedQuery) =>
    [...PRODUCT_ATTRIBUTE_QUERY_KEYS.lists(), query] as const,
  details: () => [...PRODUCT_ATTRIBUTE_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) =>
    [...PRODUCT_ATTRIBUTE_QUERY_KEYS.details(), id] as const,
};

export async function getProductAttributes(query: PaginatedQuery = {}) {
  return api.get<PaginatedList<ProductAttributeListItem>>(BASE_URL, {
    params: { page: 1, limit: 100, ...query },
  });
}

export async function getProductAttribute(attributeId: string) {
  return api.get<ProductAttributeDetail>(`${BASE_URL}/${attributeId}`);
}

export function useGetProductAttributes(
  query: PaginatedQuery = {},
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: PRODUCT_ATTRIBUTE_QUERY_KEYS.list(query),
    queryFn: () => getProductAttributes(query),
    enabled: options?.enabled ?? true,
  });
}

export function useGetProductAttribute(
  attributeId: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: PRODUCT_ATTRIBUTE_QUERY_KEYS.detail(attributeId),
    queryFn: () => getProductAttribute(attributeId),
    enabled: options?.enabled ?? false,
  });
}

export function useGetProductAttributesByIds(attributeIds: string[]) {
  return useQueries({
    queries: attributeIds.map((id) => ({
      queryKey: PRODUCT_ATTRIBUTE_QUERY_KEYS.detail(id),
      queryFn: () => getProductAttribute(id),
      enabled: Boolean(id),
    })),
  });
}
