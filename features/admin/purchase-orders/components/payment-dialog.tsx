"use client"

import * as React from "react"
import { useForm, Controller } from "react-hook-form"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { PaymentFormData } from "../types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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

interface PaymentDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    maxAmount: number
    onSubmit: (data: PaymentFormData) => Promise<void>
    isSubmitting?: boolean
}

export function PaymentDialog({
    open,
    onOpenChange,
    maxAmount,
    onSubmit,
    isSubmitting = false,
}: PaymentDialogProps) {
    const {
        register,
        handleSubmit,
        control,
        watch,
        formState: { errors },
    } = useForm<PaymentFormData>({
        defaultValues: {
            amount: maxAmount,
            paymentDate: new Date(),
            method: "",
            reference: "",
            notes: "",
        },
    })

    const paymentDate = watch("paymentDate")

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Thêm thanh toán</DialogTitle>
                    <DialogDescription>
                        Số tiền còn nợ: <span className="font-bold text-destructive">{formatPrice(maxAmount)}</span>
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="amount">
                            Số tiền <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            {...register("amount", {
                                required: "Số tiền là bắt buộc",
                                valueAsNumber: true,
                                max: { value: maxAmount, message: `Không được vượt quá ${formatPrice(maxAmount)}` },
                                min: { value: 0, message: "Số tiền phải lớn hơn 0" },
                            })}
                            placeholder="0"
                        />
                        {errors.amount && (
                            <p className="text-sm text-destructive">{errors.amount.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>Ngày thanh toán</Label>
                        <Controller
                            name="paymentDate"
                            control={control}
                            render={({ field }) => (
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !field.value && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {field.value ? format(field.value, "PPP", { locale: vi }) : "Chọn ngày"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={(date) => field.onChange(date || new Date())}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            )}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="method">Phương thức</Label>
                        <Input
                            id="method"
                            {...register("method")}
                            placeholder="Tiền mặt, Chuyển khoản, ..."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="reference">Mã tham chiếu</Label>
                        <Input
                            id="reference"
                            {...register("reference")}
                            placeholder="Mã giao dịch, số hóa đơn, ..."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Ghi chú</Label>
                        <Textarea
                            id="notes"
                            {...register("notes")}
                            placeholder="Ghi chú thêm"
                            rows={2}
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Hủy
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Đang lưu..." : "Thêm thanh toán"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}


