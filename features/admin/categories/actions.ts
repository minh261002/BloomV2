"use server";

import { revalidatePath } from "next/cache";
import slugify from "slugify";
import { prisma } from "@/lib/prisma";
import {
  CategoryFormData,
  CategoryWithChildren,
  MoveCategoryPayload,
} from "./types";
import { ActiveStatus } from "@prisma/client";

export async function getCategories(): Promise<CategoryWithChildren[]> {
  try {
    // Only get root categories (parentId is null) with nested children
    const categories = await prisma.category.findMany({
      where: { parentId: null },
      include: {
        children: {
          include: {
            children: {
              include: {
                children: true,
                _count: {
                  select: { children: true },
                },
              },
            },
            _count: {
              select: { children: true },
            },
          },
        },
        _count: {
          select: { children: true },
        },
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
    return categories as CategoryWithChildren[];
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw new Error("Failed to fetch categories");
  }
}

export async function getAllCategories(): Promise<CategoryWithChildren[]> {
  try {
    // Get all categories for flat list (used in selectors)
    const categories = await prisma.category.findMany({
      include: {
        children: true,
        _count: {
          select: { children: true },
        },
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
    return categories as CategoryWithChildren[];
  } catch (error) {
    console.error("Error fetching all categories:", error);
    throw new Error("Failed to fetch all categories");
  }
}

export async function getRootCategories(): Promise<CategoryWithChildren[]> {
  try {
    const categories = await prisma.category.findMany({
      where: { parentId: null },
      include: {
        children: {
          include: {
            children: {
              include: {
                children: true,
                _count: {
                  select: { children: true },
                },
              },
            },
            _count: {
              select: { children: true },
            },
          },
        },
        _count: {
          select: { children: true },
        },
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
    return categories as CategoryWithChildren[];
  } catch (error) {
    console.error("Error fetching root categories:", error);
    throw new Error("Failed to fetch root categories");
  }
}

export async function getCategoryById(
  id: string
): Promise<CategoryWithChildren | null> {
  try {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        children: true,
        parent: true,
        _count: {
          select: { children: true },
        },
      },
    });
    return category as CategoryWithChildren | null;
  } catch (error) {
    console.error("Error fetching category:", error);
    return null;
  }
}

export async function createCategory(data: CategoryFormData) {
  try {
    const slug =
      data.slug ||
      slugify(data.name, {
        lower: true,
        strict: true,
        locale: "vi",
      });

    const existingCategory = await prisma.category.findUnique({
      where: { slug },
    });

    if (existingCategory) {
      return {
        success: false,
        error: "Slug đã tồn tại. Vui lòng chọn slug khác.",
      };
    }

    const category = await prisma.category.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        image: data.image,
        parentId: data.parentId || null,
        featured: data.featured ?? false,
        status: data.status ?? ActiveStatus.ACTIVE,
        sortOrder: data.sortOrder ?? 0,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        metaKeywords: data.metaKeywords,
      },
    });

    revalidatePath("/admin/categories");
    return { success: true, data: category };
  } catch (error) {
    console.error("Error creating category:", error);
    return {
      success: false,
      error: "Không thể tạo danh mục. Vui lòng thử lại.",
    };
  }
}

export async function updateCategory(id: string, data: CategoryFormData) {
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
      const existingCategory = await prisma.category.findFirst({
        where: {
          slug,
          NOT: { id },
        },
      });

      if (existingCategory) {
        return {
          success: false,
          error: "Slug đã tồn tại. Vui lòng chọn slug khác.",
        };
      }
    }

    if (data.parentId) {
      const isDescendant = await checkIfDescendant(id, data.parentId);
      if (isDescendant || data.parentId === id) {
        return {
          success: false,
          error:
            "Không thể đặt danh mục cha là chính nó hoặc danh mục con của nó.",
        };
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name: data.name,
        slug,
        description: data.description,
        image: data.image,
        parentId: data.parentId === "" ? null : data.parentId,
        featured: data.featured,
        status: data.status,
        sortOrder: data.sortOrder,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        metaKeywords: data.metaKeywords,
      },
    });

    revalidatePath("/admin/categories");
    return { success: true, data: category };
  } catch (error) {
    console.error("Error updating category:", error);
    return {
      success: false,
      error: "Không thể cập nhật danh mục. Vui lòng thử lại.",
    };
  }
}

