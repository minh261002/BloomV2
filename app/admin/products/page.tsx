"use client"

import * as React from "react"
import { Trash2, Star, StarOff, CheckCircle, XCircle } from "lucide-react"
import { DataTable, useBulkActions, useConfirmDialog } from "@/components/data-table"
import { ProductDialog } from "@/features/admin/products/components/product-dialog"
import { createProductColumns } from "@/features/admin/products/components/product-columns"
import {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    deleteProducts,
    updateProductsStatus,
    updateProductsFeatured,
} from "@/features/admin/products/actions"
import { ProductFormData, ProductWithRelations, ProductBulkUpdate, ActiveStatus } from "@/features/admin/products/types"
import { getCategories } from "@/features/admin/categories/actions"
import { getBrands } from "@/features/admin/brands/actions"
import { getCollections } from "@/features/admin/collections/actions"
import { CategoryWithChildren } from "@/features/admin/categories/types"
import { Brand } from "@prisma/client"
import { toast } from "sonner"
import PageHeading from "@/components/page-heading"

export default function ProductsPage() {
    const [products, setProducts] = React.useState<ProductWithRelations[]>([])
    const [categories, setCategories] = React.useState<CategoryWithChildren[]>([])
    const [brands, setBrands] = React.useState<Brand[]>([])
    const [collections, setCollections] = React.useState<{ id: string; name: string }[]>([])
    const [loading, setLoading] = React.useState(true)
    const [dialogOpen, setDialogOpen] = React.useState(false)
    const [selectedProduct, setSelectedProduct] = React.useState<ProductWithRelations | null>(null)
    const [isSubmitting, setIsSubmitting] = React.useState(false)

    const { confirm, ConfirmDialog } = useConfirmDialog()

    const loadProducts = React.useCallback(async () => {
        setLoading(true)
        try {
            const data = await getProducts()
            setProducts(data)
        } catch {
            toast.error("Không thể tải sản phẩm")
        } finally {
            setLoading(false)
        }
    }, [])

    const loadRelatedData = React.useCallback(async () => {
        try {
            const [categoriesData, brandsData, collectionsData] = await Promise.all([
                getCategories(),
                getBrands(),
                getCollections(),
            ])
            setCategories(categoriesData)
            setBrands(brandsData)
            setCollections(collectionsData.map((c) => ({ id: c.id, name: c.name })))
        } catch {
            console.error("Failed to load related data")
        }
    }, [])

    React.useEffect(() => {
        loadProducts()
        loadRelatedData()
    }, [loadProducts, loadRelatedData])

    const bulkActions = useBulkActions<ProductWithRelations, ProductBulkUpdate>()

    const handleAdd = () => {
        setSelectedProduct(null)
        setDialogOpen(true)
    }

    const handleEdit = (product: ProductWithRelations) => {
        setSelectedProduct(product)
        setDialogOpen(true)
    }

    const handleDelete = (product: ProductWithRelations) => {
        confirm({
            title: "Xóa sản phẩm",
            description: `Bạn có chắc chắn muốn xóa sản phẩm "${product.name}"? Hành động này không thể hoàn tác.`,
            confirmText: "Xóa",
            variant: "destructive",
            onConfirm: async () => {
                const result = await deleteProduct(product.id)
                if (result.success) {
                    toast.success("Đã xóa sản phẩm thành công")
                    loadProducts()
                } else {
                    toast.error(result.error || "Không thể xóa sản phẩm")
                }
            },
        })
    }

    const handleSubmit = async (data: ProductFormData) => {
        setIsSubmitting(true)
        try {
            const result = selectedProduct
                ? await updateProduct(selectedProduct.id, data)
                : await createProduct(data)

            if (result.success) {
                toast.success(
                    selectedProduct
                        ? "Đã cập nhật sản phẩm thành công"
                        : "Đã tạo sản phẩm thành công"
                )
                setDialogOpen(false)
                loadProducts()
            } else {
                toast.error(result.error || "Có lỗi xảy ra")
            }
        } catch {
            toast.error("Có lỗi xảy ra khi lưu sản phẩm")
        } finally {
            setIsSubmitting(false)
        }
    }

    const columns = React.useMemo(
        () => createProductColumns(handleEdit, handleDelete),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    )

    return (
        <div className="container mx-auto space-y-6">
            <PageHeading
                title="Sản phẩm"
                description="Quản lý sản phẩm đơn giản và sản phẩm có biến thể"
                loadAction={loadProducts}
                addAction={handleAdd}
                addActionLabel="Thêm sản phẩm"
            />

            {/* DataTable */}
            <div className="w-full bg-card px-8 py-4 border rounded-md">
                <DataTable
                    columns={columns}
                    data={products}
                    loading={loading}
                    searchKey="name"
                    searchPlaceholder="Tìm kiếm sản phẩm..."
                    filterableColumns={[
                        {
                            id: "status",
                            title: "Trạng thái",
                            options: [
                                { label: "Hoạt động", value: "ACTIVE" },
                                { label: "Không hoạt động", value: "INACTIVE" },
                            ],
                        },
                        {
                            id: "featured",
                            title: "Nổi bật",
                            options: [
                                { label: "Có", value: "true" },
                                { label: "Không", value: "false" },
                            ],
                        },
                    ]}
                    bulkActions={[
                        bulkActions.createBulkAction({
                            label: "Xóa",
                            icon: Trash2,
                            variant: "destructive",
                            onClick: async (items: ProductWithRelations[]) => {
                                const result = await deleteProducts(items.map((i) => i.id))
                                if (result.success) {
                                    toast.success(`Đã xóa ${items.length} sản phẩm`)
                                    loadProducts()
                                } else {
                                    toast.error(result.error || "Không thể xóa sản phẩm")
                                }
                            },
                            confirmBefore: {
                                title: "Xóa sản phẩm",
                                description: (count: number) =>
                                    `Bạn có chắc chắn muốn xóa ${count} sản phẩm? Hành động này không thể hoàn tác.`,
                                confirmText: "Xóa",
                            },
                        }),
                        bulkActions.createBulkAction({
                            label: "Đặt nổi bật",
                            icon: Star,
                            variant: "default",
                            onClick: async (items: ProductWithRelations[]) => {
                                const result = await updateProductsFeatured(
                                    items.map((i) => i.id),
                                    true
                                )
                                if (result.success) {
                                    toast.success(`Đã đặt ${items.length} sản phẩm nổi bật`)
                                    loadProducts()
                                } else {
                                    toast.error(result.error || "Không thể cập nhật sản phẩm")
                                }
                            },
                        }),
                        bulkActions.createBulkAction({
                            label: "Bỏ nổi bật",
                            icon: StarOff,
                            variant: "outline",
                            onClick: async (items: ProductWithRelations[]) => {
                                const result = await updateProductsFeatured(
                                    items.map((i) => i.id),
                                    false
                                )
                                if (result.success) {
                                    toast.success(`Đã bỏ nổi bật ${items.length} sản phẩm`)
                                    loadProducts()
                                } else {
                                    toast.error(result.error || "Không thể cập nhật sản phẩm")
                                }
                            },
                        }),
                        bulkActions.createBulkAction({
                            label: "Kích hoạt",
                            icon: CheckCircle,
                            variant: "default",
                            onClick: async (items: ProductWithRelations[]) => {
                                const result = await updateProductsStatus(
                                    items.map((i) => i.id),
                                    ActiveStatus.ACTIVE
                                )
                                if (result.success) {
                                    toast.success(`Đã kích hoạt ${items.length} sản phẩm`)
                                    loadProducts()
                                } else {
                                    toast.error(result.error || "Không thể cập nhật trạng thái")
                                }
                            },
                        }),
                        bulkActions.createBulkAction({
                            label: "Vô hiệu hóa",
                            icon: XCircle,
                            variant: "outline",
                            onClick: async (items: ProductWithRelations[]) => {
                                const result = await updateProductsStatus(
                                    items.map((i) => i.id),
                                    ActiveStatus.INACTIVE
                                )
                                if (result.success) {
                                    toast.success(`Đã vô hiệu hóa ${items.length} sản phẩm`)
                                    loadProducts()
                                } else {
                                    toast.error(result.error || "Không thể cập nhật trạng thái")
                                }
                            },
                        }),
                    ]}
                />
            </div>

            <ProductDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                product={selectedProduct}
                categories={categories}
                brands={brands}
                collections={collections}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
            />
            <ConfirmDialog />
            <bulkActions.ConfirmDialog />
        </div>
    )
}

