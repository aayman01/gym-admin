import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type {
  Category,
  CreateCategoryPayload,
  GetCategoriesQuery,
  UpdateCategoryPayload,
} from '@/types/category-type';
import type { PaginatedList } from '@/types/pagination-type';

const BASE_URL = '/admin/categories';

export const CATEGORY_QUERY_KEYS = {
  all: ['admin-categories'] as const,
  lists: () => [...CATEGORY_QUERY_KEYS.all, 'list'] as const,
  list: (query: GetCategoriesQuery) =>
    [...CATEGORY_QUERY_KEYS.lists(), query] as const,
  details: () => [...CATEGORY_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...CATEGORY_QUERY_KEYS.details(), id] as const,
};

export async function getCategories(query: GetCategoriesQuery = {}) {
  return api.get<PaginatedList<Category>>(BASE_URL, {
    params: { page: 1, limit: 100, ...query },
  });
}

export async function getCategory(categoryId: string) {
  return api.get<Category>(`${BASE_URL}/${categoryId}`);
}

export async function createCategory(payload: CreateCategoryPayload) {
  return api.post<Category>(BASE_URL, payload);
}

export async function updateCategory(
  categoryId: string,
  payload: UpdateCategoryPayload,
) {
  return api.patch<Category>(`${BASE_URL}/${categoryId}`, payload);
}

export async function deleteCategory(categoryId: string) {
  return api.delete<Category>(`${BASE_URL}/${categoryId}`);
}

export function useGetCategories(
  query: GetCategoriesQuery = {},
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: CATEGORY_QUERY_KEYS.list(query),
    queryFn: () => getCategories(query),
    enabled: options?.enabled ?? true,
  });
}

export function useGetCategory(
  categoryId: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: CATEGORY_QUERY_KEYS.detail(categoryId),
    queryFn: () => getCategory(categoryId),
    enabled: options?.enabled ?? Boolean(categoryId),
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_QUERY_KEYS.lists() });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      categoryId,
      payload,
    }: {
      categoryId: string;
      payload: UpdateCategoryPayload;
    }) => updateCategory(categoryId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: CATEGORY_QUERY_KEYS.detail(variables.categoryId),
      });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_QUERY_KEYS.lists() });
    },
  });
}
