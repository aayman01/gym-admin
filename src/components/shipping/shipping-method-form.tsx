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
import { Switch } from '@/components/ui/switch';
import { productInputClassName } from '@/components/products/product-form.constants';
import {
  useCreateShippingMethod,
  useUpdateShippingMethod,
} from '@/hooks/api/admin/use-shipping-methods';
import { ApiError } from '@/lib/api-client';
import {
  defaultShippingMethodFormValues,
  formValuesToCreatePayload,
  formValuesToUpdatePayload,
  shippingMethodFormSchema,
  type ShippingMethodFormValues,
} from '@/lib/validators/create-shipping-method.schema';

export type ShippingMethodFormProps = {
  mode: 'create' | 'edit';
  shippingMethodId?: string;
  defaultValues?: ShippingMethodFormValues;
};

export function ShippingMethodForm({
  mode,
  shippingMethodId,
  defaultValues,
}: ShippingMethodFormProps) {
  const navigate = useNavigate();
  const createShippingMethod = useCreateShippingMethod();
  const updateShippingMethod = useUpdateShippingMethod();
  const hydratedRef = useRef(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ShippingMethodFormValues>({
    resolver: zodResolver(shippingMethodFormSchema),
    defaultValues: defaultValues ?? defaultShippingMethodFormValues,
    mode: 'onBlur',
  });

  const isActive = watch('isActive');

  useEffect(() => {
    if (defaultValues && !hydratedRef.current) {
      reset(defaultValues);
      hydratedRef.current = true;
    }
  }, [defaultValues, reset]);

  const isPending =
    mode === 'create'
      ? createShippingMethod.isPending
      : updateShippingMethod.isPending;

  const pageTitle =
    mode === 'create' ? 'Add Shipping Method' : 'Edit Shipping Method';

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (mode === 'create') {
        await createShippingMethod.mutateAsync(formValuesToCreatePayload(values));
        toast.success('Shipping method created successfully');
      } else {
        if (!shippingMethodId) return;
        await updateShippingMethod.mutateAsync({
          shippingMethodId,
          payload: formValuesToUpdatePayload(values),
        });
        toast.success('Shipping method updated successfully');
      }
      navigate('/shipping');
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : mode === 'create'
            ? 'Failed to create shipping method'
            : 'Failed to update shipping method';
      toast.error(message);
    }
  });

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link to="/shipping" />}>
                Shipping
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
            ? 'Define a shipping option for checkout.'
            : 'Update shipping method details and availability.'}
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
            <Label htmlFor="price">Price (USD)</Label>
            <Input
              id="price"
              type="number"
              min={0}
              step="0.01"
              className={productInputClassName}
              {...register('price', { valueAsNumber: true })}
            />
            {errors.price && (
              <p className="text-xs text-destructive">{errors.price.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="deliveryDays">Delivery days</Label>
            <Input
              id="deliveryDays"
              type="number"
              min={0}
              step={1}
              className={productInputClassName}
              {...register('deliveryDays', { valueAsNumber: true })}
            />
            {errors.deliveryDays && (
              <p className="text-xs text-destructive">
                {errors.deliveryDays.message}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="isActive">Active</Label>
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={(checked) =>
                setValue('isActive', checked, { shouldValidate: true })
              }
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button type="submit" disabled={isPending}>
            {isPending
              ? mode === 'create'
                ? 'Creating...'
                : 'Saving...'
              : mode === 'create'
                ? 'Create Shipping Method'
                : 'Save Changes'}
          </Button>
          <Button
            type="button"
            variant="outline"
            render={<Link to="/shipping" />}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
