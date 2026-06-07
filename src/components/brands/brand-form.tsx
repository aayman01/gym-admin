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
import { ImageUpload } from '@/components/media/image-upload';
import { productInputClassName } from '@/components/products/product-form.constants';
import { useCreateBrand, useUpdateBrand } from '@/hooks/api/admin/use-brands';
import { ApiError } from '@/lib/api-client';
import {
  createBrandFormSchema,
  defaultCreateBrandFormValues,
  formValuesToCreatePayload,
  formValuesToUpdatePayload,
  slugifyTitle,
  type CreateBrandFormValues,
} from '@/lib/validators/create-brand.schema';

export type BrandFormProps = {
  mode: 'create' | 'edit';
  brandId?: string;
  defaultValues?: CreateBrandFormValues;
};

export function BrandForm({ mode, brandId, defaultValues }: BrandFormProps) {
  const navigate = useNavigate();
  const createBrand = useCreateBrand();
  const updateBrand = useUpdateBrand();
  const hydratedRef = useRef(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateBrandFormValues>({
    resolver: zodResolver(createBrandFormSchema),
    defaultValues: defaultValues ?? defaultCreateBrandFormValues,
    mode: 'onBlur',
  });

  const logoId = watch('logoId');
  const logoUrl = watch('logoUrl');
  const status = watch('status');

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
    mode === 'create' ? createBrand.isPending : updateBrand.isPending;

  const pageTitle = mode === 'create' ? 'Add Brand' : 'Edit Brand';

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (mode === 'create') {
        await createBrand.mutateAsync(formValuesToCreatePayload(values));
        toast.success('Brand created successfully');
      } else {
        if (!brandId) return;
        await updateBrand.mutateAsync({
          brandId,
          payload: formValuesToUpdatePayload(values),
        });
        toast.success('Brand updated successfully');
      }
      navigate('/brands');
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : mode === 'create'
            ? 'Failed to create brand'
            : 'Failed to update brand';
      toast.error(message);
    }
  });

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link to="/brands" />}>
                Brands
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
            ? 'Create a brand for product catalog organization.'
            : 'Update brand details and visibility.'}
        </p>
      </div>

      <form onSubmit={onSubmit} className="w-full space-y-6">
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
                setValue('status', value as CreateBrandFormValues['status'], {
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

          <ImageUpload
            label="Brand logo"
            value={logoId}
            previewUrl={logoUrl}
            onChange={(mediaId, url) => {
              setValue('logoId', mediaId, { shouldValidate: true });
              setValue('logoUrl', url);
            }}
            onRemove={() => {
              setValue('logoId', null, { shouldValidate: true });
              setValue('logoUrl', '');
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
                ? 'Create Brand'
                : 'Save Changes'}
          </Button>
          <Button
            type="button"
            variant="outline"
            render={<Link to="/brands" />}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
