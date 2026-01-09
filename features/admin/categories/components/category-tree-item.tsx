"use client"

import * as React from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { ChevronDown, ChevronRight, GripVertical, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { CategoryWithChildren } from "../types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface CategoryTreeItemProps {
    category: CategoryWithChildren
    level: number
    onEdit: (category: CategoryWithChildren) => void
    onDelete: (category: CategoryWithChildren) => void
    children?: React.ReactNode
}

export function CategoryTreeItem({
    category,
    level,
    onEdit,
    onDelete,
    children,
}: CategoryTreeItemProps) {
    const [isExpanded, setIsExpanded] = React.useState(true)
    const hasChildren = category.children && category.children.length > 0

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: category.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    }

    return (
        <div ref={setNodeRef} style={style}>
            <div
                className={cn(
                    "group flex items-center gap-2 rounded-md border bg-background p-2 hover:bg-accent",
                    isDragging && "z-50 shadow-lg"
                )}
                style={{ paddingLeft: `${level * 24 + 8}px` }}
            >
                <div
                    {...attributes}
                    {...listeners}
                    className="cursor-move text-muted-foreground hover:text-foreground"
                >
                    <GripVertical className="h-4 w-4" />
                </div>

                {hasChildren ? (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                        ) : (
                            <ChevronRight className="h-4 w-4" />
                        )}
                    </Button>
                ) : (
                    <div className="w-6" />
                )}

                {category.image ? (
                    <Image
                        width={1000}
                        height={1000}
                        src={category.image}
                        alt={category.name}
                        className="h-8 w-8 rounded object-cover"
                    />
                ) : (
                    <div className="h-8 w-8 rounded bg-muted" />
                )}

                <div className="flex flex-1 items-center gap-2">
                    <span className="font-medium">{category.name}</span>
                    <span className="text-xs text-muted-foreground">
                        {category.slug}
                    </span>
                    {category.featured && (
                        <Badge variant="secondary" className="text-xs">
                            Nổi bật
                        </Badge>
                    )}
                    <Badge
                        variant={category.status === "ACTIVE" ? "default" : "outline"}
                        className="text-xs"
                    >
                        {category.status === "ACTIVE" ? "Hoạt động" : "Không hoạt động"}
                    </Badge>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100"
                        >
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onEdit(category)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => onDelete(category)}
                            className="text-destructive focus:text-destructive"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Xóa
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {hasChildren && isExpanded && (
                <div className="mt-1 space-y-1">{children}</div>
            )}
        </div>
    )
}

