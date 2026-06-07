import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type {
  Brand,
  CreateBrandPayload,
  GetBrandsQuery,
  UpdateBrandPayload,
} from '@/types/brand-type';
import type { PaginatedList } from '@/types/pagination-type';

const BASE_URL = '/admin/brands';

export const BRAND_QUERY_KEYS = {
  all: ['admin-brands'] as const,
  lists: () => [...BRAND_QUERY_KEYS.all, 'list'] as const,
  list: (query: GetBrandsQuery) => [...BRAND_QUERY_KEYS.lists(), query] as const,
  details: () => [...BRAND_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...BRAND_QUERY_KEYS.details(), id] as const,
};

export async function getBrands(query: GetBrandsQuery = {}) {
  return api.get<PaginatedList<Brand>>(BASE_URL, {
    params: { page: 1, limit: 100, ...query },
  });
}

export async function getBrand(brandId: string) {
  return api.get<Brand>(`${BASE_URL}/${brandId}`);
}

export async function createBrand(payload: CreateBrandPayload) {
  return api.post<Brand>(BASE_URL, payload);
}

export async function updateBrand(brandId: string, payload: UpdateBrandPayload) {
  return api.patch<Brand>(`${BASE_URL}/${brandId}`, payload);
}

export function useGetBrands(
  query: GetBrandsQuery = {},
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: BRAND_QUERY_KEYS.list(query),
    queryFn: () => getBrands(query),
    enabled: options?.enabled ?? true,
  });
}

export function useGetBrand(brandId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: BRAND_QUERY_KEYS.detail(brandId),
    queryFn: () => getBrand(brandId),
    enabled: options?.enabled ?? Boolean(brandId),
  });
}

export function useCreateBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBrand,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BRAND_QUERY_KEYS.lists() });
    },
  });
}

export function useUpdateBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      brandId,
      payload,
    }: {
      brandId: string;
      payload: UpdateBrandPayload;
    }) => updateBrand(brandId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: BRAND_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: BRAND_QUERY_KEYS.detail(variables.brandId),
      });
    },
  });
}
