import { z } from 'zod';

const slugSchema = z
  .string()
  .trim()
  .min(1, 'Slug is required')
  .max(255)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/i,
    'Slug must be URL-safe (letters, numbers, hyphens)',
  );

const variantSchema = z.object({
  sku: z.string().trim().min(1, 'SKU is required').max(100),
  price: z.number().min(0, 'Price must be 0 or greater'),
  quantity: z.number().int().min(0),
  optionIds: z.array(z.string().uuid()).min(1),
  displayImageId: z.string().uuid().nullable().optional(),
  galleryImageIds: z.array(z.string().uuid()).optional(),
  displayImageUrl: z.string().optional(),
  galleryPreviewUrls: z.record(z.string(), z.string()).optional(),
});

const baseVariantSchema = z.object({
  sku: z.string().trim().min(1, 'SKU is required').max(100),
  price: z.number().min(0, 'Price must be 0 or greater'),
  quantity: z.number().int().min(0),
  displayImageId: z.string().uuid().nullable().optional(),
  galleryImageIds: z.array(z.string().uuid()).optional(),
  displayImageUrl: z.string().optional(),
  galleryPreviewUrls: z.record(z.string(), z.string()).optional(),
});

const selectedAttributeSchema = z.object({
  attributeId: z.string().uuid(),
  optionIds: z
    .array(z.string().uuid())
    .min(1, 'Select at least one option'),
});

export const createProductFormSchema = z
  .object({
    title: z.string().trim().min(1, 'Title is required').max(255),
    slug: slugSchema,
    primaryCategoryId: z.string().uuid('Select a primary category'),
    secondaryCategoryIds: z.array(z.string().uuid()),
    thumbnailId: z.string().uuid().nullable().optional(),
    thumbnailUrl: z.string().optional(),
    brandId: z.string().uuid().nullable().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'DRAFT']),
    basePrice: z.number().min(0),
    type: z.enum(['PHYSICAL', 'DIGITAL', 'SERVICE']),
    isFeature: z.boolean(),
    sellingUnit: z.enum([
      'PIECE',
      'KG',
      'GRAM',
      'LITER',
      'MILLILITER',
      'METER',
      'CENTIMETER',
      'SQUARE_METER',
      'CUBIC_METER',
      'DOZEN',
      'PACK',
      'BOX',
      'SET',
      'PAIR',
    ]),
    lowStockThreshold: z.number().int().min(0),
    tagsInput: z.string(),
    summary: z.string().max(500).nullable().optional(),
    description: z.string().max(10000).nullable().optional(),
    metaTitle: z.string().max(255).nullable().optional(),
    metaKeywords: z.string().max(255).nullable().optional(),
    metaDescription: z.string().max(1000).nullable().optional(),
    taxId: z.string().uuid().nullable().optional(),
    isTaxIncluded: z.boolean(),
    isFragile: z.boolean(),
    isPerishable: z.boolean(),
    productGalleryImageIds: z.array(z.string().uuid()),
    productGalleryPreviewUrls: z.record(z.string(), z.string()),
    selectedAttributes: z.array(selectedAttributeSchema),
    baseVariant: baseVariantSchema.optional(),
    variants: z.array(variantSchema),
  })
  .superRefine((data, ctx) => {
    if (
      data.secondaryCategoryIds.length &&
      data.secondaryCategoryIds.includes(data.primaryCategoryId)
    ) {
      ctx.addIssue({
        code: 'custom',
        message: 'Primary category cannot be a secondary category',
        path: ['secondaryCategoryIds'],
      });
    }

    const tags = data.tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    if (new Set(tags).size !== tags.length) {
      ctx.addIssue({
        code: 'custom',
        message: 'Tags must be unique',
        path: ['tagsInput'],
      });
    }
    for (const tag of tags) {
      if (tag.length > 30) {
        ctx.addIssue({
          code: 'custom',
          message: 'Each tag must be 30 characters or fewer',
          path: ['tagsInput'],
        });
      }
    }

    const isVariable = data.selectedAttributes.some(
      (a) => a.optionIds.length > 0,
    );

    if (!isVariable) {
      if (!data.baseVariant?.sku) {
        ctx.addIssue({
          code: 'custom',
          message: 'SKU is required',
          path: ['baseVariant', 'sku'],
        });
      }
      return;
    }

    if (!data.variants.length) {
      ctx.addIssue({
        code: 'custom',
        message: 'Select attribute options to generate variants',
        path: ['variants'],
      });
    }

    const expectedCount = data.selectedAttributes.length;
    const seen = new Set<string>();

    data.variants.forEach((variant, index) => {
      if (variant.optionIds.length !== expectedCount) {
        ctx.addIssue({
          code: 'custom',
          message: 'Each variant must have one option per attribute',
          path: ['variants', index, 'optionIds'],
        });
      }

      const key = [...variant.optionIds].sort().join(',');
      if (seen.has(key)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Duplicate variant combination',
          path: ['variants', index],
        });
      }
      seen.add(key);
    });
  });

