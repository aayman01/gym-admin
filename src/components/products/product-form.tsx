import { Link } from 'react-router-dom';
import { FormProvider } from 'react-hook-form';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { ProductFormMainFields } from '@/components/products/product-form-main-fields';
import { ProductFormSidebar } from '@/components/products/product-form-sidebar';
import { useProductForm } from '@/hooks/use-product-form';
import type { CreateProductFormValues } from '@/lib/validators/create-product.schema';

export type ProductFormProps = {
  mode: 'create' | 'edit';
  productId?: string;
  defaultValues?: CreateProductFormValues;
};

export function ProductForm({ mode, productId, defaultValues }: ProductFormProps) {
  const { form, pickTarget, setPickTarget, onSubmit, isPending, submitLabel } =
    useProductForm({ mode, productId, defaultValues });

  const pageTitle = mode === 'create' ? 'Add Product' : 'Edit Product';
  const pageDescription =
    mode === 'create'
      ? 'Create a product with compact layout, auto variants, and gallery routing.'
      : 'Update product details, variants, and media.';

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
              <BreadcrumbPage>{pageTitle}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <h1 className="text-2xl font-bold tracking-tight">{pageTitle}</h1>
        <p className="text-sm text-muted-foreground">{pageDescription}</p>
      </div>

      <FormProvider {...form}>
        <form onSubmit={onSubmit}>
          <div className="flex flex-col gap-6 lg:flex-row-reverse">
            <ProductFormSidebar
              pickTarget={pickTarget}
              onPickTargetChange={setPickTarget}
            />
            <ProductFormMainFields
              pickTarget={pickTarget}
              onSetPickTarget={setPickTarget}
              isPending={isPending}
              submitLabel={submitLabel}
            />
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
