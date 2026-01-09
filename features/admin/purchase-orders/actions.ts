"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  PurchaseOrderFormData,
  PurchaseOrderWithRelations,
  PaymentFormData,
} from "./types";
import { PurchaseOrderStatus, PaymentStatus } from "@prisma/client";

// Generate PO code
function generatePOCode(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `PO${year}${month}${day}-${random}`;
}

export async function getPurchaseOrders(): Promise<
  PurchaseOrderWithRelations[]
> {
  try {
    const orders = await prisma.purchaseOrder.findMany({
      include: {
        supplier: {
          select: { id: true, name: true, code: true },
        },
        items: {
          include: {
            product: {
              select: { id: true, name: true, sku: true },
            },
            variant: {
              select: { id: true, name: true, sku: true },
            },
          },
        },
        payments: true,
        _count: {
          select: { items: true, payments: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return orders.map((order) => ({
      ...order,
      totalAmount: Number(order.totalAmount),
      paidAmount: Number(order.paidAmount),
      items: order.items.map((item) => ({
        ...item,
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.totalPrice),
      })),
      payments: order.payments.map((payment) => ({
        ...payment,
        amount: Number(payment.amount),
      })),
    }));
  } catch (error) {
    console.error("Error fetching purchase orders:", error);
    throw new Error("Failed to fetch purchase orders");
  }
}

export async function getPurchaseOrderById(
  id: string
): Promise<PurchaseOrderWithRelations | null> {
  try {
    const order = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        supplier: {
          select: { id: true, name: true, code: true },
        },
        items: {
          include: {
            product: {
              select: { id: true, name: true, sku: true },
            },
            variant: {
              select: { id: true, name: true, sku: true },
            },
          },
        },
        payments: true,
        _count: {
          select: { items: true, payments: true },
        },
      },
    });

    if (!order) return null;

    return {
      ...order,
      totalAmount: Number(order.totalAmount),
      paidAmount: Number(order.paidAmount),
      items: order.items.map((item) => ({
        ...item,
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.totalPrice),
      })),
      payments: order.payments.map((payment) => ({
        ...payment,
        amount: Number(payment.amount),
      })),
    };
  } catch (error) {
    console.error("Error fetching purchase order:", error);
    return null;
  }
}

export async function createPurchaseOrder(data: PurchaseOrderFormData) {
  try {
    const code = generatePOCode();

    // Calculate total
    const totalAmount = data.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );

    const order = await prisma.purchaseOrder.create({
      data: {
        code,
        supplierId: data.supplierId,
        totalAmount,
        paidAmount: 0,
        status: data.status ?? PurchaseOrderStatus.DRAFT,
        paymentStatus: PaymentStatus.UNPAID,
        orderDate: data.orderDate,
        notes: data.notes,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId || null,
            quantity: item.quantity,
            receivedQty: 0,
            unitPrice: item.unitPrice,
            totalPrice: item.quantity * item.unitPrice,
          })),
        },
      },
    });

    revalidatePath("/admin/purchase-orders");
    return { success: true, data: order };
  } catch (error) {
    console.error("Error creating purchase order:", error);
    return {
      success: false,
      error: "Không thể tạo phiếu nhập. Vui lòng thử lại.",
    };
  }
}

