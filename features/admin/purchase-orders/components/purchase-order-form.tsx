"use client"

import * as React from "react"
import { useForm, Controller } from "react-hook-form"
import { PurchaseOrderFormData, PurchaseOrderWithRelations, PurchaseOrderStatus } from "../types"
import { ProductWithRelations } from "@/features/admin/products/types"
import { Supplier } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { PurchaseOrderItemList } from "./purchase-order-item-list"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface PurchaseOrderFormProps {
    order?: PurchaseOrderWithRelations | null
    suppliers: Supplier[]
    products: ProductWithRelations[]
    onSubmit: (data: PurchaseOrderFormData) => Promise<void>
    onCancel: () => void
    isSubmitting?: boolean
}

export function PurchaseOrderForm({
    order,
    suppliers,
    products,
    onSubmit,
    onCancel,
    isSubmitting = false,
}: PurchaseOrderFormProps) {
    const {
        handleSubmit,
        watch,
        setValue,
        control,
        formState: { errors },
    } = useForm<PurchaseOrderFormData>({
        defaultValues: {
            supplierId: order?.supplierId || "",
            orderDate: order?.orderDate ? new Date(order.orderDate) : new Date(),
            status: order?.status || PurchaseOrderStatus.DRAFT,
            notes: order?.notes || "",
            items: order?.items.map((item) => ({
                productId: item.productId,
                variantId: item.variantId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
            })) || [],
        },
    })

    const supplierId = watch("supplierId")
    const orderDate = watch("orderDate")
    const status = watch("status")

    const handleFormSubmit = async (data: PurchaseOrderFormData) => {
        if (data.items.length === 0) {
            alert("Vui lòng thêm ít nhất 1 sản phẩm")
            return
        }

        if (!data.supplierId) {
            alert("Vui lòng chọn nhà cung cấp")
            return
        }

        await onSubmit(data)
    }

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>
                        Nhà cung cấp <span className="text-destructive">*</span>
                    </Label>
                    <Select
                        value={supplierId || "__none__"}
                        onValueChange={(value) =>
                            setValue("supplierId", value === "__none__" ? "" : value)
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Chọn nhà cung cấp" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="__none__">Chọn nhà cung cấp</SelectItem>
                            {suppliers.map((supplier) => (
                                <SelectItem key={supplier.id} value={supplier.id}>
                                    {supplier.name} ({supplier.code})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.supplierId && (
                        <p className="text-sm text-destructive">Nhà cung cấp là bắt buộc</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label>Ngày đặt hàng</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !orderDate && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {orderDate ? format(orderDate, "PPP", { locale: vi }) : "Chọn ngày"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={orderDate}
                                onSelect={(date) => setValue("orderDate", date || new Date())}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            <div className="space-y-2">
                <Label>Trạng thái</Label>
                <Select
                    value={status}
                    onValueChange={(value) =>
                        setValue("status", value as PurchaseOrderStatus)
                    }
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={PurchaseOrderStatus.DRAFT}>Nháp</SelectItem>
                        <SelectItem value={PurchaseOrderStatus.ORDERED}>Đã đặt</SelectItem>
                        <SelectItem value={PurchaseOrderStatus.RECEIVED}>Đã nhận</SelectItem>
                        <SelectItem value={PurchaseOrderStatus.CANCELLED}>Đã hủy</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Controller
                name="items"
                control={control}
                render={({ field }) => (
                    <PurchaseOrderItemList
                        products={products}
                        items={field.value}
                        onChange={field.onChange}
                    />
                )}
            />

            <div className="space-y-2">
                <Label>Ghi chú</Label>
                <Controller
                    name="notes"
                    control={control}
                    render={({ field }) => (
                        <Textarea
                            {...field}
                            placeholder="Ghi chú về đơn hàng"
                            rows={3}
                        />
                    )}
                />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Hủy
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Đang lưu..." : order ? "Cập nhật" : "Tạo phiếu nhập"}
                </Button>
            </div>
        </form>
    )
}


