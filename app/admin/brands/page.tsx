"use client"

import * as React from "react"
import { Trash2, Star, StarOff, CheckCircle, XCircle } from "lucide-react"
import { DataTable, useBulkActions, useConfirmDialog } from "@/components/data-table"
import { BrandDialog } from "@/features/admin/brands/components/brand-dialog"
import { createBrandColumns } from "@/features/admin/brands/components/brand-columns"
import {
    getBrands,
    createBrand,
    updateBrand,
    deleteBrand,
    deleteBrands,
    updateBrandsFeatured,
    updateBrandsStatus,
} from "@/features/admin/brands/actions"
import { BrandFormData, BrandBulkUpdate, ActiveStatus } from "@/features/admin/brands/types"
import { Brand } from "@prisma/client"
import { toast } from "sonner"
import PageHeading from "@/components/page-heading"

export default function BrandsPage() {
    const [brands, setBrands] = React.useState<Brand[]>([])
    const [loading, setLoading] = React.useState(true)
    const [dialogOpen, setDialogOpen] = React.useState(false)
    const [selectedBrand, setSelectedBrand] = React.useState<Brand | null>(null)
    const [isSubmitting, setIsSubmitting] = React.useState(false)

    const { confirm, ConfirmDialog } = useConfirmDialog()

    const loadBrands = React.useCallback(async () => {
        setLoading(true)
        try {
            const data = await getBrands()
            setBrands(data)
        } catch {
            toast.error("Không thể tải thương hiệu")
        } finally {
            setLoading(false)
        }
    }, [])

    React.useEffect(() => {
        loadBrands()
    }, [loadBrands])

    const bulkActions = useBulkActions<Brand, BrandBulkUpdate>()

    const handleAdd = () => {
        setSelectedBrand(null)
        setDialogOpen(true)
    }

    const handleEdit = (brand: Brand) => {
        setSelectedBrand(brand)
        setDialogOpen(true)
    }

    const handleDelete = (brand: Brand) => {
        confirm({
            title: "Xóa thương hiệu",
            description: `Bạn có chắc chắn muốn xóa thương hiệu "${brand.name}"? Hành động này không thể hoàn tác.`,
            confirmText: "Xóa",
            variant: "destructive",
            onConfirm: async () => {
                const result = await deleteBrand(brand.id)
                if (result.success) {
                    toast.success("Đã xóa thương hiệu thành công")
                    loadBrands()
                } else {
                    toast.error(result.error || "Không thể xóa thương hiệu")
                }
            },
        })
    }

    const handleSubmit = async (data: BrandFormData) => {
        setIsSubmitting(true)
        try {
            const result = selectedBrand
                ? await updateBrand(selectedBrand.id, data)
                : await createBrand(data)

            if (result.success) {
                toast.success(
                    selectedBrand
                        ? "Đã cập nhật thương hiệu thành công"
                        : "Đã tạo thương hiệu thành công"
                )
                setDialogOpen(false)
                loadBrands()
            } else {
                toast.error(result.error || "Có lỗi xảy ra")
            }
        } catch {
            toast.error("Có lỗi xảy ra khi lưu thương hiệu")
        } finally {
            setIsSubmitting(false)
        }
    }

    const columns = React.useMemo(
        () => createBrandColumns(handleEdit, handleDelete),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    )

    return (
        <div className="container mx-auto space-y-6">
            <PageHeading
                title="Quản lý thương hiệu"
                description="Quản lý thương hiệu sản phẩm trong hệ thống"
                loadAction={loadBrands}
                addAction={handleAdd}
                addActionLabel="Thêm thương hiệu"
            />

            <div className="w-full bg-card px-8 py-4 border rounded-md">
                <DataTable
                    columns={columns}
                    data={brands}
                    loading={loading}
                    searchKey="name"
                    searchPlaceholder="Tìm kiếm thương hiệu..."
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
                            onClick: async (items: Brand[]) => {
                                const result = await deleteBrands(items.map((i) => i.id))
                                if (result.success) {
                                    toast.success(`Đã xóa ${items.length} thương hiệu`)
                                    loadBrands()
                                } else {
                                    toast.error(result.error || "Không thể xóa thương hiệu")
                                }
                            },
                            confirmBefore: {
                                title: "Xóa thương hiệu",
                                description: (count: number) =>
                                    `Bạn có chắc chắn muốn xóa ${count} thương hiệu? Hành động này không thể hoàn tác.`,
                                confirmText: "Xóa",
                            },
                        }),
                        bulkActions.createBulkAction({
                            label: "Đặt nổi bật",
                            icon: Star,
                            variant: "default",
                            onClick: async (items: Brand[]) => {
                                const result = await updateBrandsFeatured(
                                    items.map((i) => i.id),
                                    true
                                )
                                if (result.success) {
                                    toast.success(`Đã đặt ${items.length} thương hiệu nổi bật`)
                                    loadBrands()
                                } else {
                                    toast.error(result.error || "Không thể cập nhật thương hiệu")
                                }
                            },
                        }),
                        bulkActions.createBulkAction({
                            label: "Bỏ nổi bật",
                            icon: StarOff,
                            variant: "outline",
                            onClick: async (items: Brand[]) => {
                                const result = await updateBrandsFeatured(
                                    items.map((i) => i.id),
                                    false
                                )
                                if (result.success) {
                                    toast.success(`Đã bỏ nổi bật ${items.length} thương hiệu`)
                                    loadBrands()
                                } else {
                                    toast.error(result.error || "Không thể cập nhật thương hiệu")
                                }
                            },
                        }),
                        bulkActions.createBulkAction({
                            label: "Kích hoạt",
                            icon: CheckCircle,
                            variant: "default",
                            onClick: async (items: Brand[]) => {
                                const result = await updateBrandsStatus(
                                    items.map((i) => i.id),
                                    ActiveStatus.ACTIVE
                                )
                                if (result.success) {
                                    toast.success(`Đã kích hoạt ${items.length} thương hiệu`)
                                    loadBrands()
                                } else {
                                    toast.error(result.error || "Không thể cập nhật trạng thái")
                                }
                            },
                        }),
                        bulkActions.createBulkAction({
                            label: "Vô hiệu hóa",
                            icon: XCircle,
                            variant: "outline",
                            onClick: async (items: Brand[]) => {
                                const result = await updateBrandsStatus(
                                    items.map((i) => i.id),
                                    ActiveStatus.INACTIVE
                                )
                                if (result.success) {
                                    toast.success(`Đã vô hiệu hóa ${items.length} thương hiệu`)
                                    loadBrands()
                                } else {
                                    toast.error(result.error || "Không thể cập nhật trạng thái")
                                }
                            },
                        }),
                    ]}
                />
            </div>

            <BrandDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                brand={selectedBrand}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
            />
            <ConfirmDialog />
            <bulkActions.ConfirmDialog />
        </div>
    )
}

