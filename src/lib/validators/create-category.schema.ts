import { z } from 'zod';
import { slugifyTitle } from '@/lib/validators/create-product.schema';
import type {
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from '@/types/category-type';

const slugSchema = z
  .string()
  .trim()
  .min(1, 'Slug is required')
  .max(255)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/i,
    'Slug must be URL-safe (letters, numbers, hyphens)',
  );

export const createCategoryFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(255),
  slug: slugSchema,
  status: z.enum(['ACTIVE', 'INACTIVE', 'DRAFT']),
  isFeature: z.boolean(),
  imageId: z.string().uuid().nullable().optional(),
  imageUrl: z.string().optional(),
});

export type CreateCategoryFormValues = z.infer<typeof createCategoryFormSchema>;

export const defaultCreateCategoryFormValues: CreateCategoryFormValues = {
  name: '',
  slug: '',
  status: 'ACTIVE',
  isFeature: false,
  imageId: null,
  imageUrl: '',
};

export { slugifyTitle };

export function formValuesToCreatePayload(
  values: CreateCategoryFormValues,
): CreateCategoryPayload {
  return {
    name: values.name,
    slug: values.slug,
    status: values.status,
    isFeature: values.isFeature,
    imageId: values.imageId ?? undefined,
  };
}

export function formValuesToUpdatePayload(
  values: CreateCategoryFormValues,
): UpdateCategoryPayload {
  return {
    name: values.name,
    slug: values.slug,
    status: values.status,
    isFeature: values.isFeature,
    imageId: values.imageId ?? null,
  };
}
