import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { FormPageSkeleton } from '@/components/skeletons';
import { ProductForm } from '@/components/products/product-form';
import { useGetProduct } from '@/hooks/api/admin/use-products';
import { productToFormValues } from '@/lib/product-form-mapper';

export function EditProductPage() {
  const { productId = '' } = useParams();
  const { data, isLoading, isError } = useGetProduct(productId);

  const defaultValues = useMemo(
    () => (data ? productToFormValues(data) : undefined),
    [data],
  );

  if (isLoading) {
    return <FormPageSkeleton layout="two-column" sections={5} />;
  }

  if (isError || !data || !defaultValues) {
    return (
      <div className="space-y-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link to="/products" />}>
                Products
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Product not found</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <p className="text-sm text-muted-foreground">
          This product does not exist or could not be loaded.
        </p>
        <Button render={<Link to="/products" />}>Back to products</Button>
      </div>
    );
  }

  return (
    <ProductForm
      mode="edit"
      productId={productId}
      defaultValues={defaultValues}
    />
  );
}
