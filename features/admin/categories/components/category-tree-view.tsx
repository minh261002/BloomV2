"use client"

import * as React from "react"
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragStartEvent,
    DragOverlay,
} from "@dnd-kit/core"
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CategoryWithChildren } from "../types"
import { CategoryTreeItem } from "./category-tree-item"
import { updateCategorySortOrders } from "../actions"
import { toast } from "sonner"
import { ScrollArea } from "@/components/ui/scroll-area"

function flattenTree(items: CategoryWithChildren[]): CategoryWithChildren[] {
    return items.reduce((acc: CategoryWithChildren[], item) => {
        acc.push(item)
        if (item.children && item.children.length > 0) {
            acc.push(...flattenTree(item.children))
        }
        return acc
    }, [])
}

interface CategoryTreeViewProps {
    categories: CategoryWithChildren[]
    onEdit: (category: CategoryWithChildren) => void
    onDelete: (category: CategoryWithChildren) => void
    onRefresh: () => void
}

export function CategoryTreeView({
    categories,
    onEdit,
    onDelete,
    onRefresh,
}: CategoryTreeViewProps) {
    const [activeId, setActiveId] = React.useState<string | null>(null)
    const [items, setItems] = React.useState<CategoryWithChildren[]>(categories)

    React.useEffect(() => {
        setItems(categories)
    }, [categories])

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string)
    }

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event

        if (!over || active.id === over.id) {
            setActiveId(null)
            return
        }

        const flatItems = flattenTree(items)
        const oldIndex = flatItems.findIndex((item) => item.id === active.id)
        const newIndex = flatItems.findIndex((item) => item.id === over.id)

        if (oldIndex === -1 || newIndex === -1) {
            setActiveId(null)
            return
        }

        const newItems = [...flatItems]
        const [removed] = newItems.splice(oldIndex, 1)
        newItems.splice(newIndex, 0, removed)

        const finalUpdates = newItems.map((item, index) => ({
            id: item.id,
            sortOrder: index,
            parentId: item.parentId,
        }))

        try {
            const result = await updateCategorySortOrders(finalUpdates)
            if (result.success) {
                toast.success("Đã cập nhật thứ tự danh mục")
                onRefresh()
            } else {
                toast.error(result.error || "Không thể cập nhật thứ tự")
            }
        } catch {
            toast.error("Có lỗi xảy ra khi cập nhật thứ tự")
        }

        setActiveId(null)
    }

    const renderTree = (items: CategoryWithChildren[], level = 0) => {
        return items.map((category) => (
            <CategoryTreeItem
                key={category.id}
                category={category}
                level={level}
                onEdit={onEdit}
                onDelete={onDelete}
            >
                {category.children &&
                    category.children.length > 0 &&
                    renderTree(category.children, level + 1)}
            </CategoryTreeItem>
        ))
    }

    const activeCategory = React.useMemo(() => {
        if (!activeId) return null
        const flatItems = flattenTree(items)
        return flatItems.find((item) => item.id === activeId)
    }, [activeId, items])

    const flattenedItems = flattenTree(items)

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <SortableContext
                items={flattenedItems.map((item) => item.id)}
                strategy={verticalListSortingStrategy}
            >
                <ScrollArea className="h-[calc(100vh-250px)]">
                    <div className="space-y-1 p-2">
                        {items.length > 0 ? (
                            renderTree(items)
                        ) : (
                            <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
                                Chưa có danh mục nào
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </SortableContext>

            <DragOverlay>
                {activeId && activeCategory ? (
                    <div className="rounded-lg border bg-background p-3 shadow-lg">
                        <div className="font-medium">{activeCategory.name}</div>
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    )
}

