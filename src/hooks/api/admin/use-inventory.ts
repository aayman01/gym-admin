import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { PaginatedList } from '@/types/pagination-type';
import type {
  AdjustInventoryPayload,
  AdjustInventoryResult,
  InventoryRow,
  InventoryTransactionsResponse,
} from '@/types/inventory-type';

const BASE_URL = '/admin/inventory';

export const INVENTORY_QUERY_KEYS = {
  all: ['admin-inventory'] as const,
  lists: () => [...INVENTORY_QUERY_KEYS.all, 'list'] as const,
  list: (query: Record<string, unknown>) =>
    [...INVENTORY_QUERY_KEYS.lists(), query] as const,
  transactions: (variantId: string) =>
    [...INVENTORY_QUERY_KEYS.all, 'transactions', variantId] as const,
};

export async function getInventory(
  query: { page?: number; limit?: number; search?: string; lowStockOnly?: boolean } = {},
) {
  return api.get<PaginatedList<InventoryRow>>(BASE_URL, { params: { page: 1, limit: 20, ...query } });
}

export async function getInventoryTransactions(variantId: string) {
  return api.get<InventoryTransactionsResponse>(`${BASE_URL}/${variantId}/transactions`);
}

export async function adjustInventory(variantId: string, payload: AdjustInventoryPayload) {
  return api.post<AdjustInventoryResult>(`${BASE_URL}/${variantId}/adjust`, payload);
}

export function useGetInventory(
  query: { page?: number; limit?: number; search?: string; lowStockOnly?: boolean } = {},
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: INVENTORY_QUERY_KEYS.list(query),
    queryFn: () => getInventory(query),
    enabled: options?.enabled ?? true,
  });
}

export function useGetInventoryTransactions(
  variantId: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: INVENTORY_QUERY_KEYS.transactions(variantId),
    queryFn: () => getInventoryTransactions(variantId),
    enabled: options?.enabled ?? Boolean(variantId),
  });
}

export function useAdjustInventory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      variantId,
      payload,
    }: {
      variantId: string;
      payload: AdjustInventoryPayload;
    }) => adjustInventory(variantId, payload),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: INVENTORY_QUERY_KEYS.transactions(vars.variantId),
      });
    },
  });
}
