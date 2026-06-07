import type { ShippingMethod } from '@/types/shipping-method-type';
import type { ShippingMethodFormValues } from '@/lib/validators/create-shipping-method.schema';

export function shippingMethodToFormValues(
  method: ShippingMethod,
): ShippingMethodFormValues {
  return {
    name: method.name,
    price: Number(method.price),
    deliveryDays: method.deliveryDays,
    isActive: method.isActive,
  };
}
