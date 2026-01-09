"use server";

import { revalidatePath } from "next/cache";
import slugify from "slugify";
import { prisma } from "@/lib/prisma";
import { BrandFormData } from "./types";
import { Brand, ActiveStatus } from "@prisma/client";

export async function getBrands(): Promise<Brand[]> {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
    return brands;
  } catch (error) {
    console.error("Error fetching brands:", error);
    throw new Error("Failed to fetch brands");
  }
}

export async function getBrandById(id: string): Promise<Brand | null> {
  try {
    const brand = await prisma.brand.findUnique({
      where: { id },
    });
    return brand;
  } catch (error) {
    console.error("Error fetching brand:", error);
    return null;
  }
}

export async function createBrand(data: BrandFormData) {
  try {
    const slug =
      data.slug ||
      slugify(data.name, {
        lower: true,
        strict: true,
        locale: "vi",
      });

    const existingBrand = await prisma.brand.findUnique({
      where: { slug },
    });

    if (existingBrand) {
      return {
        success: false,
        error: "Slug đã tồn tại. Vui lòng chọn slug khác.",
      };
    }

    const brand = await prisma.brand.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        logo: data.logo,
        website: data.website,
        featured: data.featured ?? false,
        status: data.status ?? ActiveStatus.ACTIVE,
        sortOrder: data.sortOrder ?? 0,
      },
    });

    revalidatePath("/admin/brands");
    return { success: true, data: brand };
  } catch (error) {
    console.error("Error creating brand:", error);
    return {
      success: false,
      error: "Không thể tạo thương hiệu. Vui lòng thử lại.",
    };
  }
}

export async function updateBrand(id: string, data: BrandFormData) {
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
      const existingBrand = await prisma.brand.findFirst({
        where: {
          slug,
          NOT: { id },
        },
      });

      if (existingBrand) {
        return {
          success: false,
          error: "Slug đã tồn tại. Vui lòng chọn slug khác.",
        };
      }
    }

    const brand = await prisma.brand.update({
      where: { id },
      data: {
        name: data.name,
        slug,
        description: data.description,
        logo: data.logo,
        website: data.website,
        featured: data.featured,
        status: data.status,
        sortOrder: data.sortOrder,
      },
    });

    revalidatePath("/admin/brands");
    return { success: true, data: brand };
  } catch (error) {
    console.error("Error updating brand:", error);
    return {
      success: false,
      error: "Không thể cập nhật thương hiệu. Vui lòng thử lại.",
    };
  }
}

export async function deleteBrand(id: string) {
  try {
    await prisma.brand.delete({
      where: { id },
    });

    revalidatePath("/admin/brands");
    return { success: true };
  } catch (error) {
    console.error("Error deleting brand:", error);
    return {
      success: false,
      error: "Không thể xóa thương hiệu. Vui lòng thử lại.",
    };
  }
}

export async function deleteBrands(ids: string[]) {
  try {
    await prisma.brand.deleteMany({
      where: { id: { in: ids } },
    });

    revalidatePath("/admin/brands");
    return { success: true };
  } catch (error) {
    console.error("Error deleting brands:", error);
    return {
      success: false,
      error: "Không thể xóa thương hiệu. Vui lòng thử lại.",
    };
  }
}

export async function updateBrandsFeatured(ids: string[], featured: boolean) {
  try {
    await prisma.brand.updateMany({
      where: { id: { in: ids } },
      data: { featured },
    });

    revalidatePath("/admin/brands");
    return { success: true };
  } catch (error) {
    console.error("Error updating brands featured:", error);
    return {
      success: false,
      error: "Không thể cập nhật thương hiệu. Vui lòng thử lại.",
    };
  }
}

export async function updateBrandsStatus(ids: string[], status: ActiveStatus) {
  try {
    await prisma.brand.updateMany({
      where: { id: { in: ids } },
      data: { status },
    });

    revalidatePath("/admin/brands");
    return { success: true };
  } catch (error) {
    console.error("Error updating brands status:", error);
    return {
      success: false,
      error: "Không thể cập nhật trạng thái. Vui lòng thử lại.",
    };
  }
}

export async function updateBrandsSortOrder(
  updates: { id: string; sortOrder: number }[]
) {
  try {
    await prisma.$transaction(
      updates.map((update) =>
        prisma.brand.update({
          where: { id: update.id },
          data: { sortOrder: update.sortOrder },
        })
      )
    );

    revalidatePath("/admin/brands");
    return { success: true };
  } catch (error) {
    console.error("Error updating sort orders:", error);
    return {
      success: false,
      error: "Không thể cập nhật thứ tự. Vui lòng thử lại.",
    };
  }
}
