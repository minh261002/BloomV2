"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { StockMovementFormData, StockMovementWithRelations } from "./types";
import { StockMovementType } from "@prisma/client";

export async function getStockMovements(): Promise<
  StockMovementWithRelations[]
> {
  try {
    const movements = await prisma.stockMovement.findMany({
      include: {
        product: {
          select: { id: true, name: true, sku: true },
        },
        variant: {
          select: { id: true, name: true, sku: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return movements;
  } catch (error) {
    console.error("Error fetching stock movements:", error);
    throw new Error("Failed to fetch stock movements");
  }
}

export async function getStockMovementsByProduct(
  productId: string
): Promise<StockMovementWithRelations[]> {
  try {
    const movements = await prisma.stockMovement.findMany({
      where: { productId },
      include: {
        product: {
          select: { id: true, name: true, sku: true },
        },
        variant: {
          select: { id: true, name: true, sku: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return movements;
  } catch (error) {
    console.error("Error fetching stock movements by product:", error);
    throw new Error("Failed to fetch stock movements");
  }
}

export async function createStockMovement(data: StockMovementFormData) {
  try {
    // Only allow OUT and ADJUSTMENT types (IN is auto-created from PO)
    if (data.type === StockMovementType.IN) {
      return {
        success: false,
        error: "Không thể tạo movement IN thủ công. Sử dụng Purchase Order.",
      };
    }

    // Get current stock
    let currentStock = 0;
    if (data.variantId) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: data.variantId },
      });
      if (!variant) {
        return { success: false, error: "Không tìm thấy variant." };
      }
      currentStock = variant.stock;
    } else {
      const product = await prisma.product.findUnique({
        where: { id: data.productId },
      });
      if (!product) {
        return { success: false, error: "Không tìm thấy sản phẩm." };
      }
      currentStock = product.stock;
    }

    // Calculate new stock based on type
    let newStock = currentStock;
    if (data.type === StockMovementType.OUT) {
      newStock = currentStock - data.quantity;
      if (newStock < 0) {
        return {
          success: false,
          error: `Không đủ hàng trong kho. Tồn kho hiện tại: ${currentStock}`,
        };
      }
    } else if (data.type === StockMovementType.ADJUSTMENT) {
      // For adjustment, quantity is the new stock value
      newStock = data.quantity;
    }

    // Create movement and update stock in transaction
    await prisma.$transaction(async (tx) => {
      // Create stock movement
      await tx.stockMovement.create({
        data: {
          productId: data.productId,
          variantId: data.variantId || null,
          type: data.type,
          quantity: data.quantity,
          reference: data.reference,
          notes: data.notes,
          stockBefore: currentStock,
          stockAfter: newStock,
        },
      });

      // Update stock
      if (data.variantId) {
        await tx.productVariant.update({
          where: { id: data.variantId },
          data: { stock: newStock },
        });
      } else {
        await tx.product.update({
          where: { id: data.productId },
          data: { stock: newStock },
        });
      }
    });

    revalidatePath("/admin/stock-movements");
    return { success: true };
  } catch (error) {
    console.error("Error creating stock movement:", error);
    return {
      success: false,
      error: "Không thể tạo stock movement. Vui lòng thử lại.",
    };
  }
}

export async function deleteStockMovement(id: string) {
  try {
    // Get the movement to check if it's from a PO
    const movement = await prisma.stockMovement.findUnique({
      where: { id },
    });

    if (!movement) {
      return { success: false, error: "Không tìm thấy stock movement." };
    }

    // Don't allow deleting movements from Purchase Orders
    if (movement.reference?.startsWith("PO")) {
      return {
        success: false,
        error:
          "Không thể xóa movement từ Purchase Order. Vui lòng xóa phiếu nhập.",
      };
    }

    // Revert stock to stockBefore
    await prisma.$transaction(async (tx) => {
      if (movement.variantId) {
        await tx.productVariant.update({
          where: { id: movement.variantId },
          data: { stock: movement.stockBefore },
        });
      } else {
        await tx.product.update({
          where: { id: movement.productId },
          data: { stock: movement.stockBefore },
        });
      }

      await tx.stockMovement.delete({
        where: { id },
      });
    });

    revalidatePath("/admin/stock-movements");
    return { success: true };
  } catch (error) {
    console.error("Error deleting stock movement:", error);
    return {
      success: false,
      error: "Không thể xóa stock movement. Vui lòng thử lại.",
    };
  }
}
