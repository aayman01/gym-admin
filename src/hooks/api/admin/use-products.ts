import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { PaginatedList } from '@/types/pagination-type';
import type {
  CreateProductPayload,
  GetProductsQuery,
  Product,
  UpdateProductPayload,
} from '@/types/product-type';

const BASE_URL = '/admin/products';

export const PRODUCT_QUERY_KEYS = {
  all: ['admin-products'] as const,
  lists: () => [...PRODUCT_QUERY_KEYS.all, 'list'] as const,
  list: (query: GetProductsQuery) =>
    [...PRODUCT_QUERY_KEYS.lists(), query] as const,
  details: () => [...PRODUCT_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...PRODUCT_QUERY_KEYS.details(), id] as const,
};

export async function getProducts(query: GetProductsQuery = {}) {
  return api.get<PaginatedList<Product>>(BASE_URL, { params: query });
}

export async function getProduct(productId: string) {
  return api.get<Product>(`${BASE_URL}/${productId}`);
}

export async function createProduct(payload: CreateProductPayload) {
  return api.post<Product>(BASE_URL, payload);
}

export async function updateProduct(
  productId: string,
  payload: UpdateProductPayload,
) {
  return api.patch<Product>(`${BASE_URL}/${productId}`, payload);
}

export function useGetProducts(
  query: GetProductsQuery = {},
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: PRODUCT_QUERY_KEYS.list(query),
    queryFn: () => getProducts(query),
    enabled: options?.enabled ?? true,
  });
}

export function useGetProduct(
  productId: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: PRODUCT_QUERY_KEYS.detail(productId),
    queryFn: () => getProduct(productId),
    enabled: options?.enabled ?? Boolean(productId),
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_QUERY_KEYS.lists() });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      payload,
    }: {
      productId: string;
      payload: UpdateProductPayload;
    }) => updateProduct(productId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: PRODUCT_QUERY_KEYS.detail(variables.productId),
      });
    },
  });
}
