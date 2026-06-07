import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
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
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ProductAttributePicker } from '@/components/products/product-attribute-picker';
import { ProductMediaSidebar } from '@/components/products/product-media-sidebar';
import {
  BaseVariantFields,
  ProductVariantTable,
} from '@/components/products/product-variant-table';
import { useGetBrands } from '@/hooks/api/admin/use-brands';
import { useGetCategories } from '@/hooks/api/admin/use-categories';
import { useCreateProduct } from '@/hooks/api/admin/use-products';
import { useGetProductAttributesByIds } from '@/hooks/api/admin/use-product-attributes';
import { useGetTaxes } from '@/hooks/api/admin/use-taxes';
import { ApiError } from '@/lib/api-client';
import {
  checkDuplicateSkus,
  getVariantKey,
  GALLERY_PICK_THUMBNAIL,
  hasVariableProduct,
  type GalleryPickTarget,
} from '@/lib/product-variant-utils';
import {
  createProductFormSchema,
  defaultCreateProductFormValues,
  formValuesToPayload,
  slugifyTitle,
  type CreateProductFormValues,
} from '@/lib/validators/create-product.schema';

const inputClassName =
  'rounded-sm border-0 bg-primary/5 focus-visible:ring-primary/50';

const sectionClassName = 'rounded-sm border border-primary/10 p-4 space-y-4';

