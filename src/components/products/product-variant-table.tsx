import { useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PickedImageChips } from '@/components/products/picked-image-chips';
import { productCompactInputClassName } from '@/components/products/product-form.constants';
import { useAutoVariants } from '@/hooks/use-auto-variants';
import { useGetProductAttributesByIds } from '@/hooks/api/admin/use-product-attributes';
import {
  getVariantKey,
  hasVariableProduct,
  type GalleryPickTarget,
} from '@/lib/product-variant-utils';
import type { CreateProductFormValues } from '@/lib/validators/create-product.schema';

type ProductVariantTableProps = {
  activePickTarget: GalleryPickTarget | null;
  onSetPickTarget: (target: GalleryPickTarget) => void;
};

export function ProductVariantTable({
  activePickTarget,
  onSetPickTarget,
}: ProductVariantTableProps) {
  const { setValue, getValues, formState } =
    useFormContext<CreateProductFormValues>();
  const selectedAttributes =
    useWatch<CreateProductFormValues, 'selectedAttributes'>({
      name: 'selectedAttributes',
    }) ?? [];
  const variants =
    useWatch<CreateProductFormValues, 'variants'>({ name: 'variants' }) ?? [];

  useAutoVariants();

  const attributeIds = useMemo(
    () => selectedAttributes.map((a) => a.attributeId),
    [selectedAttributes],
  );
  const attributeQueries = useGetProductAttributesByIds(attributeIds);

  const optionLabelById = useMemo(() => {
    const map = new Map<string, string>();
    for (const query of attributeQueries) {
      if (!query.data) continue;
      for (const option of query.data.options) {
        map.set(option.id, option.value);
      }
    }
    return map;
  }, [attributeQueries]);

  const updateVariant = (
    index: number,
    field: 'sku' | 'price' | 'quantity',
    value: string,
  ) => {
    const current = [...getValues('variants')];
    const variant = { ...current[index] };
    if (field === 'sku') variant.sku = value;
    if (field === 'price') variant.price = Number(value) || 0;
    if (field === 'quantity') variant.quantity = Number(value) || 0;
    current[index] = variant;
    setValue('variants', current, { shouldValidate: true });
  };

  const removeVariantImage = (variantIndex: number, imageId: string) => {
    const current = [...getValues('variants')];
    const variant = { ...current[variantIndex] };
    const galleryIds = (variant.galleryImageIds ?? []).filter(
      (id) => id !== imageId,
    );
    const previewUrls = { ...(variant.galleryPreviewUrls ?? {}) };
    delete previewUrls[imageId];
    variant.galleryImageIds = galleryIds;
    variant.galleryPreviewUrls = previewUrls;
    if (variant.displayImageId === imageId) {
      variant.displayImageId = galleryIds[0] ?? null;
      variant.displayImageUrl = galleryIds[0]
        ? (previewUrls[galleryIds[0]] ?? '')
        : '';
    }
    current[variantIndex] = variant;
    setValue('variants', current, { shouldValidate: true });
  };

  if (!hasVariableProduct(selectedAttributes)) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium">Variants</p>
        <p className="text-xs text-muted-foreground">
          {variants.length} combination{variants.length === 1 ? '' : 's'}{' '}
          generated from selected options.
        </p>
      </div>

      {variants.length > 0 && (
        <div className="overflow-x-auto rounded-sm border border-primary/10">
          <Table>
            <TableHeader>
              <TableRow className="border-primary/10 hover:bg-transparent">
                <TableHead>Options</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Images</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {variants.map((variant, index) => {
                const variantKey = getVariantKey(variant.optionIds);
                const isActiveTarget = activePickTarget === variantKey;
                const galleryItems = (variant.galleryImageIds ?? []).map(
                  (id) => ({
                    id,
                    url:
                      variant.galleryPreviewUrls?.[id] ??
                      variant.displayImageUrl ??
                      '',
                  }),
                );

                return (
                  <TableRow
                    key={variantKey}
                    className="border-primary/10 hover:bg-primary/5"
                  >
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {variant.optionIds.map((optionId) => (
                          <Badge
                            key={optionId}
                            className="rounded-full border-0 bg-primary/10 text-[10px] uppercase tracking-wider text-primary"
                          >
                            {optionLabelById.get(optionId) ?? optionId}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Input
                        value={variant.sku}
                        onChange={(e) =>
                          updateVariant(index, 'sku', e.target.value)
                        }
                        className={productCompactInputClassName}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        value={variant.price}
                        onChange={(e) =>
                          updateVariant(index, 'price', e.target.value)
                        }
                        className={`w-24 ${productCompactInputClassName}`}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        value={variant.quantity}
                        onChange={(e) =>
                          updateVariant(index, 'quantity', e.target.value)
                        }
                        className={`w-20 ${productCompactInputClassName}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap items-center gap-2">
                        <PickedImageChips
                          items={galleryItems}
                          size="sm"
                          onRemove={(id) => removeVariantImage(index, id)}
                        />
                        <button
                          type="button"
                          onClick={() => onSetPickTarget(variantKey)}
                          className={`text-xs font-medium ${
                            isActiveTarget
                              ? 'text-primary'
                              : 'text-muted-foreground hover:text-primary'
                          }`}
                        >
                          Add →
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {formState.errors.variants && (
        <p className="text-xs text-destructive">
          {formState.errors.variants.message}
        </p>
      )}
    </div>
  );
}

export function BaseVariantFields({
  activePickTarget,
  onSetPickTarget,
}: {
  activePickTarget: GalleryPickTarget | null;
  onSetPickTarget: (target: GalleryPickTarget) => void;
}) {
  const { register, setValue, getValues, formState } =
    useFormContext<CreateProductFormValues>();
  const selectedAttributes =
    useWatch<CreateProductFormValues, 'selectedAttributes'>({
      name: 'selectedAttributes',
    }) ?? [];
  const baseVariant = useWatch<CreateProductFormValues, 'baseVariant'>({
    name: 'baseVariant',
  });

  if (hasVariableProduct(selectedAttributes)) {
    return null;
  }

  const galleryItems = (baseVariant?.galleryImageIds ?? []).map((id) => ({
    id,
    url:
      baseVariant?.galleryPreviewUrls?.[id] ??
      baseVariant?.displayImageUrl ??
      '',
  }));

  const removeBaseImage = (imageId: string) => {
    const bv = getValues('baseVariant');
    if (!bv) return;
    const galleryIds = (bv.galleryImageIds ?? []).filter((id) => id !== imageId);
    const previewUrls = { ...(bv.galleryPreviewUrls ?? {}) };
    delete previewUrls[imageId];
    setValue(
      'baseVariant',
      {
        ...bv,
        galleryImageIds: galleryIds,
        galleryPreviewUrls: previewUrls,
        displayImageId:
          bv.displayImageId === imageId ? (galleryIds[0] ?? null) : bv.displayImageId,
        displayImageUrl:
          bv.displayImageId === imageId
            ? (galleryIds[0] ? previewUrls[galleryIds[0]] : '')
            : bv.displayImageUrl,
      },
      { shouldValidate: true },
    );
  };

  return (
    <div className="space-y-3 rounded-sm border border-primary/10 p-4">
      <p className="text-sm font-medium">Base variant</p>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="baseSku">SKU</Label>
          <Input
            id="baseSku"
            className={productCompactInputClassName}
            {...register('baseVariant.sku')}
          />
          {formState.errors.baseVariant?.sku && (
            <p className="text-xs text-destructive">
              {formState.errors.baseVariant.sku.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="baseVariantPrice">Price</Label>
          <Input
            id="baseVariantPrice"
            type="number"
            min={0}
            step="0.01"
            className={productCompactInputClassName}
            {...register('baseVariant.price', { valueAsNumber: true })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="baseVariantQty">Quantity</Label>
          <Input
            id="baseVariantQty"
            type="number"
            min={0}
            className={productCompactInputClassName}
            {...register('baseVariant.quantity', { valueAsNumber: true })}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Variant images</Label>
        <div className="flex flex-wrap items-center gap-2">
          <PickedImageChips
            items={galleryItems}
            size="sm"
            onRemove={removeBaseImage}
          />
          <button
            type="button"
            onClick={() => onSetPickTarget('base')}
            className={`text-xs font-medium ${
              activePickTarget === 'base'
                ? 'text-primary'
                : 'text-muted-foreground hover:text-primary'
            }`}
          >
            Add →
          </button>
        </div>
      </div>
    </div>
  );
}
