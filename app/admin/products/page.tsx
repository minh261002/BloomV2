"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import {
    DataTable,
    DataTableColumnHeader,
    useConfirmDialog,
    useBulkActions,
} from "@/components/data-table"
import { toast } from "sonner"
import { Archive, CheckCircle, XCircle } from "lucide-react"

// Định nghĩa kiểu dữ liệu Product
export type Product = {
    id: string
    name: string
    category: string
    price: number
    stock: number
    status: "in_stock" | "low_stock" | "out_of_stock"
}

// Dữ liệu mẫu đơn giản
const generateMockData = (): Product[] => {
    const categories = ["Điện thoại", "Laptop", "Tablet", "Phụ kiện", "Đồng hồ"]
    const products = [
        "iPhone 15 Pro",
        "Samsung Galaxy S24",
        "MacBook Pro M3",
        "iPad Air",
        "AirPods Pro",
        "Apple Watch",
        "Dell XPS 15",
        "Surface Pro 9",
        "Galaxy Tab S9",
        "Sony WH-1000XM5",
    ]

    return Array.from({ length: 30 }, (_, i) => {
        const stock = Math.floor(Math.random() * 100)
        return {
            id: `product-${i + 1}`,
            name: products[i % products.length] + ` ${Math.floor(i / products.length) + 1}`,
            category: categories[Math.floor(Math.random() * categories.length)],
            price: Math.floor(Math.random() * 50000000) + 5000000,
            stock,
            status:
                stock === 0
                    ? "out_of_stock"
                    : stock < 10
                        ? "low_stock"
                        : "in_stock",
        }
    })
}

