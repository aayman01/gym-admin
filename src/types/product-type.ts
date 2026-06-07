export type ItemStatus = 'ACTIVE' | 'INACTIVE' | 'DRAFT';

export type ProductType = 'PHYSICAL' | 'DIGITAL' | 'SERVICE';

export type SellingUnit =
  | 'PIECE'
  | 'KG'
  | 'GRAM'
  | 'LITER'
  | 'MILLILITER'
  | 'METER'
  | 'CENTIMETER'
  | 'SQUARE_METER'
  | 'CUBIC_METER'
  | 'DOZEN'
  | 'PACK'
  | 'BOX'
  | 'SET'
  | 'PAIR';

export type ProductCategoryRef = {
  id: string;
  name: string;
  slug: string;
};

export type ProductBrandRef = {
  id: string;
  name: string;
  slug: string;
};

export type ProductMediaRef = {
  id: string;
  url: string;
};

export type Product = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  description: string | null;
  status: ItemStatus;
  type: ProductType;
  sellingUnit: SellingUnit;
  basePrice: string;
  isFeature: boolean;
  lowStockThreshold: number;
  tags: string[];
  metaTitle: string | null;
  metaKeywords: string | null;
  metaDescription: string | null;
  taxId: string | null;
  isTaxIncluded: boolean;
  isFragile: boolean;
  isPerishable: boolean;
  rating: string;
  createdAt: string;
  updatedAt: string;
  thumbnail: ProductMediaRef | null;
  brand: ProductBrandRef | null;
  category: ProductCategoryRef;
  secondaryCategories: Array<{ category: ProductCategoryRef }>;
  tax: { id: string; name: string } | null;
  sampleImages: Array<{ id: string; order: number; image: ProductMediaRef }>;
  variants: ProductVariant[];
};

export type ProductVariant = {
  id: string;
  sku: string;
  price: string;
  quantity: number;
  status: ItemStatus;
  isBase: boolean;
  displayImage: ProductMediaRef | null;
  inventory: { quantityOnHand: number; quantityReserved: number } | null;
  attributes: Array<{
    option: {
      id: string;
      value: string;
      attribute: { id: string; name: string };
    };
  }>;
  sampleImages: Array<{ id: string; order: number; image: ProductMediaRef }>;
};

export type GetProductsQuery = {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  brandId?: string;
  status?: ItemStatus;
  type?: ProductType;
  sellingUnit?: SellingUnit;
};

export type CreateProductVariantInput = {
  sku: string;
  price: number;
  quantity?: number;
  optionIds: string[];
  displayImageId?: string | null;
  galleryImageIds?: string[];
};

export type CreateProductBaseVariantInput = {
  sku: string;
  price: number;
  quantity?: number;
  displayImageId?: string | null;
  galleryImageIds?: string[];
};

export type CreateProductAttributeInput = {
  attributeId: string;
  optionIds: string[];
};

export type CreateProductPayload = {
  title: string;
  slug: string;
  primaryCategoryId: string;
  secondaryCategoryIds?: string[];
  thumbnailId?: string | null;
  brandId?: string | null;
  status?: ItemStatus;
  basePrice?: number;
  type?: ProductType;
  isFeature?: boolean;
  sellingUnit?: SellingUnit;
  lowStockThreshold?: number;
  tags?: string[];
  summary?: string | null;
  description?: string | null;
  metaTitle?: string | null;
  metaKeywords?: string | null;
  metaDescription?: string | null;
  taxId?: string | null;
  isTaxIncluded?: boolean;
  isFragile?: boolean;
  isPerishable?: boolean;
  productGalleryImageIds?: string[];
  attributes?: CreateProductAttributeInput[];
  variants?: CreateProductVariantInput[];
  baseVariant?: CreateProductBaseVariantInput;
};

export type UpdateProductPayload = CreateProductPayload;

export type ProductMode = 'simple' | 'variable';
