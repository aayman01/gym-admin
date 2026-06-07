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
import { productInputClassName } from '@/components/products/product-form.constants';
import { useCreateTax, useUpdateTax } from '@/hooks/api/admin/use-taxes';
import { ApiError } from '@/lib/api-client';
import {
  createTaxFormSchema,
  defaultCreateTaxFormValues,
  defaultEditTaxFormValues,
  editTaxFormSchema,
  formValuesToCreatePayload,
  formValuesToUpdatePayload,
  type CreateTaxFormValues,
  type EditTaxFormValues,
} from '@/lib/validators/create-tax.schema';

export type TaxFormProps =
  | { mode: 'create'; taxId?: never; defaultValues?: never }
  | {
      mode: 'edit';
      taxId: string;
      defaultValues?: EditTaxFormValues;
    };

export function TaxForm(props: TaxFormProps) {
  const { mode } = props;
  const navigate = useNavigate();
  const createTax = useCreateTax();
  const updateTax = useUpdateTax();
  const hydratedRef = useRef(false);

  const isCreate = mode === 'create';

  const createForm = useForm<CreateTaxFormValues>({
    resolver: zodResolver(createTaxFormSchema),
    defaultValues: defaultCreateTaxFormValues,
    mode: 'onBlur',
  });

  const editForm = useForm<EditTaxFormValues>({
    resolver: zodResolver(editTaxFormSchema),
    defaultValues: props.defaultValues ?? defaultEditTaxFormValues,
    mode: 'onBlur',
  });

  useEffect(() => {
    if (!isCreate && props.defaultValues && !hydratedRef.current) {
      editForm.reset(props.defaultValues);
      hydratedRef.current = true;
    }
  }, [isCreate, props, editForm]);

  const pageTitle = isCreate ? 'Add Tax' : 'Edit Tax';
  const isPending = isCreate ? createTax.isPending : updateTax.isPending;

  const onCreateSubmit = createForm.handleSubmit(async (values) => {
    try {
      await createTax.mutateAsync(formValuesToCreatePayload(values));
      toast.success('Tax created successfully');
      navigate('/taxes');
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'Failed to create tax';
      toast.error(message);
    }
  });

  const onEditSubmit = editForm.handleSubmit(async (values) => {
    if (mode !== 'edit') return;
    try {
      await updateTax.mutateAsync({
        taxId: props.taxId,
        payload: formValuesToUpdatePayload(values),
      });
      toast.success('Tax updated successfully');
      navigate('/taxes');
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'Failed to update tax';
      toast.error(message);
    }
  });

  const createType = createForm.watch('type');
  const createIsDefault = createForm.watch('isDefault');
  const createIsActive = createForm.watch('isActive');
  const editType = editForm.watch('type');

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link to="/taxes" />}>
                Taxes
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
          {isCreate
            ? 'Define a tax rate for products at checkout.'
            : 'Update tax name, rate, and type. Default and active status are managed from the taxes list.'}
        </p>
      </div>

      {isCreate ? (
        <form onSubmit={onCreateSubmit} className="max-w-xl space-y-6">
          <div className="space-y-4 rounded-sm border border-primary/10 p-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                className={productInputClassName}
                {...createForm.register('name')}
              />
              {createForm.formState.errors.name && (
                <p className="text-xs text-destructive">
                  {createForm.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="rate">
                Rate {createType === 'PERCENTAGE' ? '(%)' : '(fixed amount)'}
              </Label>
              <Input
                id="rate"
                type="number"
                min={0}
                step="0.01"
                className={productInputClassName}
                {...createForm.register('rate', { valueAsNumber: true })}
              />
              {createForm.formState.errors.rate && (
                <p className="text-xs text-destructive">
                  {createForm.formState.errors.rate.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={createType}
                onValueChange={(value) =>
                  createForm.setValue(
                    'type',
                    value as CreateTaxFormValues['type'],
                    { shouldValidate: true },
                  )
                }
              >
                <SelectTrigger className={`w-full ${productInputClassName}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                  <SelectItem value="FIXED">Fixed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="isActive">Active</Label>
              <Switch
                id="isActive"
                checked={createIsActive}
                onCheckedChange={(checked) => {
                  createForm.setValue('isActive', checked, {
                    shouldValidate: true,
                  });
                  if (!checked) {
                    createForm.setValue('isDefault', false, {
                      shouldValidate: true,
                    });
                  }
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="isDefault">Default tax</Label>
              <Switch
                id="isDefault"
                checked={createIsDefault}
                disabled={!createIsActive}
                onCheckedChange={(checked) =>
                  createForm.setValue('isDefault', checked, {
                    shouldValidate: true,
                  })
                }
              />
            </div>
            {createForm.formState.errors.isDefault && (
              <p className="text-xs text-destructive">
                {createForm.formState.errors.isDefault.message}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Creating...' : 'Create Tax'}
            </Button>
            <Button
              type="button"
              variant="outline"
              render={<Link to="/taxes" />}
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={onEditSubmit} className="max-w-xl space-y-6">
          <div className="space-y-4 rounded-sm border border-primary/10 p-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                className={productInputClassName}
                {...editForm.register('name')}
              />
              {editForm.formState.errors.name && (
                <p className="text-xs text-destructive">
                  {editForm.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-rate">
                Rate {editType === 'PERCENTAGE' ? '(%)' : '(fixed amount)'}
              </Label>
              <Input
                id="edit-rate"
                type="number"
                min={0}
                step="0.01"
                className={productInputClassName}
                {...editForm.register('rate', { valueAsNumber: true })}
              />
              {editForm.formState.errors.rate && (
                <p className="text-xs text-destructive">
                  {editForm.formState.errors.rate.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={editType}
                onValueChange={(value) =>
                  editForm.setValue('type', value as EditTaxFormValues['type'], {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger className={`w-full ${productInputClassName}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                  <SelectItem value="FIXED">Fixed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <p className="text-xs text-muted-foreground">
              To change default or active status, use the actions menu on the
              taxes list.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              type="button"
              variant="outline"
              render={<Link to="/taxes" />}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
