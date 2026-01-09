"use server";

import { revalidatePath } from "next/cache";
import slugify from "slugify";
import { prisma } from "@/lib/prisma";
import { CollectionFormData, CollectionWithCategory } from "./types";
import { ActiveStatus } from "@prisma/client";

export async function getCollections(): Promise<CollectionWithCategory[]> {
  try {
    const collections = await prisma.collection.findMany({
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
    return collections;
  } catch (error) {
    console.error("Error fetching collections:", error);
    throw new Error("Failed to fetch collections");
  }
}

export async function getCollectionById(
  id: string
): Promise<CollectionWithCategory | null> {
  try {
    const collection = await prisma.collection.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
    return collection;
  } catch (error) {
    console.error("Error fetching collection:", error);
    return null;
  }
}

export async function createCollection(data: CollectionFormData) {
  try {
    const slug =
      data.slug ||
      slugify(data.name, {
        lower: true,
        strict: true,
        locale: "vi",
      });

    const existingCollection = await prisma.collection.findUnique({
      where: { slug },
    });

    if (existingCollection) {
      return {
        success: false,
        error: "Slug đã tồn tại. Vui lòng chọn slug khác.",
      };
    }

    const collection = await prisma.collection.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        image: data.image,
        categoryId: data.categoryId || null,
        featured: data.featured ?? false,
        status: data.status ?? ActiveStatus.ACTIVE,
        sortOrder: data.sortOrder ?? 0,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        metaKeywords: data.metaKeywords,
      },
    });

    revalidatePath("/admin/collections");
    return { success: true, data: collection };
  } catch (error) {
    console.error("Error creating collection:", error);
    return {
      success: false,
      error: "Không thể tạo bộ sưu tập. Vui lòng thử lại.",
    };
  }
}

export async function updateCollection(id: string, data: CollectionFormData) {
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
      const existingCollection = await prisma.collection.findFirst({
        where: {
          slug,
          NOT: { id },
        },
      });

      if (existingCollection) {
        return {
          success: false,
          error: "Slug đã tồn tại. Vui lòng chọn slug khác.",
        };
      }
    }

    const collection = await prisma.collection.update({
      where: { id },
      data: {
        name: data.name,
        slug,
        description: data.description,
        image: data.image,
        categoryId: data.categoryId === "" ? null : data.categoryId,
        featured: data.featured,
        status: data.status,
        sortOrder: data.sortOrder,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        metaKeywords: data.metaKeywords,
      },
    });

    revalidatePath("/admin/collections");
    return { success: true, data: collection };
  } catch (error) {
    console.error("Error updating collection:", error);
    return {
      success: false,
      error: "Không thể cập nhật bộ sưu tập. Vui lòng thử lại.",
    };
  }
}

export async function deleteCollection(id: string) {
  try {
    await prisma.collection.delete({
      where: { id },
    });

    revalidatePath("/admin/collections");
    return { success: true };
  } catch (error) {
    console.error("Error deleting collection:", error);
    return {
      success: false,
      error: "Không thể xóa bộ sưu tập. Vui lòng thử lại.",
    };
  }
}

export async function deleteCollections(ids: string[]) {
  try {
    await prisma.collection.deleteMany({
      where: { id: { in: ids } },
    });

    revalidatePath("/admin/collections");
    return { success: true };
  } catch (error) {
    console.error("Error deleting collections:", error);
    return {
      success: false,
      error: "Không thể xóa bộ sưu tập. Vui lòng thử lại.",
    };
  }
}

export async function updateCollectionsStatus(
  ids: string[],
  status: ActiveStatus
) {
  try {
    await prisma.collection.updateMany({
      where: { id: { in: ids } },
      data: { status },
    });

    revalidatePath("/admin/collections");
    return { success: true };
  } catch (error) {
    console.error("Error updating collections status:", error);
    return {
      success: false,
      error: "Không thể cập nhật trạng thái. Vui lòng thử lại.",
    };
  }
}

export async function updateCollectionsFeatured(ids: string[], featured: boolean) {
  try {
    await prisma.collection.updateMany({
      where: { id: { in: ids } },
      data: { featured },
    });

    revalidatePath("/admin/collections");
    return { success: true };
  } catch (error) {
    console.error("Error updating collections featured:", error);
    return {
      success: false,
      error: "Không thể cập nhật bộ sưu tập. Vui lòng thử lại.",
    };
  }
}

export async function updateCollectionsCategory(
  ids: string[],
  categoryId: string | null
) {
  try {
    await prisma.collection.updateMany({
      where: { id: { in: ids } },
      data: { categoryId },
    });

    revalidatePath("/admin/collections");
    return { success: true };
  } catch (error) {
    console.error("Error updating collections category:", error);
    return {
      success: false,
      error: "Không thể cập nhật danh mục. Vui lòng thử lại.",
    };
  }
}


