"use client"

import * as React from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { BrandForm } from "./brand-form"
import { BrandFormData } from "../types"
import { Brand } from "@prisma/client"

interface BrandDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    brand?: Brand | null
    onSubmit: (data: BrandFormData) => Promise<void>
    isSubmitting?: boolean
}

export function BrandDialog({
    open,
    onOpenChange,
    brand,
    onSubmit,
    isSubmitting,
}: BrandDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {brand ? "Chỉnh sửa thương hiệu" : "Thêm thương hiệu mới"}
                    </DialogTitle>
                    <DialogDescription>
                        {brand
                            ? "Cập nhật thông tin thương hiệu"
                            : "Tạo thương hiệu mới cho hệ thống"}
                    </DialogDescription>
                </DialogHeader>
                <BrandForm
                    brand={brand}
                    onSubmit={onSubmit}
                    onCancel={() => onOpenChange(false)}
                    isSubmitting={isSubmitting}
                />
            </DialogContent>
        </Dialog>
    )
}

