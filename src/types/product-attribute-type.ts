export type ProductAttributeOption = {
  id: string;
  value: string;
  order: number;
};

export type ProductAttributeListItem = {
  id: string;
  name: string;
  order: number;
  createdAt: string;
  updatedAt: string;
  optionsCount: number;
  options: string[];
};

export type ProductAttributeDetail = {
  id: string;
  name: string;
  order: number;
  createdAt: string;
  updatedAt: string;
  options: ProductAttributeOption[];
};
