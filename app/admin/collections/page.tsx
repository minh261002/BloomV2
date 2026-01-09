"use client"

import * as React from "react"
import { Trash2, Star, StarOff, CheckCircle, XCircle } from "lucide-react"
import { DataTable, useBulkActions, useConfirmDialog } from "@/components/data-table"
import { CollectionDialog } from "@/features/admin/collections/components/collection-dialog"
import { createCollectionColumns } from "@/features/admin/collections/components/collection-columns"
import {
    getCollections,
    createCollection,
    updateCollection,
    deleteCollection,
    deleteCollections,
    updateCollectionsStatus,
    updateCollectionsFeatured,
} from "@/features/admin/collections/actions"
import { CollectionFormData, CollectionWithCategory, CollectionBulkUpdate, ActiveStatus } from "@/features/admin/collections/types"
import { getCategories } from "@/features/admin/categories/actions"
import { CategoryWithChildren } from "@/features/admin/categories/types"
import { toast } from "sonner"
import PageHeading from "@/components/page-heading"

export default function CollectionsPage() {
    const [collections, setCollections] = React.useState<CollectionWithCategory[]>([])
    const [categories, setCategories] = React.useState<CategoryWithChildren[]>([])
    const [loading, setLoading] = React.useState(true)
    const [dialogOpen, setDialogOpen] = React.useState(false)
    const [selectedCollection, setSelectedCollection] = React.useState<CollectionWithCategory | null>(null)
    const [isSubmitting, setIsSubmitting] = React.useState(false)

    const { confirm, ConfirmDialog } = useConfirmDialog()

    const loadCollections = React.useCallback(async () => {
        setLoading(true)
        try {
            const data = await getCollections()
            setCollections(data)
        } catch {
            toast.error("Không thể tải bộ sưu tập")
        } finally {
            setLoading(false)
        }
    }, [])

    const loadCategories = React.useCallback(async () => {
        try {
            const data = await getCategories()
            setCategories(data)
        } catch {
            console.error("Failed to load categories")
        }
    }, [])

    React.useEffect(() => {
        loadCollections()
        loadCategories()
    }, [loadCollections, loadCategories])

    const bulkActions = useBulkActions<CollectionWithCategory, CollectionBulkUpdate>()

    const handleAdd = () => {
        setSelectedCollection(null)
        setDialogOpen(true)
    }

    const handleEdit = (collection: CollectionWithCategory) => {
        setSelectedCollection(collection)
        setDialogOpen(true)
    }

    const handleDelete = (collection: CollectionWithCategory) => {
        confirm({
            title: "Xóa bộ sưu tập",
            description: `Bạn có chắc chắn muốn xóa bộ sưu tập "${collection.name}"? Hành động này không thể hoàn tác.`,
            confirmText: "Xóa",
            variant: "destructive",
            onConfirm: async () => {
                const result = await deleteCollection(collection.id)
                if (result.success) {
                    toast.success("Đã xóa bộ sưu tập thành công")
                    loadCollections()
                } else {
                    toast.error(result.error || "Không thể xóa bộ sưu tập")
                }
            },
        })
    }

    const handleSubmit = async (data: CollectionFormData) => {
        setIsSubmitting(true)
        try {
            const result = selectedCollection
                ? await updateCollection(selectedCollection.id, data)
                : await createCollection(data)

            if (result.success) {
                toast.success(
                    selectedCollection
                        ? "Đã cập nhật bộ sưu tập thành công"
                        : "Đã tạo bộ sưu tập thành công"
                )
                setDialogOpen(false)
                loadCollections()
            } else {
                toast.error(result.error || "Có lỗi xảy ra")
            }
        } catch {
            toast.error("Có lỗi xảy ra khi lưu bộ sưu tập")
        } finally {
            setIsSubmitting(false)
        }
    }

    const columns = React.useMemo(
        () => createCollectionColumns(handleEdit, handleDelete),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    )

    return (
        <div className="container mx-auto space-y-6">
            <PageHeading
                title="Quản lý bộ sưu tập"
                description="Quản lý bộ sưu tập sản phẩm trong hệ thống"
                loadAction={loadCollections}
                addAction={handleAdd}
                addActionLabel="Thêm bộ sưu tập"
            />

            <div className="w-full bg-card px-8 py-4 border rounded-md">
                <DataTable
                    columns={columns}
                    data={collections}
                    loading={loading}
                    searchKey="name"
                    searchPlaceholder="Tìm kiếm bộ sưu tập..."
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
                            onClick: async (items: CollectionWithCategory[]) => {
                                const result = await deleteCollections(items.map((i) => i.id))
                                if (result.success) {
                                    toast.success(`Đã xóa ${items.length} bộ sưu tập`)
                                    loadCollections()
                                } else {
                                    toast.error(result.error || "Không thể xóa bộ sưu tập")
                                }
                            },
                            confirmBefore: {
                                title: "Xóa bộ sưu tập",
                                description: (count: number) =>
                                    `Bạn có chắc chắn muốn xóa ${count} bộ sưu tập? Hành động này không thể hoàn tác.`,
                                confirmText: "Xóa",
                            },
                        }),
                        bulkActions.createBulkAction({
                            label: "Đặt nổi bật",
                            icon: Star,
                            variant: "default",
                            onClick: async (items: CollectionWithCategory[]) => {
                                const result = await updateCollectionsFeatured(
                                    items.map((i) => i.id),
                                    true
                                )
                                if (result.success) {
                                    toast.success(`Đã đặt ${items.length} bộ sưu tập nổi bật`)
                                    loadCollections()
                                } else {
                                    toast.error(result.error || "Không thể cập nhật bộ sưu tập")
                                }
                            },
                        }),
                        bulkActions.createBulkAction({
                            label: "Bỏ nổi bật",
                            icon: StarOff,
                            variant: "outline",
                            onClick: async (items: CollectionWithCategory[]) => {
                                const result = await updateCollectionsFeatured(
                                    items.map((i) => i.id),
                                    false
                                )
                                if (result.success) {
                                    toast.success(`Đã bỏ nổi bật ${items.length} bộ sưu tập`)
                                    loadCollections()
                                } else {
                                    toast.error(result.error || "Không thể cập nhật bộ sưu tập")
                                }
                            },
                        }),
                        bulkActions.createBulkAction({
                            label: "Kích hoạt",
                            icon: CheckCircle,
                            variant: "default",
                            onClick: async (items: CollectionWithCategory[]) => {
                                const result = await updateCollectionsStatus(
                                    items.map((i) => i.id),
                                    ActiveStatus.ACTIVE
                                )
                                if (result.success) {
                                    toast.success(`Đã kích hoạt ${items.length} bộ sưu tập`)
                                    loadCollections()
                                } else {
                                    toast.error(result.error || "Không thể cập nhật trạng thái")
                                }
                            },
                        }),
                        bulkActions.createBulkAction({
                            label: "Vô hiệu hóa",
                            icon: XCircle,
                            variant: "outline",
                            onClick: async (items: CollectionWithCategory[]) => {
                                const result = await updateCollectionsStatus(
                                    items.map((i) => i.id),
                                    ActiveStatus.INACTIVE
                                )
                                if (result.success) {
                                    toast.success(`Đã vô hiệu hóa ${items.length} bộ sưu tập`)
                                    loadCollections()
                                } else {
                                    toast.error(result.error || "Không thể cập nhật trạng thái")
                                }
                            },
                        }),
                    ]}
                />
            </div>

            <CollectionDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                collection={selectedCollection}
                categories={categories}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
            />
            <ConfirmDialog />
            <bulkActions.ConfirmDialog />
        </div>
    )
}

