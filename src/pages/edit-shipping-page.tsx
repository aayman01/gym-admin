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
import { ShippingMethodForm } from '@/components/shipping/shipping-method-form';
import { FormPageSkeleton } from '@/components/skeletons';
import { useGetShippingMethod } from '@/hooks/api/admin/use-shipping-methods';
import { shippingMethodToFormValues } from '@/lib/shipping-method-form-mapper';

export function EditShippingPage() {
  const { shippingMethodId = '' } = useParams();
  const { data, isLoading, isError } = useGetShippingMethod(shippingMethodId);

  const defaultValues = useMemo(
    () => (data ? shippingMethodToFormValues(data) : undefined),
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
              <BreadcrumbLink render={<Link to="/shipping" />}>
                Shipping
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Shipping method not found</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <p className="text-sm text-muted-foreground">
          This shipping method does not exist or could not be loaded.
        </p>
        <Button render={<Link to="/shipping" />}>Back to shipping</Button>
      </div>
    );
  }

  return (
    <ShippingMethodForm
      mode="edit"
      shippingMethodId={shippingMethodId}
      defaultValues={defaultValues}
    />
  );
}
