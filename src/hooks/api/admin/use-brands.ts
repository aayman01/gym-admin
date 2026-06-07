import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Brand } from '@/types/brand-type';
import type { PaginatedList, PaginatedQuery } from '@/types/pagination-type';

const BASE_URL = '/admin/brands';

export const BRAND_QUERY_KEYS = {
  all: ['admin-brands'] as const,
  lists: () => [...BRAND_QUERY_KEYS.all, 'list'] as const,
  list: (query: PaginatedQuery) => [...BRAND_QUERY_KEYS.lists(), query] as const,
};

export async function getBrands(query: PaginatedQuery = {}) {
  return api.get<PaginatedList<Brand>>(BASE_URL, {
    params: { page: 1, limit: 100, ...query },
  });
}

export function useGetBrands(
  query: PaginatedQuery = {},
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: BRAND_QUERY_KEYS.list(query),
    queryFn: () => getBrands(query),
    enabled: options?.enabled ?? true,
  });
}
