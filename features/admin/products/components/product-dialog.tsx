"use client"

import * as React from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { ProductForm } from "./product-form"
import { ProductFormData, ProductWithRelations } from "../types"
import { CategoryWithChildren } from "@/features/admin/categories/types"
import { Brand } from "@prisma/client"

interface ProductDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    product?: ProductWithRelations | null
    categories: CategoryWithChildren[]
    brands: Brand[]
    collections: { id: string; name: string }[]
    onSubmit: (data: ProductFormData) => Promise<void>
    isSubmitting?: boolean
}

export function ProductDialog({
    open,
    onOpenChange,
    product,
    categories,
    brands,
    collections,
    onSubmit,
    isSubmitting,
}: ProductDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-6xl! max-h-[95vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {product ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
                    </DialogTitle>
                    <DialogDescription>
                        {product
                            ? "Cập nhật thông tin sản phẩm"
                            : "Tạo sản phẩm mới cho hệ thống"}
                    </DialogDescription>
                </DialogHeader>
                <ProductForm
                    product={product}
                    categories={categories}
                    brands={brands}
                    collections={collections}
                    onSubmit={onSubmit}
                    onCancel={() => onOpenChange(false)}
                    isSubmitting={isSubmitting}
                />
            </DialogContent>
        </Dialog>
    )
}

