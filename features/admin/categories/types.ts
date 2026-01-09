import { Category, ActiveStatus } from "@prisma/client";

export type CategoryWithChildren = Category & {
  children: CategoryWithChildren[];
  _count?: {
    children: number;
  };
};

export type CategoryFormData = {
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  parentId?: string | null;
  featured?: boolean;
  status?: ActiveStatus;
  sortOrder?: number;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
};

export type CategoryTreeNode = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  sortOrder: number;
  status: ActiveStatus;
  featured: boolean;
  image?: string | null;
  description?: string | null;
  children: CategoryTreeNode[];
  _count?: {
    children: number;
  };
};

export type MoveCategoryPayload = {
  categoryId: string;
  newParentId: string | null;
  newSortOrder: number;
};

export { ActiveStatus };
