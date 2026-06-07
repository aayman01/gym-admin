import type { Brand } from '@/types/brand-type';
import type { CreateBrandFormValues } from '@/lib/validators/create-brand.schema';

export function brandToFormValues(brand: Brand): CreateBrandFormValues {
  return {
    name: brand.name,
    slug: brand.slug,
    status: brand.status,
    logoId: brand.logoId,
    logoUrl: brand.logoUrl ?? '',
  };
}
