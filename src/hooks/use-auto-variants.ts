import { useEffect, useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import {
  buildVariantOptionCombos,
  hasVariableProduct,
  mergeVariantsFromCombos,
} from "@/lib/product-variant-utils";
import {
  selectedAttributesComboKey,
  variantsEqual,
} from "@/lib/product-variant-sync";
import type { CreateProductFormValues } from "@/lib/validators/create-product.schema";

export function useAutoVariants() {
  const { setValue, getValues } = useFormContext<CreateProductFormValues>();
  const selectedAttributes =
    useWatch<CreateProductFormValues, "selectedAttributes">({
      name: "selectedAttributes",
    }) ?? [];

  const comboKey = useMemo(
    () => selectedAttributesComboKey(selectedAttributes),
    [selectedAttributes],
  );

  useEffect(() => {
    const selectedAttributes = getValues("selectedAttributes");

    if (!hasVariableProduct(selectedAttributes)) {
      const current = getValues("variants");
      if (current.length > 0) {
        setValue("variants", [], { shouldValidate: true });
      }
      return;
    }

    const combos = buildVariantOptionCombos(selectedAttributes);
    const previous = getValues("variants");
    const { slug, basePrice } = getValues();
    const merged = mergeVariantsFromCombos(combos, previous, {
      price: basePrice || 0,
      slug: slug || "product",
    });

    if (!variantsEqual(previous, merged)) {
      setValue("variants", merged, { shouldValidate: true });
    }
  }, [comboKey, getValues, setValue]);
}
