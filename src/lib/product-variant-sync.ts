import type { SelectedAttribute } from '@/lib/product-variant-utils';
import type { CreateProductFormValues } from '@/lib/validators/create-product.schema';

export type FormVariantRow = CreateProductFormValues['variants'][number];

export function selectedAttributesComboKey(
  attributes: SelectedAttribute[],
): string {
  return attributes
    .map(
      (a) =>
        `${a.attributeId}:${[...a.optionIds].sort().join(',')}`,
    )
    .sort()
    .join('|');
}

function sortedIds(ids: string[] | undefined): string[] {
  return [...(ids ?? [])].sort();
}

function variantRowEqual(a: FormVariantRow, b: FormVariantRow): boolean {
  if (a.sku !== b.sku) return false;
  if (a.price !== b.price) return false;
  if (a.quantity !== b.quantity) return false;
  if ((a.displayImageId ?? null) !== (b.displayImageId ?? null)) return false;

  const aOptions = [...a.optionIds].sort().join(',');
  const bOptions = [...b.optionIds].sort().join(',');
  if (aOptions !== bOptions) return false;

  const aGallery = sortedIds(a.galleryImageIds).join(',');
  const bGallery = sortedIds(b.galleryImageIds).join(',');
  return aGallery === bGallery;
}

export function variantsEqual(
  a: FormVariantRow[],
  b: FormVariantRow[],
): boolean {
  if (a.length !== b.length) return false;
  return a.every((row, index) => variantRowEqual(row, b[index]));
}
