import { useMemo } from 'react';
import { useWatch } from 'react-hook-form';
import { useGetProductAttributesByIds } from '@/hooks/api/admin/use-product-attributes';
import { getVariantKey } from '@/lib/product-variant-utils';
import type { CreateProductFormValues } from '@/lib/validators/create-product.schema';

export function useVariantOptionLabels() {
  const selectedAttributes =
    useWatch<CreateProductFormValues, 'selectedAttributes'>({
      name: 'selectedAttributes',
    }) ?? [];
  const variants =
    useWatch<CreateProductFormValues, 'variants'>({ name: 'variants' }) ?? [];

  const attributeIds = useMemo(
    () => selectedAttributes.map((a) => a.attributeId),
    [selectedAttributes],
  );
  const attributeQueries = useGetProductAttributesByIds(attributeIds);

  return useMemo(() => {
    const optionLabelById = new Map<string, string>();
    for (const query of attributeQueries) {
      if (!query.data) continue;
      for (const option of query.data.options) {
        optionLabelById.set(option.id, option.value);
      }
    }

    const labels: Record<string, string> = {};
    for (const variant of variants) {
      const key = getVariantKey(variant.optionIds);
      labels[key] = variant.optionIds
        .map((id) => optionLabelById.get(id) ?? id)
        .join(' + ');
    }
    return labels;
  }, [attributeQueries, variants]);
}