export async function updatePurchaseOrderStatus(
  id: string,
  status: PurchaseOrderStatus
) {
  try {
    const order = await prisma.purchaseOrder.update({
      where: { id },
      data: { status },
    });

    // If status is RECEIVED, update stock and create stock movements
    if (status === PurchaseOrderStatus.RECEIVED) {
      const orderWithItems = await prisma.purchaseOrder.findUnique({
        where: { id },
        include: {
          items: true,
          supplier: { select: { name: true } },
        },
      });

      if (orderWithItems) {
        // Update stock and create stock movements for each item
        for (const item of orderWithItems.items) {
          if (item.variantId) {
            // Get current variant stock
            const variant = await prisma.productVariant.findUnique({
              where: { id: item.variantId },
            });

            if (variant) {
              // Update variant stock
              await prisma.productVariant.update({
                where: { id: item.variantId },
                data: { stock: { increment: item.quantity } },
              });

              // Create stock movement
              await prisma.stockMovement.create({
                data: {
                  productId: item.productId,
                  variantId: item.variantId,
                  type: "IN",
                  quantity: item.quantity,
                  stockBefore: variant.stock,
                  stockAfter: variant.stock + item.quantity,
                  reference: orderWithItems.code,
                  notes: `Nhập hàng từ ${orderWithItems.supplier.name}`,
                },
              });
            }
          } else {
            // Get current product stock
            const product = await prisma.product.findUnique({
              where: { id: item.productId },
            });

            if (product) {
              // Update product stock
              await prisma.product.update({
                where: { id: item.productId },
                data: { stock: { increment: item.quantity } },
              });

              // Create stock movement
              await prisma.stockMovement.create({
                data: {
                  productId: item.productId,
                  variantId: null,
                  type: "IN",
                  quantity: item.quantity,
                  stockBefore: product.stock,
                  stockAfter: product.stock + item.quantity,
                  reference: orderWithItems.code,
                  notes: `Nhập hàng từ ${orderWithItems.supplier.name}`,
                },
              });
            }
          }

          // Update receivedQty for this item
          await prisma.purchaseOrderItem.update({
            where: { id: item.id },
            data: { receivedQty: item.quantity },
          });
        }

        // Set receivedDate
        await prisma.purchaseOrder.update({
          where: { id },
          data: { receivedDate: new Date() },
        });
      }
    }

    revalidatePath("/admin/purchase-orders");
    return { success: true, data: order };
  } catch (error) {
    console.error("Error updating purchase order status:", error);
    return {
      success: false,
      error: "Không thể cập nhật trạng thái. Vui lòng thử lại.",
    };
  }
}

export async function addPayment(orderId: string, data: PaymentFormData) {
  try {
    const order = await prisma.purchaseOrder.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return { success: false, error: "Không tìm thấy phiếu nhập." };
    }

    const payment = await prisma.purchasePayment.create({
      data: {
        purchaseOrderId: orderId,
        amount: data.amount,
        paymentDate: data.paymentDate,
        method: data.method,
        reference: data.reference,
        notes: data.notes,
      },
    });

    // Update paidAmount and paymentStatus
    const newPaidAmount = Number(order.paidAmount) + data.amount;
    const totalAmount = Number(order.totalAmount);

    let paymentStatus: PaymentStatus = PaymentStatus.UNPAID;
    if (newPaidAmount >= totalAmount) {
      paymentStatus = PaymentStatus.PAID;
    } else if (newPaidAmount > 0) {
      paymentStatus = PaymentStatus.PARTIAL;
    }

    await prisma.purchaseOrder.update({
      where: { id: orderId },
      data: {
        paidAmount: newPaidAmount,
        paymentStatus,
      },
    });

    revalidatePath("/admin/purchase-orders");
    return { success: true, data: payment };
  } catch (error) {
    console.error("Error adding payment:", error);
    return {
      success: false,
      error: "Không thể thêm thanh toán. Vui lòng thử lại.",
    };
  }
}

export async function deletePurchaseOrder(id: string) {
  try {
    await prisma.purchaseOrder.delete({
      where: { id },
    });

    revalidatePath("/admin/purchase-orders");
    return { success: true };
  } catch (error) {
    console.error("Error deleting purchase order:", error);
    return {
      success: false,
      error: "Không thể xóa phiếu nhập. Vui lòng thử lại.",
    };
  }
}

export async function deletePurchaseOrders(ids: string[]) {
  try {
    await prisma.purchaseOrder.deleteMany({
      where: { id: { in: ids } },
    });

    revalidatePath("/admin/purchase-orders");
    return { success: true };
  } catch (error) {
    console.error("Error deleting purchase orders:", error);
    return {
      success: false,
      error: "Không thể xóa phiếu nhập. Vui lòng thử lại.",
    };
  }
}

