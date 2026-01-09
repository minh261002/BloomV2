"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StockMovementForm } from "./stock-movement-form";
import { StockMovementFormData } from "../types";
import { ProductWithRelations } from "@/features/admin/products/types";

interface StockMovementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "OUT" | "ADJUSTMENT";
  products: ProductWithRelations[];
  onSubmit: (data: StockMovementFormData) => Promise<void>;
  isSubmitting?: boolean;
}

export function StockMovementDialog({
  open,
  onOpenChange,
  type,
  products,
  onSubmit,
  isSubmitting,
}: StockMovementDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {type === "OUT" ? "Xuất kho" : "Kiểm kê tồn kho"}
          </DialogTitle>
          <DialogDescription>
            {type === "OUT"
              ? "Tạo phiếu xuất kho để giảm số lượng tồn kho"
              : "Điều chỉnh tồn kho về giá trị chính xác sau kiểm kê"}
          </DialogDescription>
        </DialogHeader>
        <StockMovementForm
          products={products}
          type={type}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
