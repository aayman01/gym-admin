import type { SiteSettings } from '@/types/site-settings-type';
import type { SiteSettingsFormValues } from '@/lib/validators/site-settings.schema';

export function mapSiteSettingsToFormValues(
  settings: SiteSettings,
): SiteSettingsFormValues {
  return {
    siteName: settings.siteName,
    siteUrl: settings.siteUrl ?? '',
    metaTitle: settings.metaTitle ?? '',
    metaDescription: settings.metaDescription ?? '',
    metaKeywords: settings.metaKeywords ?? '',
    copyrightText: settings.copyrightText ?? '',
    primaryColor: settings.primaryColor ?? '',
    primaryHoverColor: settings.primaryHoverColor ?? '',
    headerLogoId: settings.headerLogoId,
    headerLogoUrl: settings.headerLogoUrl ?? '',
    footerLogoId: settings.footerLogoId,
    footerLogoUrl: settings.footerLogoUrl ?? '',
    emailLogoId: settings.emailLogoId,
    emailLogoUrl: settings.emailLogoUrl ?? '',
    faviconId: settings.faviconId,
    faviconUrl: settings.faviconUrl ?? '',
  };
}
