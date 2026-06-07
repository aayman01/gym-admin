import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Category } from '@/types/category-type';
import type { PaginatedList, PaginatedQuery } from '@/types/pagination-type';

const BASE_URL = '/admin/categories';

export const CATEGORY_QUERY_KEYS = {
  all: ['admin-categories'] as const,
  lists: () => [...CATEGORY_QUERY_KEYS.all, 'list'] as const,
  list: (query: PaginatedQuery) =>
    [...CATEGORY_QUERY_KEYS.lists(), query] as const,
};

export async function getCategories(query: PaginatedQuery = {}) {
  return api.get<PaginatedList<Category>>(BASE_URL, {
    params: { page: 1, limit: 100, ...query },
  });
}

export function useGetCategories(
  query: PaginatedQuery = {},
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: CATEGORY_QUERY_KEYS.list(query),
    queryFn: () => getCategories(query),
    enabled: options?.enabled ?? true,
  });
}
