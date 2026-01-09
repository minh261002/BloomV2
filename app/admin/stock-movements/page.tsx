"use client";

import * as React from "react";
import { TrendingUp, TrendingDown, RefreshCw, Trash2 } from "lucide-react";
import { DataTable, useConfirmDialog } from "@/components/data-table";
import { StockMovementDialog } from "@/features/admin/stock-movements/components/stock-movement-dialog";
import { createStockMovementColumns } from "@/features/admin/stock-movements/components/stock-movement-columns";
import {
  getStockMovements,
  createStockMovement,
  deleteStockMovement,
} from "@/features/admin/stock-movements/actions";
import {
  StockMovementFormData,
  StockMovementWithRelations,
  StockMovementType,
} from "@/features/admin/stock-movements/types";
import { getProducts } from "@/features/admin/products/actions";
import { ProductWithRelations } from "@/features/admin/products/types";
import { toast } from "sonner";
import PageHeading from "@/components/page-heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function StockMovementsPage() {
  const [movements, setMovements] = React.useState<
    StockMovementWithRelations[]
  >([]);
  const [products, setProducts] = React.useState<ProductWithRelations[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogType, setDialogType] = React.useState<"OUT" | "ADJUSTMENT">(
    "OUT"
  );
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const { confirm, ConfirmDialog } = useConfirmDialog();

  const loadMovements = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await getStockMovements();
      setMovements(data);
    } catch {
      toast.error("Không thể tải lịch sử kho");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadProducts = React.useCallback(async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch {
      console.error("Failed to load products");
    }
  }, []);

  React.useEffect(() => {
    loadMovements();
    loadProducts();
  }, [loadMovements, loadProducts]);

  // Calculate stats
  const stats = React.useMemo(() => {
    const inCount = movements.filter(
      (m) => m.type === StockMovementType.IN
    ).length;
    const outCount = movements.filter(
      (m) => m.type === StockMovementType.OUT
    ).length;
    const adjustmentCount = movements.filter(
      (m) => m.type === StockMovementType.ADJUSTMENT
    ).length;

    return { inCount, outCount, adjustmentCount };
  }, [movements]);

  const handleOpenDialog = (type: "OUT" | "ADJUSTMENT") => {
    setDialogType(type);
    setDialogOpen(true);
  };

  const handleDelete = (movement: StockMovementWithRelations) => {
    confirm({
      title: "Xóa stock movement",
      description: `Bạn có chắc chắn muốn xóa movement này? Stock sẽ được revert về ${movement.stockBefore}. Hành động này không thể hoàn tác.`,
      confirmText: "Xóa",
      variant: "destructive",
      onConfirm: async () => {
        const result = await deleteStockMovement(movement.id);
        if (result.success) {
          toast.success("Đã xóa movement thành công");
          loadMovements();
        } else {
          toast.error(result.error || "Không thể xóa movement");
        }
      },
    });
  };

  const handleSubmit = async (data: StockMovementFormData) => {
    setIsSubmitting(true);
    try {
      const result = await createStockMovement(data);

      if (result.success) {
        toast.success(
          dialogType === "OUT"
            ? "Đã xuất kho thành công"
            : "Đã kiểm kê thành công"
        );
        setDialogOpen(false);
        loadMovements();
      } else {
        toast.error(result.error || "Có lỗi xảy ra");
      }
    } catch {
      toast.error("Có lỗi xảy ra khi tạo movement");
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = React.useMemo(
    () => createStockMovementColumns(handleDelete),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <div className="container mx-auto space-y-6">
      <PageHeading
        title="Lịch sử kho"
        description="Theo dõi toàn bộ xuất nhập kho và kiểm kê"
        loadAction={loadMovements}
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nhập kho</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.inCount}
            </div>
            <p className="text-xs text-muted-foreground">Từ Purchase Orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Xuất kho</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.outCount}
            </div>
            <p className="text-xs text-muted-foreground">Bán hàng, hỏng hóc</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kiểm kê</CardTitle>
            <RefreshCw className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.adjustmentCount}
            </div>
            <p className="text-xs text-muted-foreground">Điều chỉnh tồn kho</p>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button onClick={() => handleOpenDialog("OUT")} variant="destructive">
          <TrendingDown className="mr-2 h-4 w-4" />
          Xuất kho
        </Button>
        <Button
          onClick={() => handleOpenDialog("ADJUSTMENT")}
          variant="secondary"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Kiểm kê
        </Button>
      </div>

      <div className="w-full bg-card px-8 py-4 border rounded-md">
        <DataTable
          columns={columns}
          data={movements}
          loading={loading}
          searchKey="product"
          searchPlaceholder="Tìm kiếm sản phẩm..."
          filterableColumns={[
            {
              id: "type",
              title: "Loại",
              options: [
                { label: "Nhập kho", value: "IN" },
                { label: "Xuất kho", value: "OUT" },
                { label: "Kiểm kê", value: "ADJUSTMENT" },
              ],
            },
          ]}
        />
      </div>

      <StockMovementDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        type={dialogType}
        products={products}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />

      <ConfirmDialog />
    </div>
  );
}
