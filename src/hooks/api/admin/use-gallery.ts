import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { GalleryItem, GetGalleryQuery } from '@/types/gallery-type';
import type { PaginatedList } from '@/types/pagination-type';

const BASE_URL = '/admin/gallery';

export const GALLERY_QUERY_KEYS = {
  all: ['admin-gallery'] as const,
  lists: () => [...GALLERY_QUERY_KEYS.all, 'list'] as const,
  list: (query: GetGalleryQuery) =>
    [...GALLERY_QUERY_KEYS.lists(), query] as const,
};

export async function getGallery(query: GetGalleryQuery = {}) {
  return api.get<PaginatedList<GalleryItem>>(BASE_URL, {
    params: { page: 1, limit: 24, ...query },
  });
}

export async function addToGallery(mediaId: string) {
  return api.post<GalleryItem>(BASE_URL, { mediaId });
}

export function useGetGallery(
  query: GetGalleryQuery = {},
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: GALLERY_QUERY_KEYS.list(query),
    queryFn: () => getGallery(query),
    enabled: options?.enabled ?? true,
  });
}

export function useAddToGallery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addToGallery,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GALLERY_QUERY_KEYS.lists() });
    },
  });
}
