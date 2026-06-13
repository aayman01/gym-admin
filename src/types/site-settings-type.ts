export type SiteSettings = {
  id: string;
  siteName: string;
  siteUrl: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  copyrightText: string | null;
  primaryColor: string | null;
  primaryHoverColor: string | null;
  currency: string;
  description: string | null;
  headerLogoId: string | null;
  headerLogoUrl: string | null;
  footerLogoId: string | null;
  footerLogoUrl: string | null;
  emailLogoId: string | null;
  emailLogoUrl: string | null;
  faviconId: string | null;
  faviconUrl: string | null;
  updatedAt: string;
};

export type UpdateSiteSettingsPayload = {
  siteName?: string;
  siteUrl?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  copyrightText?: string | null;
  primaryColor?: string | null;
  primaryHoverColor?: string | null;
  currency?: string;
  description?: string | null;
  headerLogoId?: string | null;
  footerLogoId?: string | null;
  emailLogoId?: string | null;
  faviconId?: string | null;
};
