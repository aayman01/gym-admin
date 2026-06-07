import type { ReactNode } from 'react';
import { productSectionClassName } from '@/components/products/product-form.constants';

type ProductFormSectionProps = {
  title?: string;
  children: ReactNode;
  className?: string;
};

export function ProductFormSection({
  title,
  children,
  className,
}: ProductFormSectionProps) {
  return (
    <div className={className ? `${productSectionClassName} ${className}` : productSectionClassName}>
      {title && <p className="text-sm font-medium">{title}</p>}
      {children}
    </div>
  );
}