export type CreateProductFormValues = z.infer<typeof createProductFormSchema>;

export const defaultCreateProductFormValues: CreateProductFormValues = {
  title: '',
  slug: '',
  primaryCategoryId: '',
  secondaryCategoryIds: [],
  thumbnailId: null,
  thumbnailUrl: '',
  brandId: null,
  status: 'ACTIVE',
  basePrice: 0,
  type: 'PHYSICAL',
  isFeature: false,
  sellingUnit: 'PIECE',
  lowStockThreshold: 0,
  tagsInput: '',
  summary: '',
  description: '',
  metaTitle: '',
  metaKeywords: '',
  metaDescription: '',
  taxId: null,
  isTaxIncluded: false,
  isFragile: false,
  isPerishable: false,
  productGalleryImageIds: [],
  productGalleryPreviewUrls: {},
  selectedAttributes: [],
  baseVariant: {
    sku: '',
    price: 0,
    quantity: 0,
    displayImageId: null,
    galleryImageIds: [],
    displayImageUrl: '',
    galleryPreviewUrls: {},
  },
  variants: [],
};

export function slugifyTitle(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function parseTagsInput(input: string): string[] {
  return input
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function formValuesToPayload(
  values: CreateProductFormValues,
): import('@/types/product-type').CreateProductPayload {
  const tags = parseTagsInput(values.tagsInput);
  const isVariable = values.selectedAttributes.some(
    (a) => a.optionIds.length > 0,
  );

  const payload: import('@/types/product-type').CreateProductPayload = {
    title: values.title,
    slug: values.slug,
    primaryCategoryId: values.primaryCategoryId,
    secondaryCategoryIds: values.secondaryCategoryIds.length
      ? values.secondaryCategoryIds
      : undefined,
    thumbnailId: values.thumbnailId ?? null,
    brandId: values.brandId ?? null,
    status: values.status,
    basePrice: values.basePrice,
    type: values.type,
    isFeature: values.isFeature,
    sellingUnit: values.sellingUnit,
    lowStockThreshold: values.lowStockThreshold,
    tags,
    summary: values.summary || null,
    description: values.description || null,
    metaTitle: values.metaTitle || null,
    metaKeywords: values.metaKeywords || null,
    metaDescription: values.metaDescription || null,
    taxId: values.taxId ?? null,
    isTaxIncluded: values.isTaxIncluded,
    isFragile: values.isFragile,
    isPerishable: values.isPerishable,
    productGalleryImageIds: values.productGalleryImageIds.length
      ? values.productGalleryImageIds
      : undefined,
  };

  if (isVariable) {
    payload.attributes = values.selectedAttributes;
    payload.variants = values.variants.map((variant) => ({
      sku: variant.sku,
      price: variant.price,
      quantity: variant.quantity ?? 0,
      optionIds: variant.optionIds,
      displayImageId: variant.displayImageId ?? null,
      galleryImageIds: variant.galleryImageIds?.length
        ? variant.galleryImageIds
        : undefined,
    }));
  } else if (values.baseVariant) {
    payload.baseVariant = {
      sku: values.baseVariant.sku,
      price: values.baseVariant.price,
      quantity: values.baseVariant.quantity ?? 0,
      displayImageId: values.baseVariant.displayImageId ?? null,
      galleryImageIds: values.baseVariant.galleryImageIds?.length
        ? values.baseVariant.galleryImageIds
        : undefined,
    };
  }

  return payload;
}