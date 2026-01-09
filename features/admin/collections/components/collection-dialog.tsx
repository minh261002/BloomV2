"use client"

import * as React from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { CollectionForm } from "./collection-form"
import { CollectionFormData, CollectionWithCategory } from "../types"
import { CategoryWithChildren } from "@/features/admin/categories/types"

interface CollectionDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    collection?: CollectionWithCategory | null
    categories: CategoryWithChildren[]
    onSubmit: (data: CollectionFormData) => Promise<void>
    isSubmitting?: boolean
}

export function CollectionDialog({
    open,
    onOpenChange,
    collection,
    categories,
    onSubmit,
    isSubmitting,
}: CollectionDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {collection ? "Chỉnh sửa bộ sưu tập" : "Thêm bộ sưu tập mới"}
                    </DialogTitle>
                    <DialogDescription>
                        {collection
                            ? "Cập nhật thông tin bộ sưu tập"
                            : "Tạo bộ sưu tập mới cho hệ thống"}
                    </DialogDescription>
                </DialogHeader>
                <CollectionForm
                    collection={collection}
                    categories={categories}
                    onSubmit={onSubmit}
                    onCancel={() => onOpenChange(false)}
                    isSubmitting={isSubmitting}
                />
            </DialogContent>
        </Dialog>
    )
}


