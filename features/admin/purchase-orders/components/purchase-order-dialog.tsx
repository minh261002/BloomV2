"use client"

import * as React from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { PurchaseOrderForm } from "./purchase-order-form"
import { PurchaseOrderFormData, PurchaseOrderWithRelations } from "../types"
import { ProductWithRelations } from "@/features/admin/products/types"
import { Supplier } from "@prisma/client"

interface PurchaseOrderDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    order?: PurchaseOrderWithRelations | null
    suppliers: Supplier[]
    products: ProductWithRelations[]
    onSubmit: (data: PurchaseOrderFormData) => Promise<void>
    isSubmitting?: boolean
}

export function PurchaseOrderDialog({
    open,
    onOpenChange,
    order,
    suppliers,
    products,
    onSubmit,
    isSubmitting,
}: PurchaseOrderDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {order ? "Chỉnh sửa phiếu nhập" : "Tạo phiếu nhập hàng mới"}
                    </DialogTitle>
                    <DialogDescription>
                        {order
                            ? "Cập nhật thông tin phiếu nhập hàng"
                            : "Tạo phiếu nhập hàng từ nhà cung cấp"}
                    </DialogDescription>
                </DialogHeader>
                <PurchaseOrderForm
                    order={order}
                    suppliers={suppliers}
                    products={products}
                    onSubmit={onSubmit}
                    onCancel={() => onOpenChange(false)}
                    isSubmitting={isSubmitting}
                />
            </DialogContent>
        </Dialog>
    )
}


