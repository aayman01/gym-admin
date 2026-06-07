import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { PaginatedList, PaginatedQuery } from '@/types/pagination-type';
import type { Tax } from '@/types/tax-type';

const BASE_URL = '/admin/taxes';

export const TAX_QUERY_KEYS = {
  all: ['admin-taxes'] as const,
  lists: () => [...TAX_QUERY_KEYS.all, 'list'] as const,
  list: (query: PaginatedQuery) => [...TAX_QUERY_KEYS.lists(), query] as const,
};

export async function getTaxes(query: PaginatedQuery = {}) {
  return api.get<PaginatedList<Tax>>(BASE_URL, {
    params: { page: 1, limit: 100, ...query },
  });
}

export function useGetTaxes(
  query: PaginatedQuery = {},
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: TAX_QUERY_KEYS.list(query),
    queryFn: () => getTaxes(query),
    enabled: options?.enabled ?? true,
  });
}
