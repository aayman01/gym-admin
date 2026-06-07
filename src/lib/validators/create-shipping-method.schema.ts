import { z } from 'zod';
import type {
  CreateShippingMethodPayload,
  UpdateShippingMethodPayload,
} from '@/types/shipping-method-type';

export const shippingMethodFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(255),
  price: z.number().min(0, 'Price must be 0 or greater'),
  deliveryDays: z
    .number()
    .int('Delivery days must be a whole number')
    .min(0, 'Delivery days must be 0 or greater'),
  isActive: z.boolean(),
});

export type ShippingMethodFormValues = z.infer<typeof shippingMethodFormSchema>;

export const defaultShippingMethodFormValues: ShippingMethodFormValues = {
  name: '',
  price: 0,
  deliveryDays: 0,
  isActive: true,
};

export function formValuesToCreatePayload(
  values: ShippingMethodFormValues,
): CreateShippingMethodPayload {
  return {
    name: values.name,
    price: values.price,
    deliveryDays: values.deliveryDays,
    isActive: values.isActive,
  };
}

export function formValuesToUpdatePayload(
  values: ShippingMethodFormValues,
): UpdateShippingMethodPayload {
  return {
    name: values.name,
    price: values.price,
    deliveryDays: values.deliveryDays,
    isActive: values.isActive,
  };
}
