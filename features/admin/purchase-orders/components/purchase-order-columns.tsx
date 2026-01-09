"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Eye, Trash2, DollarSign } from "lucide-react"
import { PurchaseOrderWithRelations, PurchaseOrderStatus, PaymentStatus } from "../types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DataTableColumnHeader } from "@/components/data-table"

const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(price)
}

const statusConfig = {
    DRAFT: { label: "Nháp", variant: "outline" as const },
    ORDERED: { label: "Đã đặt", variant: "secondary" as const },
    RECEIVED: { label: "Đã nhận", variant: "default" as const },
    CANCELLED: { label: "Đã hủy", variant: "destructive" as const },
}

const paymentStatusConfig = {
    UNPAID: { label: "Chưa thanh toán", variant: "destructive" as const },
    PARTIAL: { label: "Thanh toán 1 phần", variant: "outline" as const },
    PAID: { label: "Đã thanh toán", variant: "default" as const },
}

export const createPurchaseOrderColumns = (
    onView: (order: PurchaseOrderWithRelations) => void,
    onDelete: (order: PurchaseOrderWithRelations) => void,
    onAddPayment: (order: PurchaseOrderWithRelations) => void
): ColumnDef<PurchaseOrderWithRelations>[] => [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Chọn tất cả"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Chọn dòng"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "code",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Mã phiếu" />
        ),
        cell: ({ row }) => {
            const order = row.original
            return (
                <div className="flex flex-col">
                    <span className="font-medium">{order.code}</span>
                    <span className="text-xs text-muted-foreground">
                        {order._count?.items || 0} sản phẩm
                    </span>
                </div>
            )
        },
    },
    {
        accessorKey: "supplier",
        header: "Nhà cung cấp",
        cell: ({ row }) => {
            const supplier = row.original.supplier
            return (
                <div className="flex flex-col">
                    <span className="font-medium">{supplier.name}</span>
                    <span className="text-xs text-muted-foreground">{supplier.code}</span>
                </div>
            )
        },
    },
    {
        accessorKey: "totalAmount",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Tổng tiền" />
        ),
        cell: ({ row }) => {
            return (
                <span className="font-medium">
                    {formatPrice(row.getValue("totalAmount"))}
                </span>
            )
        },
    },
    {
        accessorKey: "paidAmount",
        header: "Đã thanh toán",
        cell: ({ row }) => {
            const order = row.original
            const debt = order.totalAmount - order.paidAmount
            
            return (
                <div className="flex flex-col">
                    <span className="text-sm">{formatPrice(order.paidAmount)}</span>
                    {debt > 0 && (
                        <span className="text-xs text-destructive">
                            Nợ: {formatPrice(debt)}
                        </span>
                    )}
                </div>
            )
        },
    },
    {
        accessorKey: "status",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Trạng thái" />
        ),
        cell: ({ row }) => {
            const status = row.getValue("status") as PurchaseOrderStatus
            const config = statusConfig[status]
            return <Badge variant={config.variant}>{config.label}</Badge>
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
        },
    },
    {
        accessorKey: "paymentStatus",
        header: "Thanh toán",
        cell: ({ row }) => {
            const status = row.getValue("paymentStatus") as PaymentStatus
            const config = paymentStatusConfig[status]
            return <Badge variant={config.variant}>{config.label}</Badge>
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
        },
    },
    {
        accessorKey: "orderDate",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Ngày đặt" />
        ),
        cell: ({ row }) => {
            const date = new Date(row.getValue("orderDate"))
            return <span className="text-sm">{date.toLocaleDateString("vi-VN")}</span>
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const order = row.original

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Mở menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onView(order)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Xem chi tiết
                        </DropdownMenuItem>
                        {order.paymentStatus !== PaymentStatus.PAID && (
                            <DropdownMenuItem onClick={() => onAddPayment(order)}>
                                <DollarSign className="mr-2 h-4 w-4" />
                                Thanh toán
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => onDelete(order)}
                            className="text-destructive focus:text-destructive"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Xóa
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]


