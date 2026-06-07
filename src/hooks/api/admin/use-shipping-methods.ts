import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { PaginatedList } from '@/types/pagination-type';
import type {
  CreateShippingMethodPayload,
  GetShippingMethodsQuery,
  ShippingMethod,
  UpdateShippingMethodPayload,
} from '@/types/shipping-method-type';

const BASE_URL = '/admin/shipping-methods';

export const SHIPPING_METHOD_QUERY_KEYS = {
  all: ['admin-shipping-methods'] as const,
  lists: () => [...SHIPPING_METHOD_QUERY_KEYS.all, 'list'] as const,
  list: (query: GetShippingMethodsQuery) =>
    [...SHIPPING_METHOD_QUERY_KEYS.lists(), query] as const,
  details: () => [...SHIPPING_METHOD_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) =>
    [...SHIPPING_METHOD_QUERY_KEYS.details(), id] as const,
};

export async function getShippingMethods(query: GetShippingMethodsQuery = {}) {
  return api.get<PaginatedList<ShippingMethod>>(BASE_URL, {
    params: { page: 1, limit: 100, ...query },
  });
}

export async function getShippingMethod(shippingMethodId: string) {
  return api.get<ShippingMethod>(`${BASE_URL}/${shippingMethodId}`);
}

export async function createShippingMethod(payload: CreateShippingMethodPayload) {
  return api.post<ShippingMethod>(BASE_URL, payload);
}

export async function updateShippingMethod(
  shippingMethodId: string,
  payload: UpdateShippingMethodPayload,
) {
  return api.patch<ShippingMethod>(`${BASE_URL}/${shippingMethodId}`, payload);
}

export async function deleteShippingMethod(shippingMethodId: string) {
  return api.delete<ShippingMethod>(`${BASE_URL}/${shippingMethodId}`);
}

export async function activateShippingMethod(shippingMethodId: string) {
  return api.patch<ShippingMethod>(
    `${BASE_URL}/${shippingMethodId}/activate`,
  );
}

export async function deactivateShippingMethod(shippingMethodId: string) {
  return api.patch<ShippingMethod>(
    `${BASE_URL}/${shippingMethodId}/deactivate`,
  );
}

export function useGetShippingMethods(
  query: GetShippingMethodsQuery = {},
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: SHIPPING_METHOD_QUERY_KEYS.list(query),
    queryFn: () => getShippingMethods(query),
    enabled: options?.enabled ?? true,
  });
}

export function useGetShippingMethod(
  shippingMethodId: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: SHIPPING_METHOD_QUERY_KEYS.detail(shippingMethodId),
    queryFn: () => getShippingMethod(shippingMethodId),
    enabled: options?.enabled ?? Boolean(shippingMethodId),
  });
}

export function useCreateShippingMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createShippingMethod,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: SHIPPING_METHOD_QUERY_KEYS.lists(),
      });
    },
  });
}

export function useUpdateShippingMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      shippingMethodId,
      payload,
    }: {
      shippingMethodId: string;
      payload: UpdateShippingMethodPayload;
    }) => updateShippingMethod(shippingMethodId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: SHIPPING_METHOD_QUERY_KEYS.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: SHIPPING_METHOD_QUERY_KEYS.detail(variables.shippingMethodId),
      });
    },
  });
}

export function useDeleteShippingMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteShippingMethod,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: SHIPPING_METHOD_QUERY_KEYS.lists(),
      });
    },
  });
}

export function useActivateShippingMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: activateShippingMethod,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: SHIPPING_METHOD_QUERY_KEYS.lists(),
      });
    },
  });
}

export function useDeactivateShippingMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deactivateShippingMethod,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: SHIPPING_METHOD_QUERY_KEYS.lists(),
      });
    },
  });
}
