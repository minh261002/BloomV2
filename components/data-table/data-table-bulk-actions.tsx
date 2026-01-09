"use client"

import * as React from "react"
import { Table } from "@tanstack/react-table"
import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export interface BulkAction<TData> {
    label: string
    icon?: React.ComponentType<{ className?: string }>
    onClick: (selectedRows: TData[]) => void | Promise<void>
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
    disabled?: boolean
}

interface DataTableBulkActionsProps<TData> {
    table: Table<TData>
    actions: BulkAction<TData>[]
}

export function DataTableBulkActions<TData>({
    table,
    actions,
}: DataTableBulkActionsProps<TData>) {
    const selectedRows = table.getFilteredSelectedRowModel().rows
    const selectedCount = selectedRows.length

    if (selectedCount === 0) {
        return null
    }

    const selectedData = selectedRows.map((row) => row.original)

    return (
        <div className="flex items-center gap-2 rounded-md border bg-background px-3 py-2">
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                    {selectedCount} đã chọn
                </span>
                <Separator orientation="vertical" className="h-5" />
            </div>

            <div className="flex items-center gap-2">
                {actions.map((action, index) => {
                    const Icon = action.icon
                    return (
                        <Button
                            key={index}
                            variant={action.variant || "outline"}
                            size="sm"
                            onClick={() => action.onClick(selectedData)}
                            disabled={action.disabled}
                            className="h-8"
                        >
                            {Icon && <Icon className="mr-2 h-4 w-4" />}
                            {action.label}
                        </Button>
                    )
                })}
            </div>

            <Separator orientation="vertical" className="h-5" />

            <Button
                variant="ghost"
                size="sm"
                onClick={() => table.toggleAllPageRowsSelected(false)}
                className="h-8 px-2"
            >
                <X className="h-4 w-4" />
                <span className="sr-only">Bỏ chọn tất cả</span>
            </Button>
        </div>
    )
}

