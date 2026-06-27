export type InventoryRow = {
  variantId: string;
  sku: string;
  status: string;
  product: {
    id: string;
    title: string;
    slug: string;
    thumbnailUrl: string | null;
    lowStockThreshold: number;
  };
  attributeLabel: string;
  quantityOnHand: number;
  quantityReserved: number;
  available: number;
  isLowStock: boolean;
  hasInventory: boolean;
};

export type InventoryTransaction = {
  id: string;
  type: string;
  movementDirection: string;
  quantityChange: number;
  resultingQuantity: number;
  createdAt: string;
};

export type InventoryTransactionsResponse = {
  variant: {
    id: string;
    sku: string;
    product: { id: string; title: string };
    quantityOnHand: number;
    quantityReserved: number;
  };
  transactions: InventoryTransaction[];
};

export type AdjustInventoryPayload = {
  type: 'STOCK_IN' | 'STOCK_OUT';
  quantity: number;
  reason?: string | null;
};

export type AdjustInventoryResult = {
  variantId: string;
  sku: string;
  previousOnHand: number;
  newOnHand: number;
  quantityReserved: number;
  available: number;
};
