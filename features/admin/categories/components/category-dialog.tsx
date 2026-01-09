"use client"

import * as React from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { CategoryForm } from "./category-form"
import { CategoryFormData, CategoryWithChildren } from "../types"

interface CategoryDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    category?: CategoryWithChildren | null
    categories: CategoryWithChildren[]
    onSubmit: (data: CategoryFormData) => Promise<void>
    isSubmitting?: boolean
}

export function CategoryDialog({
    open,
    onOpenChange,
    category,
    categories,
    onSubmit,
    isSubmitting,
}: CategoryDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {category ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
                    </DialogTitle>
                    <DialogDescription>
                        {category
                            ? "Cập nhật thông tin danh mục"
                            : "Tạo danh mục mới cho hệ thống"}
                    </DialogDescription>
                </DialogHeader>
                <CategoryForm
                    category={category}
                    categories={categories}
                    onSubmit={onSubmit}
                    onCancel={() => onOpenChange(false)}
                    isSubmitting={isSubmitting}
                />
            </DialogContent>
        </Dialog>
    )
}

