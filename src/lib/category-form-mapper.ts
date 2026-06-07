import type { Category } from '@/types/category-type';
import type { CreateCategoryFormValues } from '@/lib/validators/create-category.schema';

export function categoryToFormValues(category: Category): CreateCategoryFormValues {
  return {
    name: category.name,
    slug: category.slug,
    status: category.status,
    isFeature: category.isFeature,
    imageId: category.imageId,
    imageUrl: category.imageUrl ?? '',
  };
}
