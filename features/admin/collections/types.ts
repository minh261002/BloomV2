import { Collection, ActiveStatus } from "@prisma/client";

export type CollectionWithCategory = Collection & {
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
};

export type CollectionFormData = {
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  categoryId?: string | null;
  featured?: boolean;
  status?: ActiveStatus;
  sortOrder?: number;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
};

export type CollectionBulkUpdate = {
  featured?: boolean;
  status?: ActiveStatus;
  categoryId?: string | null;
  sortOrder?: number;
};

export type { Collection };
export { ActiveStatus };