export default function ProductsPage() {
    const [data, setData] = React.useState<Product[]>([])
    const [loading, setLoading] = React.useState(true)
    const { confirm, ConfirmDialog } = useConfirmDialog()

    const bulkActions = useBulkActions<Product>({
        onDelete: async (products) => {
            await new Promise((resolve) => setTimeout(resolve, 1000))
            const productIds = products.map((p) => p.id)
            setData((prev) => prev.filter((item) => !productIds.includes(item.id)))
            toast.success(`Đã xóa ${products.length} sản phẩm`)
        },
        onUpdate: async (products, updates) => {
            await new Promise((resolve) => setTimeout(resolve, 800))
            const productIds = products.map((p) => p.id)
            setData((prev) =>
                prev.map((item) =>
                    productIds.includes(item.id) ? { ...item, ...updates } : item
                )
            )
            toast.success(`Đã cập nhật ${products.length} sản phẩm`)
        },
    })

    // Simulate loading data from server
    React.useEffect(() => {
        const loadData = async () => {
            setLoading(true)
            // Simulate API delay
            await new Promise((resolve) => setTimeout(resolve, 1500))
            setData(generateMockData())
            setLoading(false)
        }

        loadData()
    }, [])

    const handleDelete = async (product: Product) => {
        confirm({
            title: "Xóa sản phẩm",
            description: `Bạn có chắc chắn muốn xóa sản phẩm "${product.name}"?`,
            confirmText: "Xóa",
            cancelText: "Hủy",
            variant: "destructive",
            onConfirm: async () => {
                await new Promise((resolve) => setTimeout(resolve, 1000))
                setData((prev) => prev.filter((item) => item.id !== product.id))
                toast.success("Đã xóa sản phẩm thành công")
            },
        })
    }

    const handleRefresh = async () => {
        setLoading(true)
        await new Promise((resolve) => setTimeout(resolve, 1500))
        setData(generateMockData())
        setLoading(false)
        toast.success("Đã làm mới dữ liệu")
    }

    const columns: ColumnDef<Product>[] = [
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
                <DataTableColumnHeader column={column} title="Tên sản phẩm" />
            ),
            cell: ({ row }) => {
                return <div className="font-medium">{row.getValue("name")}</div>
            },
        },
        {
            accessorKey: "category",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Danh mục" />
            ),
            cell: ({ row }) => {
                return <Badge variant="outline">{row.getValue("category")}</Badge>
            },
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id))
            },
        },
        {
            accessorKey: "price",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Giá" />
            ),
            cell: ({ row }) => {
                const price = row.getValue("price") as number
                return (
                    <div className="font-medium">
                        {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                        }).format(price)}
                    </div>
                )
            },
        },
        {
            accessorKey: "stock",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Tồn kho" />
            ),
            cell: ({ row }) => {
                return <div>{row.getValue("stock")}</div>
            },
        },
        {
            accessorKey: "status",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Trạng thái" />
            ),
            cell: ({ row }) => {
                const status = row.getValue("status") as string
                const statusConfig = {
                    in_stock: { label: "Còn hàng", variant: "default" as const },
                    low_stock: { label: "Sắp hết", variant: "outline" as const },
                    out_of_stock: { label: "Hết hàng", variant: "destructive" as const },
                }
                const config = statusConfig[status as keyof typeof statusConfig]
                return <Badge variant={config.variant}>{config.label}</Badge>
            },
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id))
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
                            <DropdownMenuItem
                                onClick={() => toast.info(`Chỉnh sửa: ${product.name}`)}
                            >
                                <Pencil className="mr-2 h-4 w-4" />
                                Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => handleDelete(product)}
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

    return (
        <div className="container mx-auto py-10">
            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Quản lý sản phẩm</h1>
                <p className="text-muted-foreground">
                    Danh sách và quản lý sản phẩm trong hệ thống
                </p>
            </div>

            <DataTable
                columns={columns}
                data={data}
                loading={loading}
                searchKey="name"
                searchPlaceholder="Tìm kiếm sản phẩm..."
                filterableColumns={[
                    {
                        id: "category",
                        title: "Danh mục",
                        options: [
                            { label: "Điện thoại", value: "Điện thoại" },
                            { label: "Laptop", value: "Laptop" },
                            { label: "Tablet", value: "Tablet" },
                            { label: "Phụ kiện", value: "Phụ kiện" },
                            { label: "Đồng hồ", value: "Đồng hồ" },
                        ],
                    },
                    {
                        id: "status",
                        title: "Trạng thái",
                        options: [
                            { label: "Còn hàng", value: "in_stock" },
                            { label: "Sắp hết", value: "low_stock" },
                            { label: "Hết hàng", value: "out_of_stock" },
                        ],
                    },
                ]}
                bulkActions={[
                    bulkActions.createBulkAction({
                        label: "Đặt còn hàng",
                        icon: CheckCircle,
                        variant: "default",
                        onClick: (products) =>
                            bulkActions.handleBulkUpdate(products, {
                                status: "in_stock",
                                stock: 50,
                            }),
                    }),
                    bulkActions.createBulkAction({
                        label: "Đặt hết hàng",
                        icon: XCircle,
                        variant: "outline",
                        onClick: (products) =>
                            bulkActions.handleBulkUpdate(products, {
                                status: "out_of_stock",
                                stock: 0,
                            }),
                    }),
                    bulkActions.createBulkAction({
                        label: "Lưu trữ",
                        icon: Archive,
                        variant: "secondary",
                        onClick: (products) => {
                            toast.info(`Lưu trữ ${products.length} sản phẩm`)
                        },
                    }),
                    bulkActions.createBulkAction({
                        label: "Xóa",
                        icon: Trash2,
                        variant: "destructive",
                        onClick: bulkActions.handleBulkDelete,
                        confirmBefore: {
                            title: "Xóa sản phẩm đã chọn",
                            description: (count) => `Bạn có chắc chắn muốn xóa ${count} sản phẩm?`,
                            confirmText: "Xóa",
                        },
                    }),
                ]}
                toolbarActions={
                    <>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRefresh}
                            disabled={loading}
                        >
                            Làm mới
                        </Button>
                        <Button
                            variant="default"
                            size="sm"
                            onClick={() => toast.info("Thêm sản phẩm mới")}
                            disabled={loading}
                        >
                            Thêm sản phẩm
                        </Button>
                    </>
                }
            />

            <ConfirmDialog />
            <bulkActions.ConfirmDialog />
        </div>
    )
}

