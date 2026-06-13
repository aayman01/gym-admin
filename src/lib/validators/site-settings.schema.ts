import { z } from 'zod';
import type { UpdateSiteSettingsPayload } from '@/types/site-settings-type';

export const siteSettingsFormSchema = z.object({
  siteName: z.string().trim().min(1, 'Site name is required').max(255),
  siteUrl: z.string().trim().max(500).optional().or(z.literal('')),
  metaTitle: z.string().trim().max(255).optional().or(z.literal('')),
  metaDescription: z.string().trim().max(5000).optional().or(z.literal('')),
  metaKeywords: z.string().trim().max(2000).optional().or(z.literal('')),
  copyrightText: z.string().trim().max(500).optional().or(z.literal('')),
  primaryColor: z.string().trim().max(20).optional().or(z.literal('')),
  primaryHoverColor: z.string().trim().max(20).optional().or(z.literal('')),
  headerLogoId: z.string().uuid().nullable().optional(),
  headerLogoUrl: z.string().optional(),
  footerLogoId: z.string().uuid().nullable().optional(),
  footerLogoUrl: z.string().optional(),
  emailLogoId: z.string().uuid().nullable().optional(),
  emailLogoUrl: z.string().optional(),
  faviconId: z.string().uuid().nullable().optional(),
  faviconUrl: z.string().optional(),
});

export type SiteSettingsFormValues = z.infer<typeof siteSettingsFormSchema>;

export const defaultSiteSettingsFormValues: SiteSettingsFormValues = {
  siteName: '',
  siteUrl: '',
  metaTitle: '',
  metaDescription: '',
  metaKeywords: '',
  copyrightText: '',
  primaryColor: '',
  primaryHoverColor: '',
  headerLogoId: null,
  headerLogoUrl: '',
  footerLogoId: null,
  footerLogoUrl: '',
  emailLogoId: null,
  emailLogoUrl: '',
  faviconId: null,
  faviconUrl: '',
};

function emptyToNull(value: string | undefined): string | null | undefined {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

export function formValuesToUpdatePayload(
  values: SiteSettingsFormValues,
): UpdateSiteSettingsPayload {
  return {
    siteName: values.siteName,
    siteUrl: emptyToNull(values.siteUrl),
    metaTitle: emptyToNull(values.metaTitle),
    metaDescription: emptyToNull(values.metaDescription),
    metaKeywords: emptyToNull(values.metaKeywords),
    copyrightText: emptyToNull(values.copyrightText),
    primaryColor: emptyToNull(values.primaryColor),
    primaryHoverColor: emptyToNull(values.primaryHoverColor),
    headerLogoId: values.headerLogoId ?? null,
    footerLogoId: values.footerLogoId ?? null,
    emailLogoId: values.emailLogoId ?? null,
    faviconId: values.faviconId ?? null,
  };
}
