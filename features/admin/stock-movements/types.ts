import {
  StockMovement,
  StockMovementType,
  Product,
  ProductVariant,
} from "@prisma/client";

export type StockMovementWithRelations = {
  id: string;
  productId: string;
  variantId: string | null;
  type: StockMovementType;
  quantity: number;
  reference: string | null;
  notes: string | null;
  stockBefore: number;
  stockAfter: number;
  createdAt: Date;
  product: {
    id: string;
    name: string;
    sku: string | null;
  };
  variant?: {
    id: string;
    name: string | null;
    sku: string | null;
  } | null;
};

export type StockMovementFormData = {
  productId: string;
  variantId?: string | null;
  type: StockMovementType;
  quantity: number;
  reference?: string;
  notes?: string;
};

export type { StockMovement };
export { StockMovementType };
