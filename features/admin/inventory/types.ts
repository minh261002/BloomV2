import {
  Supplier,
  PurchaseOrder,
  PurchaseOrderItem,
  PurchasePayment,
  StockMovement,
  SupplierStatus,
  PurchaseOrderStatus,
  PaymentStatus,
  StockMovementType,
} from "@prisma/client";

// ==================== SUPPLIER ====================
export type SupplierFormData = {
  name: string;
  code?: string;
  email?: string;
  phone?: string;
  address?: string;
  taxCode?: string;
  website?: string;
  contactName?: string;
  status?: SupplierStatus;
  notes?: string;
};

export type SupplierBulkUpdate = {
  status?: SupplierStatus;
};

// ==================== PURCHASE ORDER ====================
export type PurchaseOrderWithRelations = Omit<
  PurchaseOrder,
  "totalAmount" | "paidAmount"
> & {
  totalAmount: number;
  paidAmount: number;
  supplier: {
    id: string;
    name: string;
    code: string;
  };
  items: (Omit<PurchaseOrderItem, "unitPrice" | "totalPrice"> & {
    unitPrice: number;
    totalPrice: number;
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
  })[];
  payments: (Omit<PurchasePayment, "amount"> & {
    amount: number;
  })[];
  _count?: {
    items: number;
    payments: number;
  };
};

export type PurchaseOrderFormData = {
  supplierId: string;
  orderDate: Date;
  status?: PurchaseOrderStatus;
  notes?: string;
  items: {
    productId: string;
    variantId?: string | null;
    quantity: number;
    unitPrice: number;
  }[];
};

export type PurchaseOrderBulkUpdate = {
  status?: PurchaseOrderStatus;
};

export type PaymentFormData = {
  amount: number;
  paymentDate: Date;
  method?: string;
  reference?: string;
  notes?: string;
};

// ==================== STOCK MOVEMENT ====================
export type StockMovementWithRelations = Omit<StockMovement, never> & {
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

export type StockAdjustmentFormData = {
  productId: string;
  variantId?: string | null;
  quantity: number;
  type: StockMovementType;
  notes?: string;
};

// ==================== EXPORTS ====================
export type { Supplier, PurchaseOrder, PurchaseOrderItem, PurchasePayment, StockMovement };
export { SupplierStatus, PurchaseOrderStatus, PaymentStatus, StockMovementType };

