export function cartesianProduct<T>(arrays: T[][]): T[][] {
  if (!arrays.length) return [];
  return arrays.reduce<T[][]>(
    (acc, curr) => acc.flatMap((a) => curr.map((b) => [...a, b])),
    [[]],
  );
}

export type SelectedAttribute = {
  attributeId: string;
  optionIds: string[];
};

export type ProductVariantRow = {
  sku: string;
  price: number;
  quantity: number;
  optionIds: string[];
  displayImageId?: string | null;
  galleryImageIds?: string[];
  displayImageUrl?: string;
  galleryPreviewUrls?: Record<string, string>;
};

export type GalleryPickTarget =
  | 'thumbnail'
  | 'shared'
  | 'base'
  | string;

export const GALLERY_PICK_THUMBNAIL = 'thumbnail' as const;
export const GALLERY_PICK_SHARED = 'shared' as const;
export const GALLERY_PICK_BASE = 'base' as const;

export function getVariantKey(optionIds: string[]): string {
  return [...optionIds].sort().join('|');
}

export function optionIdsMatch(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((id, i) => id === b[i]);
}

export function hasVariableProduct(attributes: SelectedAttribute[]): boolean {
  return attributes.some((a) => a.optionIds.length > 0);
}

export function buildVariantOptionCombos(
  selectedAttributes: SelectedAttribute[],
): string[][] {
  if (!hasVariableProduct(selectedAttributes)) return [];
  const arrays = selectedAttributes
    .slice()
    .sort((a, b) => a.attributeId.localeCompare(b.attributeId))
    .map((sa) => sa.optionIds.slice());
  return cartesianProduct(arrays);
}

export function mergeVariantsFromCombos(
  combos: string[][],
  previous: ProductVariantRow[],
  defaults: { price: number; slug: string },
): ProductVariantRow[] {
  if (!combos.length) return [];

  return combos.map((optionIds, index) => {
    const existing = previous.find((v) => optionIdsMatch(v.optionIds, optionIds));
    if (existing) {
      return { ...existing, optionIds };
    }
    return {
      sku: `${defaults.slug || 'product'}-${index + 1}`.toUpperCase(),
      price: defaults.price,
      quantity: 0,
      optionIds,
      displayImageId: null,
      galleryImageIds: [],
      displayImageUrl: '',
      galleryPreviewUrls: {},
    };
  });
}

export function getGalleryPickTargetLabel(
  target: GalleryPickTarget,
  variantLabels?: Record<string, string>,
): string {
  if (target === GALLERY_PICK_THUMBNAIL) return 'Thumbnail';
  if (target === GALLERY_PICK_SHARED) return 'Shared product gallery';
  if (target === GALLERY_PICK_BASE) return 'Base variant images';
  return variantLabels?.[target] ?? 'Variant images';
}

export function checkDuplicateSkus(variants: ProductVariantRow[]): string | null {
  const seen = new Set<string>();
  for (const variant of variants) {
    const sku = variant.sku.trim().toLowerCase();
    if (!sku) continue;
    if (seen.has(sku)) return `Duplicate SKU: ${variant.sku}`;
    seen.add(sku);
  }
  return null;
}
