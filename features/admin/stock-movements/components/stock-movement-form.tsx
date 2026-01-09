"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { StockMovementFormData, StockMovementType } from "../types";
import { ProductWithRelations } from "@/features/admin/products/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

interface StockMovementFormProps {
  products: ProductWithRelations[];
  type: "OUT" | "ADJUSTMENT";
  onSubmit: (data: StockMovementFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function StockMovementForm({
  products,
  type,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: StockMovementFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<StockMovementFormData>({
    defaultValues: {
      productId: "",
      variantId: null,
      type:
        type === "OUT" ? StockMovementType.OUT : StockMovementType.ADJUSTMENT,
      quantity: 1,
      reference: "",
      notes: "",
    },
  });

  const productId = watch("productId");
  const variantId = watch("variantId");
  const quantity = watch("quantity");

  const selectedProduct = React.useMemo(
    () => products.find((p) => p.id === productId),
    [products, productId]
  );

  const currentStock = React.useMemo(() => {
    if (!selectedProduct) return 0;
    if (variantId) {
      const variant = selectedProduct.variants.find((v) => v.id === variantId);
      return variant?.stock || 0;
    }
    return selectedProduct.stock;
  }, [selectedProduct, variantId]);

  const hasVariants = selectedProduct && selectedProduct.variants.length > 0;

  const handleFormSubmit = async (data: StockMovementFormData) => {
    if (!data.productId) {
      alert("Vui lòng chọn sản phẩm");
      return;
    }

    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertDescription>
          {type === "OUT"
            ? "Xuất kho sẽ giảm số lượng tồn kho"
            : "Kiểm kê sẽ đặt tồn kho về giá trị chính xác"}
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        <Label>
          Sản phẩm <span className="text-destructive">*</span>
        </Label>
        <Select
          value={productId || "__none__"}
          onValueChange={(value) =>
            setValue("productId", value === "__none__" ? "" : value)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Chọn sản phẩm" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">Chọn sản phẩm</SelectItem>
            {products.map((product) => (
              <SelectItem key={product.id} value={product.id}>
                {product.name} ({product.sku || "No SKU"})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasVariants && (
        <div className="space-y-2">
          <Label>Biến thể</Label>
          <Select
            value={variantId || "__none__"}
            onValueChange={(value) =>
              setValue("variantId", value === "__none__" ? null : value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn biến thể" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">Không chọn</SelectItem>
              {selectedProduct.variants.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.name} ({v.sku || "No SKU"})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {selectedProduct && (
        <div className="rounded-md bg-muted p-3">
          <p className="text-sm">
            <span className="font-medium">Tồn kho hiện tại:</span>{" "}
            <span className="text-lg font-bold">{currentStock}</span>
          </p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="quantity">
          {type === "OUT" ? "Số lượng xuất" : "Tồn kho mới"}{" "}
          <span className="text-destructive">*</span>
        </Label>
        <Input
          id="quantity"
          type="number"
          min="1"
          {...register("quantity", {
            required: "Số lượng là bắt buộc",
            valueAsNumber: true,
            min: { value: 1, message: "Số lượng phải lớn hơn 0" },
            max:
              type === "OUT"
                ? {
                    value: currentStock,
                    message: `Không đủ hàng (tồn: ${currentStock})`,
                  }
                : undefined,
          })}
          placeholder={
            type === "OUT" ? "Nhập số lượng xuất" : "Nhập tồn kho mới"
          }
        />
        {errors.quantity && (
          <p className="text-sm text-destructive">{errors.quantity.message}</p>
        )}
        {type === "OUT" && quantity > 0 && (
          <p className="text-sm text-muted-foreground">
            Tồn kho sau xuất: {currentStock - quantity}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="reference">Mã tham chiếu</Label>
        <Input
          id="reference"
          {...register("reference")}
          placeholder="Mã đơn hàng, mã phiếu xuất..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Ghi chú</Label>
        <Textarea
          id="notes"
          {...register("notes")}
          placeholder="Lý do xuất kho, ghi chú kiểm kê..."
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Đang lưu..."
            : type === "OUT"
            ? "Xuất kho"
            : "Kiểm kê"}
        </Button>
      </div>
    </form>
  );
}
