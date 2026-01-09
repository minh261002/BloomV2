"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { SupplierFormData, SupplierStatus } from "../types"
import { Supplier } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface SupplierFormProps {
    supplier?: Supplier | null
    onSubmit: (data: SupplierFormData) => Promise<void>
    onCancel: () => void
    isSubmitting?: boolean
}

export function SupplierForm({
    supplier,
    onSubmit,
    onCancel,
    isSubmitting = false,
}: SupplierFormProps) {
    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<SupplierFormData>({
        defaultValues: {
            name: supplier?.name || "",
            code: supplier?.code || "",
            email: supplier?.email || "",
            phone: supplier?.phone || "",
            address: supplier?.address || "",
            taxCode: supplier?.taxCode || "",
            website: supplier?.website || "",
            contactName: supplier?.contactName || "",
            status: supplier?.status || SupplierStatus.ACTIVE,
            notes: supplier?.notes || "",
        },
    })

    const status = watch("status")

    const handleFormSubmit = async (data: SupplierFormData) => {
        await onSubmit(data)
    }

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="name">
                        Tên nhà cung cấp <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="name"
                        {...register("name", { required: "Tên là bắt buộc" })}
                        placeholder="Nhập tên nhà cung cấp"
                    />
                    {errors.name && (
                        <p className="text-sm text-destructive">{errors.name.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="code">Mã NCC (Auto)</Label>
                    <Input
                        id="code"
                        value={watch("code") || "Auto"}
                        disabled
                        className="bg-muted"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        {...register("email")}
                        placeholder="email@example.com"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="phone">Số điện thoại</Label>
                    <Input
                        id="phone"
                        {...register("phone")}
                        placeholder="0123456789"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="contactName">Người liên hệ</Label>
                <Input
                    id="contactName"
                    {...register("contactName")}
                    placeholder="Tên người liên hệ"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="address">Địa chỉ</Label>
                <Textarea
                    id="address"
                    {...register("address")}
                    placeholder="Địa chỉ nhà cung cấp"
                    rows={2}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="taxCode">Mã số thuế</Label>
                    <Input
                        id="taxCode"
                        {...register("taxCode")}
                        placeholder="Mã số thuế"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                        id="website"
                        type="url"
                        {...register("website")}
                        placeholder="https://example.com"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="status">Trạng thái</Label>
                <Select
                    value={status}
                    onValueChange={(value) =>
                        setValue("status", value as SupplierStatus)
                    }
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={SupplierStatus.ACTIVE}>
                            Hoạt động
                        </SelectItem>
                        <SelectItem value={SupplierStatus.INACTIVE}>
                            Không hoạt động
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="notes">Ghi chú</Label>
                <Textarea
                    id="notes"
                    {...register("notes")}
                    placeholder="Ghi chú thêm"
                    rows={3}
                />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Hủy
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Đang lưu..." : supplier ? "Cập nhật" : "Tạo mới"}
                </Button>
            </div>
        </form>
    )
}

