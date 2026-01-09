"use client"

import * as React from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { SupplierForm } from "./supplier-form"
import { SupplierFormData } from "../types"
import { Supplier } from "@prisma/client"

interface SupplierDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    supplier?: Supplier | null
    onSubmit: (data: SupplierFormData) => Promise<void>
    isSubmitting?: boolean
}

export function SupplierDialog({
    open,
    onOpenChange,
    supplier,
    onSubmit,
    isSubmitting,
}: SupplierDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {supplier ? "Chỉnh sửa nhà cung cấp" : "Thêm nhà cung cấp mới"}
                    </DialogTitle>
                    <DialogDescription>
                        {supplier
                            ? "Cập nhật thông tin nhà cung cấp"
                            : "Tạo nhà cung cấp mới cho hệ thống"}
                    </DialogDescription>
                </DialogHeader>
                <SupplierForm
                    supplier={supplier}
                    onSubmit={onSubmit}
                    onCancel={() => onOpenChange(false)}
                    isSubmitting={isSubmitting}
                />
            </DialogContent>
        </Dialog>
    )
}


