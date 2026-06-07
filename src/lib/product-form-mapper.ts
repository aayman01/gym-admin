import type { Product, ProductVariant } from '@/types/product-type';
import type { SelectedAttribute } from '@/lib/product-variant-utils';
import type { CreateProductFormValues } from '@/lib/validators/create-product.schema';

function buildGalleryPreviewMap(
  images: Array<{ image: { id: string; url: string } }>,
): Record<string, string> {
  return Object.fromEntries(images.map((s) => [s.image.id, s.image.url]));
}

function deriveSelectedAttributes(
  variants: ProductVariant[],
): SelectedAttribute[] {
  const byAttr = new Map<string, Set<string>>();

  for (const variant of variants) {
    if (variant.isBase) continue;
    for (const attr of variant.attributes) {
      const attributeId = attr.option.attribute.id;
      if (!byAttr.has(attributeId)) {
        byAttr.set(attributeId, new Set());
      }
      byAttr.get(attributeId)!.add(attr.option.id);
    }
  }

  return [...byAttr.entries()]
    .map(([attributeId, optionIds]) => ({
      attributeId,
      optionIds: [...optionIds].sort(),
    }))
    .sort((a, b) => a.attributeId.localeCompare(b.attributeId));
}

function variantOptionIds(
  variant: ProductVariant,
  attributeOrder: string[],
): string[] {
  const byAttr = new Map<string, string>();
  for (const attr of variant.attributes) {
    byAttr.set(attr.option.attribute.id, attr.option.id);
  }
  return attributeOrder.map((attributeId) => byAttr.get(attributeId)!);
}

function mapVariantToFormRow(
  variant: ProductVariant,
  attributeOrder: string[],
): CreateProductFormValues['variants'][number] {
  const galleryImageIds = variant.sampleImages.map((s) => s.image.id);
  return {
    sku: variant.sku,
    price: Number(variant.price),
    quantity: variant.inventory?.quantityOnHand ?? variant.quantity ?? 0,
    optionIds: variantOptionIds(variant, attributeOrder),
    displayImageId: variant.displayImage?.id ?? null,
    displayImageUrl: variant.displayImage?.url ?? '',
    galleryImageIds,
    galleryPreviewUrls: buildGalleryPreviewMap(variant.sampleImages),
  };
}

function mapBaseVariant(
  variant: ProductVariant,
): NonNullable<CreateProductFormValues['baseVariant']> {
  const galleryImageIds = variant.sampleImages.map((s) => s.image.id);
  return {
    sku: variant.sku,
    price: Number(variant.price),
    quantity: variant.inventory?.quantityOnHand ?? variant.quantity ?? 0,
    displayImageId: variant.displayImage?.id ?? null,
    displayImageUrl: variant.displayImage?.url ?? '',
    galleryImageIds,
    galleryPreviewUrls: buildGalleryPreviewMap(variant.sampleImages),
  };
}

export function productToFormValues(product: Product): CreateProductFormValues {
  const productGalleryImageIds = product.sampleImages.map((s) => s.image.id);
  const productGalleryPreviewUrls = buildGalleryPreviewMap(product.sampleImages);

  const isVariable = product.variants.some((v) => v.attributes.length > 0);
  const selectedAttributes = isVariable
    ? deriveSelectedAttributes(product.variants)
    : [];
  const attributeOrder = selectedAttributes.map((a) => a.attributeId);

  const baseVariantSource =
    product.variants.find((v) => v.isBase) ?? product.variants[0];

  return {
    title: product.title,
    slug: product.slug,
    primaryCategoryId: product.category.id,
    secondaryCategoryIds: product.secondaryCategories.map((s) => s.category.id),
    thumbnailId: product.thumbnail?.id ?? null,
    thumbnailUrl: product.thumbnail?.url ?? '',
    brandId: product.brand?.id ?? null,
    status: product.status,
    basePrice: Number(product.basePrice),
    type: product.type,
    isFeature: product.isFeature,
    sellingUnit: product.sellingUnit,
    lowStockThreshold: product.lowStockThreshold,
    tagsInput: product.tags.join(', '),
    summary: product.summary ?? '',
    description: product.description ?? '',
    metaTitle: product.metaTitle ?? '',
    metaKeywords: product.metaKeywords ?? '',
    metaDescription: product.metaDescription ?? '',
    taxId: product.tax?.id ?? product.taxId ?? null,
    isTaxIncluded: product.isTaxIncluded,
    isFragile: product.isFragile,
    isPerishable: product.isPerishable,
    productGalleryImageIds,
    productGalleryPreviewUrls,
    selectedAttributes,
    baseVariant: baseVariantSource ? mapBaseVariant(baseVariantSource) : undefined,
    variants: isVariable
      ? product.variants
          .filter((v) => !v.isBase && v.attributes.length > 0)
          .map((v) => mapVariantToFormRow(v, attributeOrder))
      : [],
  };
}
