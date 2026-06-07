import { useNavigate } from 'react-router-dom';
import { useFormContext, useWatch } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ProductAttributePicker } from '@/components/products/product-attribute-picker';
import { ProductFormSection } from '@/components/products/product-form-section';
import {
  BaseVariantFields,
  ProductVariantTable,
} from '@/components/products/product-variant-table';
import { productInputClassName, productSectionClassName } from '@/components/products/product-form.constants';
import { useGetBrands } from '@/hooks/api/admin/use-brands';
import { useGetCategories } from '@/hooks/api/admin/use-categories';
import { useGetTaxes } from '@/hooks/api/admin/use-taxes';
import type { GalleryPickTarget } from '@/lib/product-variant-utils';
import type { CreateProductFormValues } from '@/lib/validators/create-product.schema';

const SELLING_UNITS = [
  'PIECE',
  'KG',
  'GRAM',
  'LITER',
  'MILLILITER',
  'METER',
  'PACK',
  'BOX',
  'SET',
] as const;

type ProductFormMainFieldsProps = {
  pickTarget: GalleryPickTarget;
  onSetPickTarget: (target: GalleryPickTarget) => void;
  isPending: boolean;
  submitLabel: string;
};

function SecondaryCategoriesField() {
  const { setValue } = useFormContext<CreateProductFormValues>();
  const { data: categories } = useGetCategories();
  const primaryCategoryId = useWatch<CreateProductFormValues, 'primaryCategoryId'>({
    name: 'primaryCategoryId',
  });
  const secondaryCategoryIds =
    useWatch<CreateProductFormValues, 'secondaryCategoryIds'>({
      name: 'secondaryCategoryIds',
    }) ?? [];

  const toggleSecondaryCategory = (categoryId: string, checked: boolean) => {
    const next = checked
      ? [...secondaryCategoryIds, categoryId]
      : secondaryCategoryIds.filter((id) => id !== categoryId);
    setValue('secondaryCategoryIds', next, { shouldValidate: true });
  };

  return (
    <div className="space-y-2 sm:col-span-3">
      <Label>Secondary categories</Label>
      <div className="flex flex-wrap gap-3 rounded-sm bg-primary/5 p-3 ring-1 ring-primary/10">
        {categories?.data
          .filter((c) => c.id !== primaryCategoryId)
          .map((category) => (
            <label
              key={category.id}
              className="flex items-center gap-2 text-sm"
            >
              <Checkbox
                checked={secondaryCategoryIds.includes(category.id)}
                onCheckedChange={(checked) =>
                  toggleSecondaryCategory(category.id, checked === true)
                }
              />
              {category.name}
            </label>
          ))}
      </div>
    </div>
  );
}

