"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Pencil, Trash2, Package } from "lucide-react"
import { ProductWithRelations, ActiveStatus } from "../types"
import { ProductType } from "@prisma/client"
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

const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(price)
}

export const createProductColumns = (
    onEdit: (product: ProductWithRelations) => void,
    onDelete: (product: ProductWithRelations) => void
): ColumnDef<ProductWithRelations>[] => [
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
                <DataTableColumnHeader column={column} title="Sản phẩm" />
            ),
            cell: ({ row }) => {
                const product = row.original
                const firstImage = product.images[0]?.url
                return (
                    <div className="flex items-center gap-3">
                        {firstImage ? (
                            <Image
                                width={100}
                                height={100}
                                src={firstImage}
                                alt={product.name}
                                className="h-12 w-12 rounded object-cover"
                            />
                        ) : (
                            <div className="h-12 w-12 rounded bg-muted flex items-center justify-center">
                                <Package className="h-6 w-6 text-muted-foreground" />
                            </div>
                        )}
                        <div className="flex flex-col">
                            <span className="font-medium">{product.name}</span>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">
                                    {product.slug}
                                </span>
                                {product.type === ProductType.VARIABLE && (
                                    <Badge variant="outline" className="text-xs">
                                        {product.variants.length} biến thể
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                )
            },
        },
        {
            accessorKey: "productCategories",
            header: "Danh mục",
            cell: ({ row }) => {
                const categories = row.original.productCategories
                if (categories.length === 0) {
                    return <span className="text-sm text-muted-foreground">Không có</span>
                }
                return (
                    <div className="flex flex-wrap gap-1">
                        {categories.slice(0, 2).map((pc) => (
                            <Badge key={pc.category.id} variant="outline" className="text-xs">
                                {pc.category.name}
                            </Badge>
                        ))}
                        {categories.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                                +{categories.length - 2}
                            </Badge>
                        )}
                    </div>
                )
            },
        },
        {
            accessorKey: "brand",
            header: "Thương hiệu",
            cell: ({ row }) => {
                const brand = row.original.brand
                return brand ? (
                    <span className="text-sm">{brand.name}</span>
                ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                )
            },
        },
        {
            accessorKey: "price",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Giá" />
            ),
            cell: ({ row }) => {
                const product = row.original
                if (product.type === ProductType.VARIABLE) {
                    const prices = product.variants.map((v) => Number(v.price))
                    const minPrice = Math.min(...prices)
                    const maxPrice = Math.max(...prices)
                    return (
                        <div className="font-medium">
                            {minPrice === maxPrice
                                ? formatPrice(minPrice)
                                : `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`}
                        </div>
                    )
                }
                return <div className="font-medium">{formatPrice(Number(product.price))}</div>
            },
        },
        {
            accessorKey: "stock",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Tồn kho" />
            ),
            cell: ({ row }) => {
                const product = row.original
                let totalStock = 0

                if (product.type === ProductType.VARIABLE) {
                    totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0)
                } else {
                    totalStock = product.stock
                }

                const isLowStock = totalStock <= product.lowStock

                return (
                    <div className={isLowStock ? "text-destructive font-medium" : ""}>
                        {totalStock}
                        {isLowStock && " ⚠️"}
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
                    <Badge variant="secondary">Nổi bật</Badge>
                ) : null
            },
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id) ? "true" : "false")
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
                const product = row.original

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
                            <DropdownMenuItem onClick={() => onEdit(product)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => onDelete(product)}
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

