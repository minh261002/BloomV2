"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Pencil, Trash2, ExternalLink, Mail, Phone } from "lucide-react"
import { Supplier, SupplierStatus } from "@prisma/client"
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

export const createSupplierColumns = (
    onEdit: (supplier: Supplier) => void,
    onDelete: (supplier: Supplier) => void
): ColumnDef<Supplier>[] => [
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
        accessorKey: "name",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Nhà cung cấp" />
        ),
        cell: ({ row }) => {
            const supplier = row.original
            return (
                <div className="flex flex-col">
                    <span className="font-medium">{supplier.name}</span>
                    <span className="text-xs text-muted-foreground">
                        {supplier.code}
                    </span>
                </div>
            )
        },
    },
    {
        accessorKey: "contactName",
        header: "Người liên hệ",
        cell: ({ row }) => {
            const contactName = row.getValue("contactName") as string | null
            return contactName ? (
                <span className="text-sm">{contactName}</span>
            ) : (
                <span className="text-sm text-muted-foreground">-</span>
            )
        },
    },
    {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => {
            const email = row.getValue("email") as string | null
            return email ? (
                <a
                    href={`mailto:${email}`}
                    className="flex items-center gap-1 text-sm text-primary hover:underline"
                >
                    <Mail className="h-3 w-3" />
                    {email}
                </a>
            ) : (
                <span className="text-sm text-muted-foreground">-</span>
            )
        },
    },
    {
        accessorKey: "phone",
        header: "Điện thoại",
        cell: ({ row }) => {
            const phone = row.getValue("phone") as string | null
            return phone ? (
                <a
                    href={`tel:${phone}`}
                    className="flex items-center gap-1 text-sm text-primary hover:underline"
                >
                    <Phone className="h-3 w-3" />
                    {phone}
                </a>
            ) : (
                <span className="text-sm text-muted-foreground">-</span>
            )
        },
    },
    {
        accessorKey: "status",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Trạng thái" />
        ),
        cell: ({ row }) => {
            const status = row.getValue("status") as SupplierStatus
            return (
                <Badge variant={status === "ACTIVE" ? "default" : "outline"}>
                    {status === "ACTIVE" ? "Hoạt động" : "Không hoạt động"}
                </Badge>
            )
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
        },
    },
    {
        accessorKey: "createdAt",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Ngày tạo" />
        ),
        cell: ({ row }) => {
            const date = new Date(row.getValue("createdAt"))
            return <span className="text-sm">{date.toLocaleDateString("vi-VN")}</span>
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const supplier = row.original

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
                        <DropdownMenuItem onClick={() => onEdit(supplier)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                        </DropdownMenuItem>
                        {supplier.website && (
                            <DropdownMenuItem asChild>
                                <a
                                    href={supplier.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    Mở website
                                </a>
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => onDelete(supplier)}
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


