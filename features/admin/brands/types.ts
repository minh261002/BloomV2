import { Brand, ActiveStatus } from "@prisma/client";

export type BrandFormData = {
  name: string;
  slug?: string;
  description?: string;
  logo?: string;
  website?: string;
  featured?: boolean;
  status?: ActiveStatus;
  sortOrder?: number;
};

export type BrandBulkUpdate = {
  featured?: boolean;
  status?: ActiveStatus;
  sortOrder?: number;
};

export type { Brand };
export { ActiveStatus };
