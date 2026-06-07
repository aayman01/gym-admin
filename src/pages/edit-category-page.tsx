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
import { CategoryForm } from '@/components/categories/category-form';
import { FormPageSkeleton } from '@/components/skeletons';
import { useGetCategory } from '@/hooks/api/admin/use-categories';
import { categoryToFormValues } from '@/lib/category-form-mapper';

export function EditCategoryPage() {
  const { categoryId = '' } = useParams();
  const { data, isLoading, isError } = useGetCategory(categoryId);

  const defaultValues = useMemo(
    () => (data ? categoryToFormValues(data) : undefined),
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
              <BreadcrumbLink render={<Link to="/categories" />}>
                Categories
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Category not found</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <p className="text-sm text-muted-foreground">
          This category does not exist or could not be loaded.
        </p>
        <Button render={<Link to="/categories" />}>Back to categories</Button>
      </div>
    );
  }

  return (
    <CategoryForm
      mode="edit"
      categoryId={categoryId}
      defaultValues={defaultValues}
    />
  );
}