export function ProductFormMainFields({
  pickTarget,
  onSetPickTarget,
  isPending,
  submitLabel,
}: ProductFormMainFieldsProps) {
  const navigate = useNavigate();
  const {
    register,
    setValue,
    formState: { errors },
  } = useFormContext<CreateProductFormValues>();
  const { data: categories } = useGetCategories();
  const { data: brands } = useGetBrands();
  const { data: taxes } = useGetTaxes();

  const primaryCategoryId = useWatch<CreateProductFormValues, 'primaryCategoryId'>({
    name: 'primaryCategoryId',
  });
  const productType = useWatch<CreateProductFormValues, 'type'>({ name: 'type' });
  const sellingUnit = useWatch<CreateProductFormValues, 'sellingUnit'>({
    name: 'sellingUnit',
  });
  const brandId = useWatch<CreateProductFormValues, 'brandId'>({ name: 'brandId' });
  const taxId = useWatch<CreateProductFormValues, 'taxId'>({ name: 'taxId' });

  return (
    <div className="min-w-0 flex-1 space-y-4">
      <ProductFormSection className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            className={productInputClassName}
            {...register('title')}
          />
          {errors.title && (
            <p className="text-xs text-destructive">{errors.title.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            className={productInputClassName}
            {...register('slug')}
          />
          {errors.slug && (
            <p className="text-xs text-destructive">{errors.slug.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="tagsInput">Tags</Label>
          <Input
            id="tagsInput"
            placeholder="protein, supplement"
            className={productInputClassName}
            {...register('tagsInput')}
          />
        </div>
      </ProductFormSection>

      <ProductFormSection className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label>Type</Label>
          <Select
            value={productType}
            onValueChange={(value) =>
              setValue('type', value as CreateProductFormValues['type'], {
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger className={`w-full ${productInputClassName}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PHYSICAL">Physical</SelectItem>
              <SelectItem value="DIGITAL">Digital</SelectItem>
              <SelectItem value="SERVICE">Service</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="listBasePrice">Base price</Label>
          <Input
            id="listBasePrice"
            type="number"
            min={0}
            step="0.01"
            className={productInputClassName}
            {...register('basePrice', { valueAsNumber: true })}
          />
        </div>
        <div className="space-y-2">
          <Label>Selling unit</Label>
          <Select
            value={sellingUnit}
            onValueChange={(value) =>
              setValue(
                'sellingUnit',
                value as CreateProductFormValues['sellingUnit'],
                { shouldValidate: true },
              )
            }
          >
            <SelectTrigger className={`w-full ${productInputClassName}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SELLING_UNITS.map((unit) => (
                <SelectItem key={unit} value={unit}>
                  {unit}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Primary category</Label>
          <Select
            value={primaryCategoryId || null}
            onValueChange={(value) =>
              setValue('primaryCategoryId', value ?? '', {
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger className={`w-full ${productInputClassName}`}>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories?.data.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.primaryCategoryId && (
            <p className="text-xs text-destructive">
              {errors.primaryCategoryId.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Brand</Label>
          <Select
            value={brandId ?? 'none'}
            onValueChange={(value) =>
              setValue('brandId', value === 'none' ? null : value, {
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger className={`w-full ${productInputClassName}`}>
              <SelectValue placeholder="No brand" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No brand</SelectItem>
              {brands?.data.map((brand) => (
                <SelectItem key={brand.id} value={brand.id}>
                  {brand.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Tax</Label>
          <Select
            value={taxId ?? 'none'}
            onValueChange={(value) =>
              setValue('taxId', value === 'none' ? null : value, {
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger className={`w-full ${productInputClassName}`}>
              <SelectValue placeholder="No tax" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No tax</SelectItem>
              {taxes?.data.map((tax) => (
                <SelectItem key={tax.id} value={tax.id}>
                  {tax.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 sm:col-span-3">
          <Label htmlFor="lowStockThreshold">Low stock threshold</Label>
          <Input
            id="lowStockThreshold"
            type="number"
            min={0}
            className={`max-w-xs ${productInputClassName}`}
            {...register('lowStockThreshold', { valueAsNumber: true })}
          />
        </div>
        <SecondaryCategoriesField />
      </ProductFormSection>

      <ProductFormSection>
        <ProductAttributePicker />
      </ProductFormSection>

      <BaseVariantFields
        activePickTarget={pickTarget}
        onSetPickTarget={onSetPickTarget}
      />

      <ProductFormSection>
        <ProductVariantTable
          activePickTarget={pickTarget}
          onSetPickTarget={onSetPickTarget}
        />
      </ProductFormSection>

      <ProductFormSection title="Content">
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="summary">Summary</Label>
            <Textarea
              id="summary"
              rows={2}
              className={productInputClassName}
              {...register('summary')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={4}
              className={productInputClassName}
              {...register('description')}
            />
          </div>
        </div>
      </ProductFormSection>

      <details className={`${productSectionClassName} group`}>
        <summary className="cursor-pointer text-sm font-medium">
          SEO (optional)
        </summary>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="metaTitle">Meta title</Label>
            <Input
              id="metaTitle"
              className={productInputClassName}
              {...register('metaTitle')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="metaKeywords">Meta keywords</Label>
            <Input
              id="metaKeywords"
              className={productInputClassName}
              {...register('metaKeywords')}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="metaDescription">Meta description</Label>
            <Textarea
              id="metaDescription"
              rows={2}
              className={productInputClassName}
              {...register('metaDescription')}
            />
          </div>
        </div>
      </details>

      <div className="flex justify-end gap-3 pb-6">
        <Button type="button" variant="outline" onClick={() => navigate('/products')}>
          Cancel
        </Button>
        <Button
          type="submit"
          className="rounded-sm shadow-lg shadow-primary/20"
          disabled={isPending}
        >
          {submitLabel}
        </Button>
      </div>
    </div>
  );
}
