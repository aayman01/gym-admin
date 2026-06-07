import { useMemo, useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useGetProductAttributes,
  useGetProductAttributesByIds,
} from '@/hooks/api/admin/use-product-attributes';
import type { ProductAttributeDetail } from '@/types/product-attribute-type';
import type { SelectedAttribute } from '@/lib/product-variant-utils';
import type { CreateProductFormValues } from '@/lib/validators/create-product.schema';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 8;

type ProductAttributePickerProps = {
  form: UseFormReturn<CreateProductFormValues>;
};

function syncSelectedAttributes(
  form: UseFormReturn<CreateProductFormValues>,
  attributeId: string,
  optionIds: string[],
) {
  const current = form.getValues('selectedAttributes');
  const without = current.filter((a) => a.attributeId !== attributeId);
  const next: SelectedAttribute[] =
    optionIds.length > 0
      ? [...without, { attributeId, optionIds }].sort((a, b) =>
          a.attributeId.localeCompare(b.attributeId),
        )
      : without;
  form.setValue('selectedAttributes', next, { shouldValidate: true });
}

export function ProductAttributePicker({ form }: ProductAttributePickerProps) {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetProductAttributes({
    page,
    limit: PAGE_SIZE,
  });
  const selectedAttributes = form.watch('selectedAttributes');

  const pageAttributeIds = useMemo(
    () => (data?.data ?? []).map((a) => a.id),
    [data?.data],
  );

  const attributeQueries = useGetProductAttributesByIds(pageAttributeIds);

  const attributeDetails = useMemo(
    () =>
      attributeQueries
        .map((q) => q.data)
        .filter((d): d is ProductAttributeDetail => Boolean(d)),
    [attributeQueries],
  );

  const detailsById = useMemo(
    () => new Map(attributeDetails.map((d) => [d.id, d])),
    [attributeDetails],
  );

  const getSelectedOptionIds = (attributeId: string) =>
    selectedAttributes.find((a) => a.attributeId === attributeId)?.optionIds ??
    [];

  const toggleOption = (
    attributeId: string,
    optionId: string,
    checked: boolean,
  ) => {
    const current = getSelectedOptionIds(attributeId);
    const next = checked
      ? [...current, optionId]
      : current.filter((id) => id !== optionId);
    syncSelectedAttributes(form, attributeId, next);
  };

  const toggleSelectAll = (attributeId: string, checked: boolean) => {
    const detail = detailsById.get(attributeId);
    if (!detail) return;
    const next = checked ? detail.options.map((o) => o.id) : [];
    syncSelectedAttributes(form, attributeId, next);
  };

  const totalPages = data?.meta.totalPages ?? 1;

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium">Attributes</p>
        <p className="text-xs text-muted-foreground">
          Select options per attribute. Variants are generated automatically.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-sm" />
          ))}
        </div>
      ) : !data?.data.length ? (
        <p className="text-sm text-muted-foreground">
          No attributes defined yet.
        </p>
      ) : (
        <>
          {data.data.map((attribute) => {
            const detail = detailsById.get(attribute.id);
            const options = detail?.options ?? [];
            const selectedIds = getSelectedOptionIds(attribute.id);
            const allSelected =
              options.length > 0 && selectedIds.length === options.length;

            return (
              <div
                key={attribute.id}
                className="rounded-sm border border-primary/10 p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <Label className="font-medium">{attribute.name}</Label>
                  {options.length > 0 && (
                    <label className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Checkbox
                        checked={allSelected ? true : false}
                        onCheckedChange={(checked) =>
                          toggleSelectAll(attribute.id, checked === true)
                        }
                      />
                      Select all
                    </label>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {options.map((option) => {
                    const isSelected = selectedIds.includes(option.id);
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() =>
                          toggleOption(
                            attribute.id,
                            option.id,
                            !isSelected,
                          )
                        }
                        className={cn(
                          'rounded-full border px-3 py-1 text-xs transition-colors',
                          isSelected
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-primary/20 bg-primary/5 text-muted-foreground hover:border-primary/40',
                        )}
                      >
                        {option.value}
                      </button>
                    );
                  })}
                  {!detail && (
                    <span className="text-xs text-muted-foreground">
                      Loading options...
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
