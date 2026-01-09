"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { CategoryWithChildren, ActiveStatus } from "../types"
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
import Image from "next/image"

export const createCategoryColumns = (
    onEdit: (category: CategoryWithChildren) => void,
    onDelete: (category: CategoryWithChildren) => void
): ColumnDef<CategoryWithChildren>[] => [
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
                <DataTableColumnHeader column={column} title="Tên danh mục" />
            ),
            cell: ({ row }) => {
                const category = row.original
                return (
                    <div className="flex items-center gap-3">
                        {category.image ? (
                            <Image
                                width={100}
                                height={100}
                                src={category.image}
                                alt={category.name}
                                className="h-10 w-10 rounded object-cover"
                            />
                        ) : (
                            <div className="h-10 w-10 rounded bg-muted" />
                        )}
                        <div className="flex-col">
                            <span className="font-medium mr-2">{category.name}</span>
                            <span className="text-xs text-muted-foreground">
                                {category.slug}
                            </span>
                        </div>
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
                const status = row.getValue("status") as ActiveStatus
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
            accessorKey: "featured",
            header: "Nổi bật",
            cell: ({ row }) => {
                return row.getValue("featured") ? (
                    <Badge variant="default">Nổi bật</Badge>
                ) : "-"
            },
        },
        {
            accessorKey: "_count",
            header: "Danh mục con",
            cell: ({ row }) => {
                const count = row.original._count?.children || 0
                return (
                    <span className="text-sm text-muted-foreground">
                        {count}
                    </span>
                )
            },
        },
        {
            accessorKey: "sortOrder",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Thứ tự" />
            ),
            cell: ({ row }) => {
                return <span className="text-sm">{row.getValue("sortOrder")}</span>
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
                const category = row.original

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
                            <DropdownMenuItem onClick={() => onEdit(category)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => onDelete(category)}
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

