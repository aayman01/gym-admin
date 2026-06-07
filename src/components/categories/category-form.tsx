import { useEffect, useRef } from 'react';
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
import { ImageUpload } from '@/components/media/image-upload';
import { productInputClassName } from '@/components/products/product-form.constants';
import {
  useCreateCategory,
  useUpdateCategory,
} from '@/hooks/api/admin/use-categories';
import { ApiError } from '@/lib/api-client';
import {
  createCategoryFormSchema,
  defaultCreateCategoryFormValues,
  formValuesToCreatePayload,
  formValuesToUpdatePayload,
  slugifyTitle,
  type CreateCategoryFormValues,
} from '@/lib/validators/create-category.schema';

export type CategoryFormProps = {
  mode: 'create' | 'edit';
  categoryId?: string;
  defaultValues?: CreateCategoryFormValues;
};

export function CategoryForm({ mode, categoryId, defaultValues }: CategoryFormProps) {
  const navigate = useNavigate();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const hydratedRef = useRef(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateCategoryFormValues>({
    resolver: zodResolver(createCategoryFormSchema),
    defaultValues: defaultValues ?? defaultCreateCategoryFormValues,
    mode: 'onBlur',
  });

  const imageId = watch('imageId');
  const imageUrl = watch('imageUrl');
  const status = watch('status');
  const isFeature = watch('isFeature');

  useEffect(() => {
    if (defaultValues && !hydratedRef.current) {
      reset(defaultValues);
      hydratedRef.current = true;
    }
  }, [defaultValues, reset]);

  useEffect(() => {
    if (mode !== 'create') return;

    const subscription = watch((values, { name }) => {
      if (name === 'name' && values.name && !values.slug) {
        setValue('slug', slugifyTitle(values.name), { shouldValidate: true });
      }
    });
    return () => subscription.unsubscribe();
  }, [mode, setValue, watch]);

  const isPending =
    mode === 'create' ? createCategory.isPending : updateCategory.isPending;

  const pageTitle = mode === 'create' ? 'Add Category' : 'Edit Category';

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (mode === 'create') {
        await createCategory.mutateAsync(formValuesToCreatePayload(values));
        toast.success('Category created successfully');
      } else {
        if (!categoryId) return;
        await updateCategory.mutateAsync({
          categoryId,
          payload: formValuesToUpdatePayload(values),
        });
        toast.success('Category updated successfully');
      }
      navigate('/categories');
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : mode === 'create'
            ? 'Failed to create category'
            : 'Failed to update category';
      toast.error(message);
    }
  });

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link to="/categories" />}>
                Categories
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{pageTitle}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <h1 className="text-2xl font-bold tracking-tight">{pageTitle}</h1>
        <p className="text-sm text-muted-foreground">
          {mode === 'create'
            ? 'Create a category for organizing products.'
            : 'Update category details and visibility.'}
        </p>
      </div>

      <form onSubmit={onSubmit} className="max-w-xl space-y-6">
        <div className="space-y-4 rounded-sm border border-primary/10 p-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              className={productInputClassName}
              {...register('name')}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
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
            <Label>Status</Label>
            <Select
              value={status}
              onValueChange={(value) =>
                setValue('status', value as CreateCategoryFormValues['status'], {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger className={`w-full ${productInputClassName}`}>
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
            <Label htmlFor="isFeature">Featured category</Label>
            <Switch
              id="isFeature"
              checked={isFeature}
              onCheckedChange={(checked) =>
                setValue('isFeature', checked, { shouldValidate: true })
              }
            />
          </div>

          <ImageUpload
            label="Category image"
            value={imageId}
            previewUrl={imageUrl}
            onChange={(mediaId, url) => {
              setValue('imageId', mediaId, { shouldValidate: true });
              setValue('imageUrl', url);
            }}
            onRemove={() => {
              setValue('imageId', null, { shouldValidate: true });
              setValue('imageUrl', '');
            }}
          />
        </div>

        <div className="flex items-center gap-2">
          <Button type="submit" disabled={isPending}>
            {isPending
              ? mode === 'create'
                ? 'Creating...'
                : 'Saving...'
              : mode === 'create'
                ? 'Create Category'
                : 'Save Changes'}
          </Button>
          <Button
            type="button"
            variant="outline"
            render={<Link to="/categories" />}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
