import { Supplier, SupplierStatus } from "@prisma/client";

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

export type { Supplier };
export { SupplierStatus };

