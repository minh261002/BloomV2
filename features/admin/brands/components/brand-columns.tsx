"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Pencil, Trash2, ExternalLink } from "lucide-react"
import { ActiveStatus, Brand } from "@prisma/client"
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

export const createBrandColumns = (
    onEdit: (brand: Brand) => void,
    onDelete: (brand: Brand) => void
): ColumnDef<Brand>[] => [
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
                <DataTableColumnHeader column={column} title="Tên thương hiệu" />
            ),
            cell: ({ row }) => {
                const brand = row.original
                return (
                    <div className="flex items-center gap-3">
                        {brand.logo ? (
                            <Image
                                width={100}
                                height={100}
                                src={brand.logo}
                                alt={brand.name}
                                className="h-10 w-10 rounded object-cover"
                            />
                        ) : (
                            <div className="h-10 w-10 rounded bg-muted" />
                        )}
                        <div className="flex-col">
                            <span className="font-medium mr-2">{brand.name}</span>
                            <span className="text-xs text-muted-foreground">
                                {brand.slug}
                            </span>
                        </div>
                    </div>
                )
            },
        },
        {
            accessorKey: "website",
            header: "Website",
            cell: ({ row }) => {
                const website = row.getValue("website") as string | null
                return website ? (
                    <a
                        href={website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                        {new URL(website).hostname}
                        <ExternalLink className="h-3 w-3" />
                    </a>
                ) : (
                    <span className="text-sm text-muted-foreground">Không có</span>
                )
            },
        },
        {
            accessorKey: "featured",
            header: "Nổi bật",
            cell: ({ row }) => {
                return row.getValue("featured") ? (
                    <Badge variant="secondary">Nổi bật</Badge>
                ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                )
            },
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id) ? "true" : "false")
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
                const brand = row.original

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
                            <DropdownMenuItem onClick={() => onEdit(brand)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Chỉnh sửa
                            </DropdownMenuItem>
                            {brand.website && (
                                <DropdownMenuItem asChild>
                                    <a
                                        href={brand.website}
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
                                onClick={() => onDelete(brand)}
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

