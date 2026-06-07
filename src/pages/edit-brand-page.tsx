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
import { BrandForm } from '@/components/brands/brand-form';
import { FormPageSkeleton } from '@/components/skeletons';
import { useGetBrand } from '@/hooks/api/admin/use-brands';
import { brandToFormValues } from '@/lib/brand-form-mapper';

export function EditBrandPage() {
  const { brandId = '' } = useParams();
  const { data, isLoading, isError } = useGetBrand(brandId);

  const defaultValues = useMemo(
    () => (data ? brandToFormValues(data) : undefined),
    [data],
  );

  if (isLoading) {
    return <FormPageSkeleton layout="single" sections={1} />;
  }

  if (isError || !data || !defaultValues) {
    return (
      <div className="space-y-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link to="/brands" />}>
                Brands
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Brand not found</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <p className="text-sm text-muted-foreground">
          This brand does not exist or could not be loaded.
        </p>
        <Button render={<Link to="/brands" />}>Back to brands</Button>
      </div>
    );
  }

  return (
    <BrandForm mode="edit" brandId={brandId} defaultValues={defaultValues} />
  );
}
