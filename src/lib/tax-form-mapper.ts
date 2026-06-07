import type { Tax } from '@/types/tax-type';
import type { EditTaxFormValues } from '@/lib/validators/create-tax.schema';

export function taxToFormValues(tax: Tax): EditTaxFormValues {
  return {
    name: tax.name,
    rate: Number(tax.rate),
    type: tax.type,
  };
}
