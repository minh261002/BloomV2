"use client"

import * as React from "react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ConfirmDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onConfirm: () => void | Promise<void>
    title?: string
    description?: string
    confirmText?: string
    cancelText?: string
    variant?: "default" | "destructive"
    loading?: boolean
}

export function ConfirmDialog({
    open,
    onOpenChange,
    onConfirm,
    title = "Bạn có chắc chắn?",
    description = "Hành động này không thể hoàn tác. Bạn có muốn tiếp tục?",
    confirmText = "Xác nhận",
    cancelText = "Hủy",
    variant = "destructive",
    loading = false,
}: ConfirmDialogProps) {
    const [isLoading, setIsLoading] = React.useState(false)

    const handleConfirm = async () => {
        try {
            setIsLoading(true)
            await onConfirm()
            onOpenChange(false)
        } catch (error) {
            console.error("Confirm dialog error:", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading || loading}>
                        {cancelText}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault()
                            handleConfirm()
                        }}
                        disabled={isLoading || loading}
                        className={
                            variant === "destructive"
                                ? "bg-destructive text-white hover:bg-destructive/90"
                                : ""
                        }
                    >
                        {isLoading || loading ? "Đang xử lý..." : confirmText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export function useConfirmDialog() {
    const [open, setOpen] = React.useState(false)
    const [config, setConfig] = React.useState<{
        title?: string
        description?: string
        onConfirm: () => void | Promise<void>
        confirmText?: string
        cancelText?: string
        variant?: "default" | "destructive"
    }>({
        onConfirm: () => { },
    })

    const confirm = React.useCallback(
        (options: {
            title?: string
            description?: string
            onConfirm: () => void | Promise<void>
            confirmText?: string
            cancelText?: string
            variant?: "default" | "destructive"
        }) => {
            setConfig(options)
            setOpen(true)
        },
        []
    )

    const ConfirmDialogComponent = React.useCallback(
        () => (
            <ConfirmDialog
                open={open}
                onOpenChange={setOpen}
                title={config.title}
                description={config.description}
                onConfirm={config.onConfirm}
                confirmText={config.confirmText}
                cancelText={config.cancelText}
                variant={config.variant}
            />
        ),
        [open, config]
    )

    return {
        confirm,
        ConfirmDialog: ConfirmDialogComponent,
    }
}

