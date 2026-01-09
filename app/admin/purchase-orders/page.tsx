"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";
import {
  DataTable,
  useBulkActions,
  useConfirmDialog,
} from "@/components/data-table";
import { PurchaseOrderDialog } from "@/features/admin/purchase-orders/components/purchase-order-dialog";
import { PaymentDialog } from "@/features/admin/purchase-orders/components/payment-dialog";
import { createPurchaseOrderColumns } from "@/features/admin/purchase-orders/components/purchase-order-columns";
import {
  getPurchaseOrders,
  createPurchaseOrder,
  addPayment,
  deletePurchaseOrder,
  deletePurchaseOrders,
} from "@/features/admin/purchase-orders/actions";
import {
  PurchaseOrderFormData,
  PurchaseOrderWithRelations,
  PurchaseOrderBulkUpdate,
  PurchaseOrderStatus,
  PaymentFormData,
} from "@/features/admin/purchase-orders/types";
import { getSuppliers } from "@/features/admin/suppliers/actions";
import { getProducts } from "@/features/admin/products/actions";
import { Supplier } from "@prisma/client";
import { ProductWithRelations } from "@/features/admin/products/types";
import { toast } from "sonner";
import PageHeading from "@/components/page-heading";

export default function PurchaseOrdersPage() {
  const [orders, setOrders] = React.useState<PurchaseOrderWithRelations[]>([]);
  const [suppliers, setSuppliers] = React.useState<Supplier[]>([]);
  const [products, setProducts] = React.useState<ProductWithRelations[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = React.useState(false);
  const [selectedOrder, setSelectedOrder] =
    React.useState<PurchaseOrderWithRelations | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const { confirm, ConfirmDialog } = useConfirmDialog();

  const loadOrders = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPurchaseOrders();
      setOrders(data);
    } catch {
      toast.error("Không thể tải phiếu nhập");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadRelatedData = React.useCallback(async () => {
    try {
      const [suppliersData, productsData] = await Promise.all([
        getSuppliers(),
        getProducts(),
      ]);
      setSuppliers(suppliersData);
      setProducts(productsData);
    } catch {
      console.error("Failed to load related data");
    }
  }, []);

  React.useEffect(() => {
    loadOrders();
    loadRelatedData();
  }, [loadOrders, loadRelatedData]);

  const bulkActions = useBulkActions<
    PurchaseOrderWithRelations,
    PurchaseOrderBulkUpdate
  >();

  // Calculate stats
  const stats = React.useMemo(() => {
    const total = orders.length;
    const totalAmount = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalDebt = orders.reduce(
      (sum, o) => sum + (o.totalAmount - o.paidAmount),
      0
    );
    const pending = orders.filter(
      (o) =>
        o.status === PurchaseOrderStatus.ORDERED ||
        o.status === PurchaseOrderStatus.DRAFT
    ).length;

    return { total, totalAmount, totalDebt, pending };
  }, [orders]);

  const handleAdd = () => {
    setSelectedOrder(null);
    setDialogOpen(true);
  };

  const handleView = (order: PurchaseOrderWithRelations) => {
    setSelectedOrder(order);
    setDialogOpen(true);
  };

  const handleDelete = (order: PurchaseOrderWithRelations) => {
    confirm({
      title: "Xóa phiếu nhập",
      description: `Bạn có chắc chắn muốn xóa phiếu nhập "${order.code}"? Hành động này không thể hoàn tác.`,
      confirmText: "Xóa",
      variant: "destructive",
      onConfirm: async () => {
        const result = await deletePurchaseOrder(order.id);
        if (result.success) {
          toast.success("Đã xóa phiếu nhập thành công");
          loadOrders();
        } else {
          toast.error(result.error || "Không thể xóa phiếu nhập");
        }
      },
    });
  };

  const handleAddPayment = (order: PurchaseOrderWithRelations) => {
    setSelectedOrder(order);
    setPaymentDialogOpen(true);
  };

  const handleSubmit = async (data: PurchaseOrderFormData) => {
    setIsSubmitting(true);
    try {
      const result = await createPurchaseOrder(data);

      if (result.success) {
        toast.success("Đã tạo phiếu nhập thành công");
        setDialogOpen(false);
        loadOrders();
      } else {
        toast.error(result.error || "Có lỗi xảy ra");
      }
    } catch {
      toast.error("Có lỗi xảy ra khi tạo phiếu nhập");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSubmit = async (data: PaymentFormData) => {
    if (!selectedOrder) return;

    setIsSubmitting(true);
    try {
      const result = await addPayment(selectedOrder.id, data);

      if (result.success) {
        toast.success("Đã thêm thanh toán thành công");
        setPaymentDialogOpen(false);
        loadOrders();
      } else {
        toast.error(result.error || "Có lỗi xảy ra");
      }
    } catch {
      toast.error("Có lỗi xảy ra khi thêm thanh toán");
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = React.useMemo(
    () =>
      createPurchaseOrderColumns(handleView, handleDelete, handleAddPayment),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <div className="container mx-auto space-y-6">
      <PageHeading
        title="Phiếu nhập hàng"
        description="Quản lý phiếu nhập hàng và thanh toán nhà cung cấp"
        loadAction={loadOrders}
        addAction={handleAdd}
        addActionLabel="Tạo phiếu nhập"
      />

      <div className="w-full bg-card px-8 py-4 border rounded-md">
        <DataTable
          columns={columns}
          data={orders}
          loading={loading}
          searchKey="code"
          searchPlaceholder="Tìm kiếm mã phiếu..."
          filterableColumns={[
            {
              id: "status",
              title: "Trạng thái",
              options: [
                { label: "Nháp", value: "DRAFT" },
                { label: "Đã đặt", value: "ORDERED" },
                { label: "Đã nhận", value: "RECEIVED" },
                { label: "Đã hủy", value: "CANCELLED" },
              ],
            },
            {
              id: "paymentStatus",
              title: "Thanh toán",
              options: [
                { label: "Chưa thanh toán", value: "UNPAID" },
                { label: "Thanh toán 1 phần", value: "PARTIAL" },
                { label: "Đã thanh toán", value: "PAID" },
              ],
            },
          ]}
          bulkActions={[
            bulkActions.createBulkAction({
              label: "Xóa",
              icon: Trash2,
              variant: "destructive",
              onClick: async (items: PurchaseOrderWithRelations[]) => {
                const result = await deletePurchaseOrders(
                  items.map((i) => i.id)
                );
                if (result.success) {
                  toast.success(`Đã xóa ${items.length} phiếu nhập`);
                  loadOrders();
                } else {
                  toast.error(result.error || "Không thể xóa phiếu nhập");
                }
              },
              confirmBefore: {
                title: "Xóa phiếu nhập",
                description: (count: number) =>
                  `Bạn có chắc chắn muốn xóa ${count} phiếu nhập? Hành động này không thể hoàn tác.`,
                confirmText: "Xóa",
              },
            }),
          ]}
        />
      </div>

      <PurchaseOrderDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        order={selectedOrder}
        suppliers={suppliers}
        products={products}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />

      {selectedOrder && (
        <PaymentDialog
          open={paymentDialogOpen}
          onOpenChange={setPaymentDialogOpen}
          maxAmount={selectedOrder.totalAmount - selectedOrder.paidAmount}
          onSubmit={handlePaymentSubmit}
          isSubmitting={isSubmitting}
        />
      )}

      <ConfirmDialog />
      <bulkActions.ConfirmDialog />
    </div>
  );
}

