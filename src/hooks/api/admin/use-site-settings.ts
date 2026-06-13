import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type {
  SiteSettings,
  UpdateSiteSettingsPayload,
} from '@/types/site-settings-type';

const BASE_URL = '/admin/site-settings';

export const SITE_SETTINGS_QUERY_KEYS = {
  all: ['admin-site-settings'] as const,
  detail: () => [...SITE_SETTINGS_QUERY_KEYS.all, 'detail'] as const,
};

export async function getSiteSettings() {
  return api.get<SiteSettings>(BASE_URL);
}

export async function updateSiteSettings(payload: UpdateSiteSettingsPayload) {
  return api.patch<SiteSettings>(BASE_URL, payload);
}

export function useGetSiteSettings() {
  return useQuery({
    queryKey: SITE_SETTINGS_QUERY_KEYS.detail(),
    queryFn: getSiteSettings,
  });
}

export function useUpdateSiteSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSiteSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: SITE_SETTINGS_QUERY_KEYS.detail(),
      });
    },
  });
}
