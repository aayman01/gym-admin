import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { PaginatedList } from '@/types/pagination-type';
import type {
  GetOrdersQuery,
  Order,
  UpdateOrderStatusPayload,
} from '@/types/order-type';

const BASE_URL = '/admin/orders';

export const ORDER_QUERY_KEYS = {
  all: ['admin-orders'] as const,
  lists: () => [...ORDER_QUERY_KEYS.all, 'list'] as const,
  list: (query: GetOrdersQuery) => [...ORDER_QUERY_KEYS.lists(), query] as const,
  details: () => [...ORDER_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...ORDER_QUERY_KEYS.details(), id] as const,
};

export async function getOrders(query: GetOrdersQuery = {}) {
  return api.get<PaginatedList<Order>>(BASE_URL, {
    params: { page: 1, limit: 20, ...query },
  });
}

export async function getOrder(orderId: string) {
  return api.get<Order>(`${BASE_URL}/${orderId}`);
}

export async function updateOrderStatus(
  orderId: string,
  payload: UpdateOrderStatusPayload,
) {
  return api.patch<Order>(`${BASE_URL}/${orderId}/status`, payload);
}

export function useGetOrders(
  query: GetOrdersQuery = {},
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ORDER_QUERY_KEYS.list(query),
    queryFn: () => getOrders(query),
    enabled: options?.enabled ?? true,
  });
}

export function useGetOrder(orderId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ORDER_QUERY_KEYS.detail(orderId),
    queryFn: () => getOrder(orderId),
    enabled: options?.enabled ?? Boolean(orderId),
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      payload,
    }: {
      orderId: string;
      payload: UpdateOrderStatusPayload;
    }) => updateOrderStatus(orderId, payload),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(ORDER_QUERY_KEYS.detail(variables.orderId), data);
      queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEYS.lists() });
    },
  });
}
