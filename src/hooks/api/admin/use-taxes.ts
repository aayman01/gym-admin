import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { PaginatedList } from '@/types/pagination-type';
import type {
  CreateTaxPayload,
  GetTaxesQuery,
  Tax,
  UpdateTaxPayload,
} from '@/types/tax-type';

const BASE_URL = '/admin/taxes';

export const TAX_QUERY_KEYS = {
  all: ['admin-taxes'] as const,
  lists: () => [...TAX_QUERY_KEYS.all, 'list'] as const,
  list: (query: GetTaxesQuery) => [...TAX_QUERY_KEYS.lists(), query] as const,
  details: () => [...TAX_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...TAX_QUERY_KEYS.details(), id] as const,
};

export async function getTaxes(query: GetTaxesQuery = {}) {
  return api.get<PaginatedList<Tax>>(BASE_URL, {
    params: { page: 1, limit: 100, ...query },
  });
}

export async function getTax(taxId: string) {
  return api.get<Tax>(`${BASE_URL}/${taxId}`);
}

export async function createTax(payload: CreateTaxPayload) {
  return api.post<Tax>(BASE_URL, payload);
}

export async function updateTax(taxId: string, payload: UpdateTaxPayload) {
  return api.patch<Tax>(`${BASE_URL}/${taxId}`, payload);
}

export async function deleteTax(taxId: string) {
  return api.delete<Tax>(`${BASE_URL}/${taxId}`);
}

export async function setDefaultTax(taxId: string) {
  return api.patch<Tax>(`${BASE_URL}/${taxId}/set-default`);
}

export async function unsetDefaultTax(taxId: string) {
  return api.patch<Tax>(`${BASE_URL}/${taxId}/unset-default`);
}

export async function activateTax(taxId: string) {
  return api.patch<Tax>(`${BASE_URL}/${taxId}/activate`);
}

export async function deactivateTax(taxId: string) {
  return api.patch<Tax>(`${BASE_URL}/${taxId}/deactivate`);
}

export function useGetTaxes(
  query: GetTaxesQuery = {},
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: TAX_QUERY_KEYS.list(query),
    queryFn: () => getTaxes(query),
    enabled: options?.enabled ?? true,
  });
}

export function useGetTax(taxId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: TAX_QUERY_KEYS.detail(taxId),
    queryFn: () => getTax(taxId),
    enabled: options?.enabled ?? Boolean(taxId),
  });
}

export function useCreateTax() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTax,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TAX_QUERY_KEYS.lists() });
    },
  });
}

export function useUpdateTax() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      taxId,
      payload,
    }: {
      taxId: string;
      payload: UpdateTaxPayload;
    }) => updateTax(taxId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: TAX_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: TAX_QUERY_KEYS.detail(variables.taxId),
      });
    },
  });
}

export function useDeleteTax() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTax,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TAX_QUERY_KEYS.lists() });
    },
  });
}

export function useSetDefaultTax() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: setDefaultTax,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TAX_QUERY_KEYS.lists() });
    },
  });
}

export function useUnsetDefaultTax() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unsetDefaultTax,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TAX_QUERY_KEYS.lists() });
    },
  });
}

export function useActivateTax() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: activateTax,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TAX_QUERY_KEYS.lists() });
    },
  });
}

export function useDeactivateTax() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deactivateTax,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TAX_QUERY_KEYS.lists() });
    },
  });
}
