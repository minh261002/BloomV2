"use client"

import * as React from "react"
import { Plus, Trash2, GripVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { VariantFormData } from "../types"
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core"
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface VariantItemProps {
    variant: VariantFormData & { _id: string }
    onUpdate: (id: string, data: Partial<VariantFormData>) => void
    onRemove: (id: string) => void
}

function VariantItem({ variant, onUpdate, onRemove }: VariantItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: variant._id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    }

    // Parse options to display
    const optionEntries = Object.entries(variant.options)

    return (
        <Card ref={setNodeRef} style={style} className="p-4">
            <div className="flex items-start gap-3">
                <div
                    {...attributes}
                    {...listeners}
                    className="cursor-move mt-2 text-muted-foreground hover:text-foreground"
                >
                    <GripVertical className="h-5 w-5" />
                </div>

                <div className="flex-1 space-y-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="space-y-2">
                            <Label className="text-xs">Tên biến thể</Label>
                            <Input
                                value={variant.name || ""}
                                onChange={(e) => onUpdate(variant._id, { name: e.target.value })}
                                placeholder="VD: Size M - Đỏ"
                                className="h-9"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs">Giá</Label>
                            <Input
                                type="number"
                                value={variant.price}
                                onChange={(e) =>
                                    onUpdate(variant._id, { price: Number(e.target.value) })
                                }
                                placeholder="0"
                                className="h-9"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs">Tồn kho</Label>
                            <Input
                                type="number"
                                value={variant.stock}
                                onChange={(e) =>
                                    onUpdate(variant._id, { stock: Number(e.target.value) })
                                }
                                placeholder="0"
                                className="h-9"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs">SKU (Auto)</Label>
                            <Input
                                value={variant.sku || "Auto"}
                                disabled
                                className="h-9 bg-muted"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs">Thuộc tính</Label>
                        <div className="flex flex-wrap gap-2">
                            {optionEntries.length > 0 ? (
                                optionEntries.map(([key, value]) => (
                                    <div key={key} className="flex items-center gap-1">
                                        <Input
                                            value={key}
                                            onChange={(e) => {
                                                const newOptions = { ...variant.options }
                                                delete newOptions[key]
                                                newOptions[e.target.value] = value
                                                onUpdate(variant._id, { options: newOptions })
                                            }}
                                            placeholder="Tên (VD: size)"
                                            className="h-8 w-24 text-xs"
                                        />
                                        <span className="text-xs text-muted-foreground">:</span>
                                        <Input
                                            value={value}
                                            onChange={(e) => {
                                                const newOptions = { ...variant.options }
                                                newOptions[key] = e.target.value
                                                onUpdate(variant._id, { options: newOptions })
                                            }}
                                            placeholder="Giá trị (VD: M)"
                                            className="h-8 w-24 text-xs"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => {
                                                const newOptions = { ...variant.options }
                                                delete newOptions[key]
                                                onUpdate(variant._id, { options: newOptions })
                                            }}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ))
                            ) : null}
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-8"
                                onClick={() => {
                                    const newKey = `option${Object.keys(variant.options).length + 1}`
                                    onUpdate(variant._id, {
                                        options: { ...variant.options, [newKey]: "" }
                                    })
                                }}
                            >
                                <Plus className="mr-1 h-3 w-3" />
                                Thêm thuộc tính
                            </Button>
                        </div>
                    </div>
                </div>

                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemove(variant._id)}
                    className="h-9 w-9 text-destructive hover:text-destructive"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </Card>
    )
}

interface ProductVariantListProps {
    variants: VariantFormData[]
    onChange: (variants: VariantFormData[]) => void
}

export function ProductVariantList({
    variants,
    onChange,
}: ProductVariantListProps) {
    const [items, setItems] = React.useState<(VariantFormData & { _id: string })[]>(
        variants.map((v, i) => ({ ...v, _id: v.id || `temp-${i}` }))
    )

    React.useEffect(() => {
        setItems(variants.map((v, i) => ({ ...v, _id: v.id || `temp-${i}-${Date.now()}` })))
    }, [variants])

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event

        if (over && active.id !== over.id) {
            const oldIndex = items.findIndex((item) => item._id === active.id)
            const newIndex = items.findIndex((item) => item._id === over.id)

            const newItems = arrayMove(items, oldIndex, newIndex)
            setItems(newItems)
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            onChange(newItems.map(({ _id, ...rest }) => rest))
        }
    }

    const handleAdd = () => {
        const newVariant: VariantFormData & { _id: string } = {
            _id: `temp-${Date.now()}`,
            name: "",
            price: 0,
            stock: 0,
            options: {},
        }
        const newItems = [...items, newVariant]
        setItems(newItems)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        onChange(newItems.map(({ _id, ...rest }) => rest))
    }

    const handleUpdate = (id: string, data: Partial<VariantFormData>) => {
        const newItems = items.map((item) =>
            item._id === id ? { ...item, ...data } : item
        )
        setItems(newItems)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        onChange(newItems.map(({ _id, ...rest }) => rest))
    }

    const handleRemove = (id: string) => {
        const newItems = items.filter((item) => item._id !== id)
        setItems(newItems)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        onChange(newItems.map(({ _id, ...rest }) => rest))
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Label className="text-base font-medium">
                    Biến thể ({items.length})
                </Label>
                <Button type="button" onClick={handleAdd} size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm biến thể
                </Button>
            </div>

            {items.length === 0 ? (
                <Card className="p-8 text-center text-muted-foreground">
                    <p>Chưa có biến thể nào. Click &quot;Thêm biến thể&quot; để bắt đầu.</p>
                </Card>
            ) : (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={items.map((i) => i._id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="space-y-3">
                            {items.map((variant) => (
                                <VariantItem
                                    key={variant._id}
                                    variant={variant}
                                    onUpdate={handleUpdate}
                                    onRemove={handleRemove}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}
        </div>
    )
}

