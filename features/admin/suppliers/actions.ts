"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { SupplierFormData } from "./types";
import { SupplierStatus, Supplier } from "@prisma/client";

// Generate supplier code
function generateSupplierCode(name: string): string {
  const prefix = name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .substring(0, 3);
  const timestamp = Date.now().toString().slice(-6);
  return `SUP-${prefix}-${timestamp}`;
}

export async function getSuppliers(): Promise<Supplier[]> {
  try {
    const suppliers = await prisma.supplier.findMany({
      orderBy: { createdAt: "desc" },
    });
    return suppliers;
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    throw new Error("Failed to fetch suppliers");
  }
}

export async function getSupplierById(id: string): Promise<Supplier | null> {
  try {
    const supplier = await prisma.supplier.findUnique({
      where: { id },
    });
    return supplier;
  } catch (error) {
    console.error("Error fetching supplier:", error);
    return null;
  }
}

export async function createSupplier(data: SupplierFormData) {
  try {
    const code = data.code || generateSupplierCode(data.name);

    const existingSupplier = await prisma.supplier.findUnique({
      where: { code },
    });

    if (existingSupplier) {
      return {
        success: false,
        error: "Mã nhà cung cấp đã tồn tại. Vui lòng chọn mã khác.",
      };
    }

    const supplier = await prisma.supplier.create({
      data: {
        name: data.name,
        code,
        email: data.email,
        phone: data.phone,
        address: data.address,
        taxCode: data.taxCode,
        website: data.website,
        contactName: data.contactName,
        status: data.status ?? SupplierStatus.ACTIVE,
        notes: data.notes,
      },
    });

    revalidatePath("/admin/suppliers");
    return { success: true, data: supplier };
  } catch (error) {
    console.error("Error creating supplier:", error);
    return {
      success: false,
      error: "Không thể tạo nhà cung cấp. Vui lòng thử lại.",
    };
  }
}

export async function updateSupplier(id: string, data: SupplierFormData) {
  try {
    const code = data.code || generateSupplierCode(data.name);

    if (code) {
      const existingSupplier = await prisma.supplier.findFirst({
        where: {
          code,
          NOT: { id },
        },
      });

      if (existingSupplier) {
        return {
          success: false,
          error: "Mã nhà cung cấp đã tồn tại. Vui lòng chọn mã khác.",
        };
      }
    }

    const supplier = await prisma.supplier.update({
      where: { id },
      data: {
        name: data.name,
        code,
        email: data.email,
        phone: data.phone,
        address: data.address,
        taxCode: data.taxCode,
        website: data.website,
        contactName: data.contactName,
        status: data.status,
        notes: data.notes,
      },
    });

    revalidatePath("/admin/suppliers");
    return { success: true, data: supplier };
  } catch (error) {
    console.error("Error updating supplier:", error);
    return {
      success: false,
      error: "Không thể cập nhật nhà cung cấp. Vui lòng thử lại.",
    };
  }
}

export async function deleteSupplier(id: string) {
  try {
    await prisma.supplier.delete({
      where: { id },
    });

    revalidatePath("/admin/suppliers");
    return { success: true };
  } catch (error) {
    console.error("Error deleting supplier:", error);
    return {
      success: false,
      error: "Không thể xóa nhà cung cấp. Vui lòng thử lại.",
    };
  }
}

export async function deleteSuppliers(ids: string[]) {
  try {
    await prisma.supplier.deleteMany({
      where: { id: { in: ids } },
    });

    revalidatePath("/admin/suppliers");
    return { success: true };
  } catch (error) {
    console.error("Error deleting suppliers:", error);
    return {
      success: false,
      error: "Không thể xóa nhà cung cấp. Vui lòng thử lại.",
    };
  }
}

export async function updateSuppliersStatus(
  ids: string[],
  status: SupplierStatus
) {
  try {
    await prisma.supplier.updateMany({
      where: { id: { in: ids } },
      data: { status },
    });

    revalidatePath("/admin/suppliers");
    return { success: true };
  } catch (error) {
    console.error("Error updating suppliers status:", error);
    return {
      success: false,
      error: "Không thể cập nhật trạng thái. Vui lòng thử lại.",
    };
  }
}


