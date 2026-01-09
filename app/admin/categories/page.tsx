/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-require-imports */
"use client"

import * as React from "react"
import { List, Table2, Plus, RefreshCw, Trash2, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataTable, useBulkActions, useConfirmDialog } from "@/components/data-table"
import { CategoryTreeView } from "@/features/admin/categories/components/category-tree-view"
import { CategoryDialog } from "@/features/admin/categories/components/category-dialog"
import { createCategoryColumns } from "@/features/admin/categories/components/category-columns"
import {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    deleteCategories,
    updateCategoriesStatus,
} from "@/features/admin/categories/actions"
import { CategoryWithChildren, CategoryFormData, ActiveStatus, CategoryBulkUpdate } from "@/features/admin/categories/types"
import { toast } from "sonner"
import PageHeading from "@/components/page-heading"

export default function CategoriesPage() {
    const [categories, setCategories] = React.useState<CategoryWithChildren[]>([])
    const [loading, setLoading] = React.useState(true)
    const [dialogOpen, setDialogOpen] = React.useState(false)
    const [selectedCategory, setSelectedCategory] = React.useState<CategoryWithChildren | null>(null)
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [viewMode, setViewMode] = React.useState<"tree" | "table">("tree")

    const { confirm, ConfirmDialog } = useConfirmDialog()

    const loadCategories = React.useCallback(async () => {
        setLoading(true)
        try {
            const data = await getCategories()
            setCategories(data)
        } catch (error) {
            toast.error("Không thể tải danh mục")
        } finally {
            setLoading(false)
        }
    }, [])

    React.useEffect(() => {
        loadCategories()
    }, [loadCategories])

    const flattenCategories = (cats: CategoryWithChildren[]): CategoryWithChildren[] => {
        return cats.reduce((acc: CategoryWithChildren[], cat) => {
            acc.push(cat)
            if (cat.children && cat.children.length > 0) {
                acc.push(...flattenCategories(cat.children))
            }
            return acc
        }, [])
    }

    const flatCategories = React.useMemo(() => flattenCategories(categories), [categories])

    const bulkActions = useBulkActions<CategoryWithChildren, CategoryBulkUpdate>({
        onDelete: async (items: CategoryWithChildren[]) => {
            const result = await deleteCategories(items.map((i) => i.id))
            if (result.success) {
                toast.success(`Đã xóa ${items.length} danh mục`)
                loadCategories()
            } else {
                toast.error(result.error || "Không thể xóa danh mục")
            }
        },
        onUpdate: async (items: CategoryWithChildren[], updates: CategoryBulkUpdate) => {
            if (updates.status) {
                const result = await updateCategoriesStatus(
                    items.map((i) => i.id),
                    updates.status
                )
                if (result.success) {
                    toast.success(`Đã cập nhật ${items.length} danh mục`)
                    loadCategories()
                } else {
                    toast.error(result.error || "Không thể cập nhật danh mục")
                }
            }
        },
    })

    const handleAdd = () => {
        setSelectedCategory(null)
        setDialogOpen(true)
    }

    const handleEdit = (category: CategoryWithChildren) => {
        setSelectedCategory(category)
        setDialogOpen(true)
    }

    const handleDelete = (category: CategoryWithChildren) => {
        confirm({
            title: "Xóa danh mục",
            description: `Bạn có chắc chắn muốn xóa danh mục "${category.name}"? ${category._count?.children
                ? "Danh mục này có danh mục con. Vui lòng xóa danh mục con trước."
                : ""
                }`,
            confirmText: "Xóa",
            variant: "destructive",
            onConfirm: async () => {
                const result = await deleteCategory(category.id)
                if (result.success) {
                    toast.success("Đã xóa danh mục thành công")
                    loadCategories()
                } else {
                    toast.error(result.error || "Không thể xóa danh mục")
                }
            },
        })
    }

    const handleSubmit = async (data: CategoryFormData) => {
        setIsSubmitting(true)
        try {
            const result = selectedCategory
                ? await updateCategory(selectedCategory.id, data)
                : await createCategory(data)

            if (result.success) {
                toast.success(
                    selectedCategory
                        ? "Đã cập nhật danh mục thành công"
                        : "Đã tạo danh mục thành công"
                )
                setDialogOpen(false)
                loadCategories()
            } else {
                toast.error(result.error || "Có lỗi xảy ra")
            }
        } catch (error) {
            toast.error("Có lỗi xảy ra khi lưu danh mục")
        } finally {
            setIsSubmitting(false)
        }
    }

    const columns = React.useMemo(
        () => createCategoryColumns(handleEdit, handleDelete),
        []
    )

    return (
        <div className="container mx-auto space-y-6">
            <PageHeading
                title="Quản lý danh mục"
                description="Quản lý danh mục sản phẩm với cấu trúc cây"
                loadAction={loadCategories}
                addAction={handleAdd}
                addActionLabel="Thêm danh mục"
            />
            <div className="w-full bg-card px-8 py-4 border rounded-md">
                <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "tree" | "table")}>
                    <div className="flex items-center justify-between">
                        <TabsList>
                            <TabsTrigger value="tree">
                                <List className="mr-2 h-4 w-4" />
                                Cây danh mục
                            </TabsTrigger>
                            <TabsTrigger value="table">
                                <Table2 className="mr-2 h-4 w-4" />
                                Bảng
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="tree" className="mt-4">
                        <div className="rounded-lg border bg-background">
                            {loading ? (
                                <div className="flex h-64 items-center justify-center">
                                    <div className="text-sm text-muted-foreground">
                                        Đang tải...
                                    </div>
                                </div>
                            ) : (
                                <CategoryTreeView
                                    categories={categories}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    onRefresh={loadCategories}
                                />
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="table" className="mt-4">
                        <DataTable
                            columns={columns}
                            data={flatCategories}
                            loading={loading}
                            searchKey="name"
                            searchPlaceholder="Tìm kiếm danh mục..."
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
                                    onClick: async (items: CategoryWithChildren[]) => {
                                        const result = await deleteCategories(items.map((i) => i.id))
                                        if (result.success) {
                                            toast.success(`Đã xóa ${items.length} danh mục`)
                                            loadCategories()
                                        } else {
                                            toast.error(result.error || "Không thể xóa danh mục")
                                        }
                                    },
                                    confirmBefore: {
                                        title: "Xóa danh mục",
                                        description: (count: number) =>
                                            `Bạn có chắc chắn muốn xóa ${count} danh mục? Hành động này không thể hoàn tác.`,
                                        confirmText: "Xóa",
                                    },
                                }),
                                bulkActions.createBulkAction({
                                    label: "Kích hoạt",
                                    icon: CheckCircle,
                                    onClick: async (items: CategoryWithChildren[]) => {
                                        const result = await updateCategoriesStatus(
                                            items.map((i) => i.id),
                                            ActiveStatus.ACTIVE
                                        )
                                        if (result.success) {
                                            toast.success(`Đã kích hoạt ${items.length} danh mục`)
                                            loadCategories()
                                        } else {
                                            toast.error(result.error || "Không thể cập nhật danh mục")
                                        }
                                    },
                                }),
                                bulkActions.createBulkAction({
                                    label: "Vô hiệu hóa",
                                    icon: XCircle,
                                    variant: "outline",
                                    onClick: async (items: CategoryWithChildren[]) => {
                                        const result = await updateCategoriesStatus(
                                            items.map((i) => i.id),
                                            ActiveStatus.INACTIVE
                                        )
                                        if (result.success) {
                                            toast.success(`Đã vô hiệu hóa ${items.length} danh mục`)
                                            loadCategories()
                                        } else {
                                            toast.error(result.error || "Không thể cập nhật danh mục")
                                        }
                                    },
                                }),
                            ]}
                        />
                    </TabsContent>
                </Tabs>
            </div>

            <CategoryDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                category={selectedCategory}
                categories={categories}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
            />

            <ConfirmDialog />
            <bulkActions.ConfirmDialog />
        </div>
    )
}

