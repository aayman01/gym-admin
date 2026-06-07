import { z } from 'zod';
import type { CreateTaxPayload, UpdateTaxPayload } from '@/types/tax-type';

const taxTypeSchema = z.enum(['PERCENTAGE', 'FIXED']);

const rateSchema = z.number().min(0, 'Rate must be 0 or greater');

export const createTaxFormSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required').max(150),
    rate: rateSchema,
    type: taxTypeSchema,
    isDefault: z.boolean(),
    isActive: z.boolean(),
  })
  .refine((data) => !(data.isDefault && !data.isActive), {
    message: 'Default tax must be active',
    path: ['isDefault'],
  });

export const editTaxFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(150),
  rate: rateSchema,
  type: taxTypeSchema,
});

export type CreateTaxFormValues = z.infer<typeof createTaxFormSchema>;
export type EditTaxFormValues = z.infer<typeof editTaxFormSchema>;

export const defaultCreateTaxFormValues: CreateTaxFormValues = {
  name: '',
  rate: 0,
  type: 'PERCENTAGE',
  isDefault: false,
  isActive: true,
};

export const defaultEditTaxFormValues: EditTaxFormValues = {
  name: '',
  rate: 0,
  type: 'PERCENTAGE',
};

export function formValuesToCreatePayload(
  values: CreateTaxFormValues,
): CreateTaxPayload {
  return {
    name: values.name,
    rate: values.rate,
    type: values.type,
    isDefault: values.isDefault,
    isActive: values.isActive,
  };
}

export function formValuesToUpdatePayload(
  values: EditTaxFormValues,
): UpdateTaxPayload {
  return {
    name: values.name,
    rate: values.rate,
    type: values.type,
  };
}
