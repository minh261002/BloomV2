import {
  Product,
  ProductImage,
  ProductVariant,
  ProductType,
  ActiveStatus,
} from "@prisma/client";

export type ProductWithRelations = Omit<
  Product,
  "price" | "comparePrice" | "costPrice"
> & {
  price: number;
  comparePrice: number | null;
  costPrice: number | null;
  images: ProductImage[];
  variants: (Omit<ProductVariant, "price" | "comparePrice" | "costPrice"> & {
    price: number;
    comparePrice: number | null;
    costPrice: number | null;
  })[];
  brand?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  collection?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  productCategories: {
    category: {
      id: string;
      name: string;
      slug: string;
    };
  }[];
};

export type ProductFormData = {
  // Basic Info
  name: string;
  slug?: string;
  description?: string;
  shortDesc?: string;

  // Type & Pricing
  type: ProductType;
  price: number;
  comparePrice?: number;
  costPrice?: number;

  // Inventory
  sku?: string;
  barcode?: string;
  trackStock?: boolean;
  stock?: number;
  lowStock?: number;

  // Status
  status?: ActiveStatus;
  featured?: boolean;

  // Relationships
  categoryIds?: string[];
  brandId?: string | null;
  collectionId?: string | null;

  // SEO
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;

  // Images & Variants
  images?: string[];
  variants?: VariantFormData[];
};

export type VariantFormData = {
  id?: string;
  name?: string;
  sku?: string;
  barcode?: string;
  price: number;
  comparePrice?: number;
  costPrice?: number;
  stock: number;
  image?: string;
  options: Record<string, string>; // {"size": "M", "color": "Red"}
};

export type ProductBulkUpdate = {
  status?: ActiveStatus;
  featured?: boolean;
  categoryIds?: string[];
  brandId?: string | null;
  collectionId?: string | null;
};

export type { Product, ProductImage, ProductVariant };
export { ProductType, ActiveStatus };
