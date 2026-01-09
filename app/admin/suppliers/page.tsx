"use client"

import * as React from "react"
import { Trash2, CheckCircle, XCircle } from "lucide-react"
import { DataTable, useBulkActions, useConfirmDialog } from "@/components/data-table"
import { SupplierDialog } from "@/features/admin/suppliers/components/supplier-dialog"
import { createSupplierColumns } from "@/features/admin/suppliers/components/supplier-columns"
import {
    getSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    deleteSuppliers,
    updateSuppliersStatus,
} from "@/features/admin/suppliers/actions"
import { SupplierFormData, SupplierBulkUpdate, SupplierStatus } from "@/features/admin/suppliers/types"
import { Supplier } from "@prisma/client"
import { toast } from "sonner"
import PageHeading from "@/components/page-heading"

export default function SuppliersPage() {
    const [suppliers, setSuppliers] = React.useState<Supplier[]>([])
    const [loading, setLoading] = React.useState(true)
    const [dialogOpen, setDialogOpen] = React.useState(false)
    const [selectedSupplier, setSelectedSupplier] = React.useState<Supplier | null>(null)
    const [isSubmitting, setIsSubmitting] = React.useState(false)

    const { confirm, ConfirmDialog } = useConfirmDialog()

    const loadSuppliers = React.useCallback(async () => {
        setLoading(true)
        try {
            const data = await getSuppliers()
            setSuppliers(data)
        } catch {
            toast.error("Không thể tải nhà cung cấp")
        } finally {
            setLoading(false)
        }
    }, [])

    React.useEffect(() => {
        loadSuppliers()
    }, [loadSuppliers])

    const bulkActions = useBulkActions<Supplier, SupplierBulkUpdate>()

    const handleAdd = () => {
        setSelectedSupplier(null)
        setDialogOpen(true)
    }

    const handleEdit = (supplier: Supplier) => {
        setSelectedSupplier(supplier)
        setDialogOpen(true)
    }

    const handleDelete = (supplier: Supplier) => {
        confirm({
            title: "Xóa nhà cung cấp",
            description: `Bạn có chắc chắn muốn xóa nhà cung cấp "${supplier.name}"? Hành động này không thể hoàn tác.`,
            confirmText: "Xóa",
            variant: "destructive",
            onConfirm: async () => {
                const result = await deleteSupplier(supplier.id)
                if (result.success) {
                    toast.success("Đã xóa nhà cung cấp thành công")
                    loadSuppliers()
                } else {
                    toast.error(result.error || "Không thể xóa nhà cung cấp")
                }
            },
        })
    }

    const handleSubmit = async (data: SupplierFormData) => {
        setIsSubmitting(true)
        try {
            const result = selectedSupplier
                ? await updateSupplier(selectedSupplier.id, data)
                : await createSupplier(data)

            if (result.success) {
                toast.success(
                    selectedSupplier
                        ? "Đã cập nhật nhà cung cấp thành công"
                        : "Đã tạo nhà cung cấp thành công"
                )
                setDialogOpen(false)
                loadSuppliers()
            } else {
                toast.error(result.error || "Có lỗi xảy ra")
            }
        } catch {
            toast.error("Có lỗi xảy ra khi lưu nhà cung cấp")
        } finally {
            setIsSubmitting(false)
        }
    }

    const columns = React.useMemo(
        () => createSupplierColumns(handleEdit, handleDelete),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    )

    return (
        <div className="container mx-auto space-y-6">
            <PageHeading
                title="Nhà cung cấp"
                description="Quản lý nhà cung cấp và đối tác"
                loadAction={loadSuppliers}
                addAction={handleAdd}
                addActionLabel="Thêm nhà cung cấp"
            />

            <div className="w-full bg-card px-8 py-4 border rounded-md">
                <DataTable
                    columns={columns}
                    data={suppliers}
                    loading={loading}
                    searchKey="name"
                    searchPlaceholder="Tìm kiếm nhà cung cấp..."
                    filterableColumns={[
                        {
                            id: "status",
                            title: "Trạng thái",
                            options: [
                                { label: "Hoạt động", value: "ACTIVE" },
                                { label: "Không hoạt động", value: "INACTIVE" },
                            ],
                        },
                    ]}
                    bulkActions={[
                        bulkActions.createBulkAction({
                            label: "Xóa",
                            icon: Trash2,
                            variant: "destructive",
                            onClick: async (items: Supplier[]) => {
                                const result = await deleteSuppliers(items.map((i) => i.id))
                                if (result.success) {
                                    toast.success(`Đã xóa ${items.length} nhà cung cấp`)
                                    loadSuppliers()
                                } else {
                                    toast.error(result.error || "Không thể xóa nhà cung cấp")
                                }
                            },
                            confirmBefore: {
                                title: "Xóa nhà cung cấp",
                                description: (count: number) =>
                                    `Bạn có chắc chắn muốn xóa ${count} nhà cung cấp? Hành động này không thể hoàn tác.`,
                                confirmText: "Xóa",
                            },
                        }),
                        bulkActions.createBulkAction({
                            label: "Kích hoạt",
                            icon: CheckCircle,
                            variant: "default",
                            onClick: async (items: Supplier[]) => {
                                const result = await updateSuppliersStatus(
                                    items.map((i) => i.id),
                                    SupplierStatus.ACTIVE
                                )
                                if (result.success) {
                                    toast.success(`Đã kích hoạt ${items.length} nhà cung cấp`)
                                    loadSuppliers()
                                } else {
                                    toast.error(result.error || "Không thể cập nhật trạng thái")
                                }
                            },
                        }),
                        bulkActions.createBulkAction({
                            label: "Vô hiệu hóa",
                            icon: XCircle,
                            variant: "outline",
                            onClick: async (items: Supplier[]) => {
                                const result = await updateSuppliersStatus(
                                    items.map((i) => i.id),
                                    SupplierStatus.INACTIVE
                                )
                                if (result.success) {
                                    toast.success(`Đã vô hiệu hóa ${items.length} nhà cung cấp`)
                                    loadSuppliers()
                                } else {
                                    toast.error(result.error || "Không thể cập nhật trạng thái")
                                }
                            },
                        }),
                    ]}
                />
            </div>

            <SupplierDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                supplier={selectedSupplier}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
            />
            <ConfirmDialog />
            <bulkActions.ConfirmDialog />
        </div>
    )
}