export async function deleteCategory(id: string) {
  try {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { children: true },
        },
      },
    });

    if (!category) {
      return {
        success: false,
        error: "Không tìm thấy danh mục.",
      };
    }

    if (category._count.children > 0) {
      return {
        success: false,
        error:
          "Không thể xóa danh mục có danh mục con. Vui lòng xóa danh mục con trước.",
      };
    }

    await prisma.category.delete({
      where: { id },
    });

    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error) {
    console.error("Error deleting category:", error);
    return {
      success: false,
      error: "Không thể xóa danh mục. Vui lòng thử lại.",
    };
  }
}

export async function deleteCategories(ids: string[]) {
  try {
    const categories = await prisma.category.findMany({
      where: { id: { in: ids } },
      include: {
        _count: {
          select: { children: true },
        },
      },
    });

    const categoriesWithChildren = categories.filter(
      (c) => c._count.children > 0
    );

    if (categoriesWithChildren.length > 0) {
      return {
        success: false,
        error: `Không thể xóa ${categoriesWithChildren.length} danh mục có danh mục con.`,
      };
    }

    await prisma.category.deleteMany({
      where: { id: { in: ids } },
    });

    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error) {
    console.error("Error deleting categories:", error);
    return {
      success: false,
      error: "Không thể xóa danh mục. Vui lòng thử lại.",
    };
  }
}

export async function moveCategory(payload: MoveCategoryPayload) {
  try {
    const { categoryId, newParentId, newSortOrder } = payload;

    if (newParentId) {
      const isDescendant = await checkIfDescendant(categoryId, newParentId);
      if (isDescendant || newParentId === categoryId) {
        return {
          success: false,
          error:
            "Không thể di chuyển danh mục vào chính nó hoặc danh mục con của nó.",
        };
      }
    }

    await prisma.category.update({
      where: { id: categoryId },
      data: {
        parentId: newParentId,
        sortOrder: newSortOrder,
      },
    });

    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error) {
    console.error("Error moving category:", error);
    return {
      success: false,
      error: "Không thể di chuyển danh mục. Vui lòng thử lại.",
    };
  }
}

export async function updateCategorySortOrders(
  updates: { id: string; sortOrder: number; parentId?: string | null }[]
) {
  try {
    await prisma.$transaction(
      updates.map((update) =>
        prisma.category.update({
          where: { id: update.id },
          data: {
            sortOrder: update.sortOrder,
            ...(update.parentId !== undefined && { parentId: update.parentId }),
          },
        })
      )
    );

    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error) {
    console.error("Error updating sort orders:", error);
    return {
      success: false,
      error: "Không thể cập nhật thứ tự. Vui lòng thử lại.",
    };
  }
}

export async function updateCategoriesStatus(
  ids: string[],
  status: ActiveStatus
) {
  try {
    await prisma.category.updateMany({
      where: { id: { in: ids } },
      data: { status },
    });

    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error) {
    console.error("Error updating categories status:", error);
    return {
      success: false,
      error: "Không thể cập nhật trạng thái. Vui lòng thử lại.",
    };
  }
}

async function checkIfDescendant(
  categoryId: string,
  potentialAncestorId: string
): Promise<boolean> {
  const category = await prisma.category.findUnique({
    where: { id: potentialAncestorId },
    include: { parent: true },
  });

  if (!category) return false;
  if (category.id === categoryId) return true;
  if (!category.parentId) return false;

  return checkIfDescendant(categoryId, category.parentId);
}