export function AddProductPage() {
  const navigate = useNavigate();
  const { data: categories } = useGetCategories();
  const { data: brands } = useGetBrands();
  const { data: taxes } = useGetTaxes();
  const createProduct = useCreateProduct();
  const [pickTarget, setPickTarget] = useState<GalleryPickTarget>(
    GALLERY_PICK_THUMBNAIL,
  );

  const form = useForm<CreateProductFormValues>({
    resolver: zodResolver(createProductFormSchema),
    defaultValues: defaultCreateProductFormValues,
    mode: 'onBlur',
  });

  const primaryCategoryId = form.watch('primaryCategoryId');
  const selectedAttributes = form.watch('selectedAttributes');
  const variants = form.watch('variants');

  const attributeIds = useMemo(
    () => selectedAttributes.map((a) => a.attributeId),
    [selectedAttributes],
  );
  const attributeQueries = useGetProductAttributesByIds(attributeIds);

  const variantLabels = useMemo(() => {
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

  useEffect(() => {
    const subscription = form.watch((values, { name }) => {
      if (name === 'title' && values.title && !values.slug) {
        form.setValue('slug', slugifyTitle(values.title), {
          shouldValidate: true,
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const onSubmit = form.handleSubmit(async (values) => {
    if (hasVariableProduct(values.selectedAttributes)) {
      const dup = checkDuplicateSkus(values.variants);
      if (dup) {
        toast.error(dup);
        return;
      }
    }

    try {
      await createProduct.mutateAsync(formValuesToPayload(values));
      toast.success('Product created successfully');
      navigate('/products');
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'Failed to create product';
      toast.error(message);
    }
  });

  const toggleSecondaryCategory = (categoryId: string, checked: boolean) => {
    const current = form.getValues('secondaryCategoryIds');
    const next = checked
      ? [...current, categoryId]
      : current.filter((id) => id !== categoryId);
    form.setValue('secondaryCategoryIds', next, { shouldValidate: true });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link to="/products" />}>
                Products
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Add Product</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <h1 className="text-2xl font-bold tracking-tight">Add Product</h1>
        <p className="text-sm text-muted-foreground">
          Create a product with compact layout, auto variants, and gallery
          routing.
        </p>
      </div>

      <form onSubmit={onSubmit}>
        <div className="flex flex-col gap-6 lg:flex-row-reverse">
          <aside className="space-y-4 lg:sticky lg:top-20 lg:w-80 lg:shrink-0 lg:self-start">
            <div className={sectionClassName}>
              <p className="text-sm font-medium">Publishing</p>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={form.watch('status')}
                  onValueChange={(value) =>
                    form.setValue(
                      'status',
                      value as CreateProductFormValues['status'],
                      { shouldValidate: true },
                    )
                  }
                >
                  <SelectTrigger className={`w-full ${inputClassName}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="isFeature">Featured product</Label>
                <Switch
                  id="isFeature"
                  checked={form.watch('isFeature')}
                  onCheckedChange={(checked) =>
                    form.setValue('isFeature', checked, { shouldValidate: true })
                  }
                />
              </div>
            </div>

            <div className={sectionClassName}>
              <p className="text-sm font-medium">Media library</p>
              <ProductMediaSidebar
                form={form}
                pickTarget={pickTarget}
                onPickTargetChange={setPickTarget}
                variantLabels={variantLabels}
              />
            </div>

            <div className={sectionClassName}>
              <p className="text-sm font-medium">Product flags</p>
              <div className="grid grid-cols-2 gap-3">
                {(
                  [
                    ['isTaxIncluded', 'Tax included'],
                    ['isFragile', 'Fragile'],
                    ['isPerishable', 'Perishable'],
                  ] as const
                ).map(([field, label]) => (
                  <div key={field} className="flex items-center justify-between gap-2">
                    <Label htmlFor={field} className="text-xs">
                      {label}
                    </Label>
                    <Switch
                      id={field}
                      checked={form.watch(field)}
                      onCheckedChange={(checked) =>
                        form.setValue(field, checked, { shouldValidate: true })
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <div className="min-w-0 flex-1 space-y-4">
            <div className={`${sectionClassName} grid gap-4 sm:grid-cols-2`}>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  className={inputClassName}
                  {...form.register('title')}
                />
                {form.formState.errors.title && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.title.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  className={inputClassName}
                  {...form.register('slug')}
                />
                {form.formState.errors.slug && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.slug.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="tagsInput">Tags</Label>
                <Input
                  id="tagsInput"
                  placeholder="protein, supplement"
                  className={inputClassName}
                  {...form.register('tagsInput')}
                />
              </div>
            </div>

            <div className={`${sectionClassName} grid gap-4 sm:grid-cols-3`}>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={form.watch('type')}
                  onValueChange={(value) =>
                    form.setValue(
                      'type',
                      value as CreateProductFormValues['type'],
                      { shouldValidate: true },
                    )
                  }
                >
                  <SelectTrigger className={`w-full ${inputClassName}`}>
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
                  className={inputClassName}
                  {...form.register('basePrice', { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label>Selling unit</Label>
                <Select
                  value={form.watch('sellingUnit')}
                  onValueChange={(value) =>
                    form.setValue(
                      'sellingUnit',
                      value as CreateProductFormValues['sellingUnit'],
                      { shouldValidate: true },
                    )
                  }
                >
                  <SelectTrigger className={`w-full ${inputClassName}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(
                      [
                        'PIECE',
                        'KG',
                        'GRAM',
                        'LITER',
                        'MILLILITER',
                        'METER',
                        'PACK',
                        'BOX',
                        'SET',
                      ] as const
                    ).map((unit) => (
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
                    form.setValue('primaryCategoryId', value ?? '', {
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger className={`w-full ${inputClassName}`}>
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
                {form.formState.errors.primaryCategoryId && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.primaryCategoryId.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Brand</Label>
                <Select
                  value={form.watch('brandId') ?? 'none'}
                  onValueChange={(value) =>
                    form.setValue('brandId', value === 'none' ? null : value, {
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger className={`w-full ${inputClassName}`}>
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
                  value={form.watch('taxId') ?? 'none'}
                  onValueChange={(value) =>
                    form.setValue('taxId', value === 'none' ? null : value, {
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger className={`w-full ${inputClassName}`}>
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
                  className={`max-w-xs ${inputClassName}`}
                  {...form.register('lowStockThreshold', { valueAsNumber: true })}
                />
              </div>
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
                          checked={form
                            .watch('secondaryCategoryIds')
                            .includes(category.id)}
                          onCheckedChange={(checked) =>
                            toggleSecondaryCategory(
                              category.id,
                              checked === true,
                            )
                          }
                        />
                        {category.name}
                      </label>
                    ))}
                </div>
              </div>
            </div>

            <div className={sectionClassName}>
              <ProductAttributePicker form={form} />
            </div>

            <BaseVariantFields
              form={form}
              activePickTarget={pickTarget}
              onSetPickTarget={setPickTarget}
            />

            <div className={sectionClassName}>
              <ProductVariantTable
                form={form}
                activePickTarget={pickTarget}
                onSetPickTarget={setPickTarget}
              />
            </div>

            <div className={sectionClassName}>
              <p className="text-sm font-medium">Content</p>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="summary">Summary</Label>
                  <Textarea
                    id="summary"
                    rows={2}
                    className={inputClassName}
                    {...form.register('summary')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    rows={4}
                    className={inputClassName}
                    {...form.register('description')}
                  />
                </div>
              </div>
            </div>

            <details className={sectionClassName}>
              <summary className="cursor-pointer text-sm font-medium">
                SEO (optional)
              </summary>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="metaTitle">Meta title</Label>
                  <Input
                    id="metaTitle"
                    className={inputClassName}
                    {...form.register('metaTitle')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="metaKeywords">Meta keywords</Label>
                  <Input
                    id="metaKeywords"
                    className={inputClassName}
                    {...form.register('metaKeywords')}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="metaDescription">Meta description</Label>
                  <Textarea
                    id="metaDescription"
                    rows={2}
                    className={inputClassName}
                    {...form.register('metaDescription')}
                  />
                </div>
              </div>
            </details>

            <div className="flex justify-end gap-3 pb-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/products')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-sm shadow-lg shadow-primary/20"
                disabled={createProduct.isPending}
              >
                {createProduct.isPending ? 'Creating...' : 'Create Product'}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
