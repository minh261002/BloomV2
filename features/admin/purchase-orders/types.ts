import {
  PurchaseOrder,
  PurchaseOrderItem,
  PurchasePayment,
  PurchaseOrderStatus,
  PaymentStatus,
} from "@prisma/client";

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

export type { PurchaseOrder, PurchaseOrderItem, PurchasePayment };
export { PurchaseOrderStatus, PaymentStatus };


