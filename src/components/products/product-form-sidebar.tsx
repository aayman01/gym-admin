import { useFormContext, useWatch } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ProductMediaSidebar } from '@/components/products/product-media-sidebar';
import { ProductFormSection } from '@/components/products/product-form-section';
import { productInputClassName } from '@/components/products/product-form.constants';
import type { GalleryPickTarget } from '@/lib/product-variant-utils';
import type { CreateProductFormValues } from '@/lib/validators/create-product.schema';

type ProductFormSidebarProps = {
  pickTarget: GalleryPickTarget;
  onPickTargetChange: (target: GalleryPickTarget) => void;
};

function StatusField() {
  const { setValue } = useFormContext<CreateProductFormValues>();
  const status = useWatch<CreateProductFormValues, 'status'>({ name: 'status' });

  return (
    <div className="space-y-2">
      <Label>Status</Label>
      <Select
        value={status}
        onValueChange={(value) =>
          setValue('status', value as CreateProductFormValues['status'], {
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
  );
}

function FeaturedField() {
  const { setValue } = useFormContext<CreateProductFormValues>();
  const isFeature = useWatch<CreateProductFormValues, 'isFeature'>({ name: 'isFeature' });

  return (
    <div className="flex items-center justify-between">
      <Label htmlFor="isFeature">Featured product</Label>
      <Switch
        id="isFeature"
        checked={isFeature}
        onCheckedChange={(checked) =>
          setValue('isFeature', checked, { shouldValidate: true })
        }
      />
    </div>
  );
}

function FlagSwitch({
  field,
  label,
}: {
  field: 'isTaxIncluded' | 'isFragile' | 'isPerishable';
  label: string;
}) {
  const { setValue } = useFormContext<CreateProductFormValues>();
  const checked = useWatch<CreateProductFormValues, typeof field>({ name: field });

  return (
    <div className="flex items-center justify-between gap-2">
      <Label htmlFor={field} className="text-xs">
        {label}
      </Label>
      <Switch
        id={field}
        checked={checked}
        onCheckedChange={(value) =>
          setValue(field, value, { shouldValidate: true })
        }
      />
    </div>
  );
}

export function ProductFormSidebar({
  pickTarget,
  onPickTargetChange,
}: ProductFormSidebarProps) {
  return (
    <aside className="space-y-4 lg:sticky lg:top-20 lg:w-80 lg:shrink-0 lg:self-start">
      <ProductFormSection title="Publishing">
        <StatusField />
        <FeaturedField />
      </ProductFormSection>

      <ProductFormSection title="Media library">
        <ProductMediaSidebar
          pickTarget={pickTarget}
          onPickTargetChange={onPickTargetChange}
        />
      </ProductFormSection>

      <ProductFormSection title="Product flags">
        <div className="grid grid-cols-2 gap-3">
          <FlagSwitch field="isTaxIncluded" label="Tax included" />
          <FlagSwitch field="isFragile" label="Fragile" />
          <FlagSwitch field="isPerishable" label="Perishable" />
        </div>
      </ProductFormSection>
    </aside>
  );
}
