import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  useCreateProduct,
  useUpdateProduct,
} from '@/hooks/api/admin/use-products';
import { ApiError } from '@/lib/api-client';
import {
  checkDuplicateSkus,
  GALLERY_PICK_THUMBNAIL,
  hasVariableProduct,
  type GalleryPickTarget,
} from '@/lib/product-variant-utils';
import {
  createProductFormSchema,
  defaultCreateProductFormValues,
  formValuesToPayload,
  slugifyTitle,
  type CreateProductFormValues,
} from '@/lib/validators/create-product.schema';

export type UseProductFormOptions = {
  mode: 'create' | 'edit';
  productId?: string;
  defaultValues?: CreateProductFormValues;
};

export function useProductForm({
  mode,
  productId,
  defaultValues,
}: UseProductFormOptions) {
  const navigate = useNavigate();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const hydratedRef = useRef(false);
  const [pickTarget, setPickTarget] = useState<GalleryPickTarget>(
    GALLERY_PICK_THUMBNAIL,
  );

  const form = useForm<CreateProductFormValues>({
    resolver: zodResolver(createProductFormSchema),
    defaultValues: defaultValues ?? defaultCreateProductFormValues,
    mode: 'onBlur',
  });

  const { reset, setValue, handleSubmit, watch } = form;

  useEffect(() => {
    if (defaultValues && !hydratedRef.current) {
      reset(defaultValues);
      hydratedRef.current = true;
    }
  }, [defaultValues, reset]);

  useEffect(() => {
    if (mode !== 'create') return;

    const subscription = watch((values, { name }) => {
      if (name === 'title' && values.title && !values.slug) {
        setValue('slug', slugifyTitle(values.title), { shouldValidate: true });
      }
    });
    return () => subscription.unsubscribe();
  }, [mode, setValue, watch]);

  const isPending =
    mode === 'create' ? createProduct.isPending : updateProduct.isPending;

  const onSubmit = handleSubmit(async (values) => {
    if (hasVariableProduct(values.selectedAttributes)) {
      const dup = checkDuplicateSkus(values.variants);
      if (dup) {
        toast.error(dup);
        return;
      }
    }

    const payload = formValuesToPayload(values);

    try {
      if (mode === 'create') {
        await createProduct.mutateAsync(payload);
        toast.success('Product created successfully');
      } else {
        if (!productId) return;
        await updateProduct.mutateAsync({ productId, payload });
        toast.success('Product updated successfully');
      }
      navigate('/products');
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : mode === 'create'
            ? 'Failed to create product'
            : 'Failed to update product';
      toast.error(message);
    }
  });

  const submitLabel =
    mode === 'create'
      ? isPending
        ? 'Creating...'
        : 'Create Product'
      : isPending
        ? 'Saving...'
        : 'Save Changes';

  return {
    form,
    pickTarget,
    setPickTarget,
    onSubmit,
    isPending,
    submitLabel,
    navigate,
    mode,
  };
}
