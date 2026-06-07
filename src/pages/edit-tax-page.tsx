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
import { TaxForm } from '@/components/taxes/tax-form';
import { FormPageSkeleton } from '@/components/skeletons';
import { useGetTax } from '@/hooks/api/admin/use-taxes';
import { taxToFormValues } from '@/lib/tax-form-mapper';

export function EditTaxPage() {
  const { taxId = '' } = useParams();
  const { data, isLoading, isError } = useGetTax(taxId);

  const defaultValues = useMemo(
    () => (data ? taxToFormValues(data) : undefined),
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
              <BreadcrumbLink render={<Link to="/taxes" />}>
                Taxes
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Tax not found</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <p className="text-sm text-muted-foreground">
          This tax does not exist or could not be loaded.
        </p>
        <Button render={<Link to="/taxes" />}>Back to taxes</Button>
      </div>
    );
  }

  return (
    <TaxForm mode="edit" taxId={taxId} defaultValues={defaultValues} />
  );
}
