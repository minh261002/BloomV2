"use client"

import * as React from "react"
import Image from "next/image"
import { X, Upload, GripVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
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
    rectSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface MultipleImageUploadProps {
    values?: string[]
    onChange: (values: string[]) => void
    disabled?: boolean
    maxFiles?: number
    className?: string
}

interface SortableImageProps {
    id: string
    url: string
    onRemove: (url: string) => void
    disabled?: boolean
}

function SortableImage({ id, url, onRemove, disabled }: SortableImageProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="relative aspect-square rounded-lg overflow-hidden border bg-muted group"
        >
            <Image
                src={url}
                alt="Preview"
                fill
                className="object-cover"
                unoptimized={url.startsWith("data:")}
            />

            <div
                {...attributes}
                {...listeners}
                className="absolute top-2 left-2 cursor-move bg-black/50 rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <GripVertical className="h-4 w-4 text-white" />
            </div>

            <Button
                type="button"
                onClick={() => onRemove(url)}
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                disabled={disabled}
            >
                <X className="h-3 w-3" />
            </Button>
        </div>
    )
}

export function MultipleImageUpload({
    values = [],
    onChange,
    disabled = false,
    maxFiles = 10,
    className = "",
}: MultipleImageUploadProps) {
    const [isUploading, setIsUploading] = React.useState(false)
    const [images, setImages] = React.useState<string[]>(values)
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    React.useEffect(() => {
        setImages(values)
    }, [values])

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

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event

        if (over && active.id !== over.id) {
            const oldIndex = images.indexOf(active.id as string)
            const newIndex = images.indexOf(over.id as string)

            const newImages = arrayMove(images, oldIndex, newIndex)
            setImages(newImages)
            onChange(newImages)
        }
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        if (files.length === 0) return

        if (images.length + files.length > maxFiles) {
            toast.error(`Chỉ được upload tối đa ${maxFiles} ảnh`)
            return
        }

        const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
        const maxSize = 5 * 1024 * 1024

        for (const file of files) {
            if (!validTypes.includes(file.type)) {
                toast.error(`${file.name}: Chỉ chấp nhận file JPG, PNG, GIF, WEBP`)
                return
            }
            if (file.size > maxSize) {
                toast.error(`${file.name}: Kích thước không được vượt quá 5MB`)
                return
            }
        }

        try {
            setIsUploading(true)
            const uploadedUrls: string[] = []

            for (const file of files) {
                const formData = new FormData()
                formData.append("file", file)

                const response = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                })

                if (!response.ok) {
                    throw new Error(`Upload ${file.name} failed`)
                }

                const data = await response.json()
                uploadedUrls.push(data.url)
            }

            const newImages = [...images, ...uploadedUrls]
            setImages(newImages)
            onChange(newImages)
        } catch (error) {
            console.error("Upload error:", error)
            toast.error("Upload ảnh thất bại")
        } finally {
            setIsUploading(false)
            if (fileInputRef.current) {
                fileInputRef.current.value = ""
            }
        }
    }

    const handleRemove = async (url: string) => {
        try {
            const filename = url.split("/").pop()
            await fetch(`/api/upload?filename=${filename}`, {
                method: "DELETE",
            })
        } catch (error) {
            console.error("Delete error:", error)
        }

        const newImages = images.filter((img) => img !== url)
        setImages(newImages)
        onChange(newImages)
    }

    return (
        <div className={`space-y-4 ${className}`}>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleFileChange}
                disabled={disabled || isUploading || images.length >= maxFiles}
                className="hidden"
                multiple
            />

            {images.length > 0 && (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext items={images} strategy={rectSortingStrategy}>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {images.map((url) => (
                                <SortableImage
                                    key={url}
                                    id={url}
                                    url={url}
                                    onRemove={handleRemove}
                                    disabled={disabled || isUploading}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}

            {images.length < maxFiles && (
                <div
                    onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
                    className={`
            relative cursor-pointer rounded-lg border-2 border-dashed p-6 text-center 
            transition-colors hover:border-primary
            ${disabled || isUploading ? "opacity-50 cursor-not-allowed" : ""}
          `}
                >
                    <div className="flex flex-col items-center justify-center space-y-2">
                        {isUploading ? (
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                        ) : (
                            <Upload className="h-8 w-8 text-muted-foreground" />
                        )}
                        <div className="text-sm text-muted-foreground">
                            <p className="font-medium">
                                {isUploading ? "Đang upload..." : "Click để chọn nhiều ảnh"}
                            </p>
                            <p className="text-xs mt-1">
                                PNG, JPG, GIF, WEBP tối đa 5MB ({images.length}/{maxFiles})
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

