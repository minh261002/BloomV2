"use server";

import { revalidatePath } from "next/cache";
import slugify from "slugify";
import { prisma } from "@/lib/prisma";
import { ProductFormData, ProductWithRelations } from "./types";
import { ActiveStatus, ProductType } from "@prisma/client";

function generateSKU(name: string, variantName?: string): string {
  const prefix = name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .substring(0, 3);

  const variantPrefix = variantName
    ? "-" +
      variantName
        .split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)
    : "";

  const timestamp = Date.now().toString().slice(-6);
  return `${prefix}${variantPrefix}-${timestamp}`;
}

function generateBarcode(): string {
  const random = Math.floor(Math.random() * 1000000000000)
    .toString()
    .padStart(12, "0");
  return random;
}

export async function getProducts(): Promise<ProductWithRelations[]> {
  try {
    const products = await prisma.product.findMany({
      include: {
        images: {
          orderBy: { sortOrder: "asc" },
        },
        variants: true,
        brand: {
          select: { id: true, name: true, slug: true },
        },
        collection: {
          select: { id: true, name: true, slug: true },
        },
        productCategories: {
          include: {
            category: {
              select: { id: true, name: true, slug: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return products.map((product) => ({
      ...product,
      price: Number(product.price),
      comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
      costPrice: product.costPrice ? Number(product.costPrice) : null,
      variants: product.variants.map((v) => ({
        ...v,
        price: Number(v.price),
        comparePrice: v.comparePrice ? Number(v.comparePrice) : null,
        costPrice: v.costPrice ? Number(v.costPrice) : null,
      })),
    })) as ProductWithRelations[];
  } catch (error) {
    console.error("Error fetching products:", error);
    throw new Error("Failed to fetch products");
  }
}

export async function getProductById(
  id: string
): Promise<ProductWithRelations | null> {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { sortOrder: "asc" },
        },
        variants: true,
        brand: {
          select: { id: true, name: true, slug: true },
        },
        collection: {
          select: { id: true, name: true, slug: true },
        },
        productCategories: {
          include: {
            category: {
              select: { id: true, name: true, slug: true },
            },
          },
        },
      },
    });

    if (!product) return null;

    return {
      ...product,
      price: Number(product.price),
      comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
      costPrice: product.costPrice ? Number(product.costPrice) : null,
      variants: product.variants.map((v) => ({
        ...v,
        price: Number(v.price),
        comparePrice: v.comparePrice ? Number(v.comparePrice) : null,
        costPrice: v.costPrice ? Number(v.costPrice) : null,
      })),
    } as ProductWithRelations;
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

export async function createProduct(data: ProductFormData) {
  try {
    const slug =
      data.slug ||
      slugify(data.name, {
        lower: true,
        strict: true,
        locale: "vi",
      });

    const existingProduct = await prisma.product.findUnique({
      where: { slug },
    });

    if (existingProduct) {
      return {
        success: false,
        error: "Slug đã tồn tại. Vui lòng chọn slug khác.",
      };
    }

    const sku = data.sku || generateSKU(data.name);
    const barcode = data.barcode || generateBarcode();

    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        shortDesc: data.shortDesc,
        type: data.type,
        price: data.price,
        comparePrice: data.comparePrice,
        costPrice: data.costPrice,
        sku,
        barcode,
        trackStock: data.trackStock ?? true,
        stock: data.stock ?? 0,
        lowStock: data.lowStock ?? 10,
        status: data.status ?? ActiveStatus.ACTIVE,
        featured: data.featured ?? false,
        brandId: data.brandId || null,
        collectionId: data.collectionId || null,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        metaKeywords: data.metaKeywords,
        // Create images
        images: data.images?.length
          ? {
              create: data.images.map((url, index) => ({
                url,
                sortOrder: index,
              })),
            }
          : undefined,
        variants:
          data.type === ProductType.VARIABLE && data.variants?.length
            ? {
                create: data.variants.map((v) => ({
                  name: v.name,
                  sku: v.sku || generateSKU(data.name, v.name),
                  barcode: v.barcode || generateBarcode(),
                  price: v.price,
                  comparePrice: v.comparePrice,
                  costPrice: v.costPrice,
                  stock: v.stock,
                  image: v.image,
                  options: JSON.stringify(v.options),
                })),
              }
            : undefined,
        productCategories: data.categoryIds?.length
          ? {
              create: data.categoryIds.map((categoryId) => ({
                categoryId,
              })),
            }
          : undefined,
      },
    });

    revalidatePath("/admin/products");
    return { success: true, data: product };
  } catch (error) {
    console.error("Error creating product:", error);
    return {
      success: false,
      error: "Không thể tạo sản phẩm. Vui lòng thử lại.",
    };
  }
}

export async function updateProduct(id: string, data: ProductFormData) {
  try {
    let slug = data.slug;
    if (!slug && data.name) {
      slug = slugify(data.name, {
        lower: true,
        strict: true,
        locale: "vi",
      });
    }

    if (slug) {
      const existingProduct = await prisma.product.findFirst({
        where: {
          slug,
          NOT: { id },
        },
      });

      if (existingProduct) {
        return {
          success: false,
          error: "Slug đã tồn tại. Vui lòng chọn slug khác.",
        };
      }
    }

    await prisma.$transaction(async (tx) => {
      const existingProduct = await tx.product.findUnique({ where: { id } });

      await tx.product.update({
        where: { id },
        data: {
          name: data.name,
          slug,
          description: data.description,
          shortDesc: data.shortDesc,
          type: data.type,
          price: data.price,
          comparePrice: data.comparePrice,
          costPrice: data.costPrice,
          sku: data.sku || existingProduct?.sku || generateSKU(data.name),
          barcode:
            data.barcode || existingProduct?.barcode || generateBarcode(),
          trackStock: data.trackStock,
          stock: data.stock,
          lowStock: data.lowStock,
          status: data.status,
          featured: data.featured,
          brandId: data.brandId === "" ? null : data.brandId,
          collectionId: data.collectionId === "" ? null : data.collectionId,
          metaTitle: data.metaTitle,
          metaDescription: data.metaDescription,
          metaKeywords: data.metaKeywords,
        },
      });

      if (data.images) {
        await tx.productImage.deleteMany({ where: { productId: id } });
        if (data.images.length > 0) {
          await tx.productImage.createMany({
            data: data.images.map((url, index) => ({
              productId: id,
              url,
              sortOrder: index,
            })),
          });
        }
      }

      if (data.type === ProductType.VARIABLE && data.variants) {
        await tx.productVariant.deleteMany({ where: { productId: id } });
        if (data.variants.length > 0) {
          await tx.productVariant.createMany({
            data: data.variants.map((v) => ({
              productId: id,
              name: v.name,
              sku: v.sku || generateSKU(data.name, v.name),
              barcode: v.barcode || generateBarcode(),
              price: v.price,
              comparePrice: v.comparePrice,
              costPrice: v.costPrice,
              stock: v.stock,
              image: v.image,
              options: JSON.stringify(v.options),
            })),
          });
        }
      }

      if (data.categoryIds) {
        await tx.productCategory.deleteMany({ where: { productId: id } });
        if (data.categoryIds.length > 0) {
          await tx.productCategory.createMany({
            data: data.categoryIds.map((categoryId) => ({
              productId: id,
              categoryId,
            })),
          });
        }
      }
    });

    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    console.error("Error updating product:", error);
    return {
      success: false,
      error: "Không thể cập nhật sản phẩm. Vui lòng thử lại.",
    };
  }
}

export async function deleteProduct(id: string) {
  try {
    await prisma.product.delete({
      where: { id },
    });

    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    console.error("Error deleting product:", error);
    return {
      success: false,
      error: "Không thể xóa sản phẩm. Vui lòng thử lại.",
    };
  }
}

export async function deleteProducts(ids: string[]) {
  try {
    await prisma.product.deleteMany({
      where: { id: { in: ids } },
    });

    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    console.error("Error deleting products:", error);
    return {
      success: false,
      error: "Không thể xóa sản phẩm. Vui lòng thử lại.",
    };
  }
}

export async function updateProductsStatus(
  ids: string[],
  status: ActiveStatus
) {
  try {
    await prisma.product.updateMany({
      where: { id: { in: ids } },
      data: { status },
    });

    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    console.error("Error updating products status:", error);
    return {
      success: false,
      error: "Không thể cập nhật trạng thái. Vui lòng thử lại.",
    };
  }
}

export async function updateProductsFeatured(ids: string[], featured: boolean) {
  try {
    await prisma.product.updateMany({
      where: { id: { in: ids } },
      data: { featured },
    });

    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    console.error("Error updating products featured:", error);
    return {
      success: false,
      error: "Không thể cập nhật sản phẩm. Vui lòng thử lại.",
    };
  }
}
