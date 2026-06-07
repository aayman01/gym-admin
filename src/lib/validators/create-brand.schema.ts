import { z } from 'zod';
import { slugifyTitle } from '@/lib/validators/create-product.schema';
import type {
  CreateBrandPayload,
  UpdateBrandPayload,
} from '@/types/brand-type';

const slugSchema = z
  .string()
  .trim()
  .min(1, 'Slug is required')
  .max(255)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/i,
    'Slug must be URL-safe (letters, numbers, hyphens)',
  );

export const createBrandFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(255),
  slug: slugSchema,
  status: z.enum(['ACTIVE', 'INACTIVE', 'DRAFT']),
  logoId: z.string().uuid().nullable().optional(),
  logoUrl: z.string().optional(),
});

export type CreateBrandFormValues = z.infer<typeof createBrandFormSchema>;

export const defaultCreateBrandFormValues: CreateBrandFormValues = {
  name: '',
  slug: '',
  status: 'ACTIVE',
  logoId: null,
  logoUrl: '',
};

export { slugifyTitle };

export function formValuesToCreatePayload(
  values: CreateBrandFormValues,
): CreateBrandPayload {
  return {
    name: values.name,
    slug: values.slug,
    status: values.status,
    logoId: values.logoId ?? undefined,
  };
}

export function formValuesToUpdatePayload(
  values: CreateBrandFormValues,
): UpdateBrandPayload {
  return {
    name: values.name,
    slug: values.slug,
    status: values.status,
    logoId: values.logoId ?? null,
  };
}
