"use client"

import * as React from "react"
import Image from "next/image"
import { X, Upload, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface ImageUploadProps {
    value?: string
    onChange: (value: string) => void
    disabled?: boolean
    className?: string
}

export function ImageUpload({
    value,
    onChange,
    disabled = false,
    className = "",
}: ImageUploadProps) {
    const [isUploading, setIsUploading] = React.useState(false)
    const [preview, setPreview] = React.useState<string | null>(value || null)
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    React.useEffect(() => {
        setPreview(value || null)
    }, [value])

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
        if (!validTypes.includes(file.type)) {
            toast.error("Chỉ chấp nhận file JPG, PNG, GIF, WEBP")
            return
        }

        const maxSize = 5 * 1024 * 1024
        if (file.size > maxSize) {
            toast.error("Kích thước file không được vượt quá 5MB")
            return
        }

        try {
            setIsUploading(true)

            const reader = new FileReader()
            reader.onloadend = () => {
                setPreview(reader.result as string)
            }
            reader.readAsDataURL(file)

            const formData = new FormData()
            formData.append("file", file)

            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            })

            if (!response.ok) {
                throw new Error("Upload failed")
            }

            const data = await response.json()
            onChange(data.url)
        } catch (error) {
            console.error("Upload error:", error)
            setPreview(null)
        } finally {
            setIsUploading(false)
            if (fileInputRef.current) {
                fileInputRef.current.value = ""
            }
        }
    }

    const handleRemove = async () => {
        if (value) {
            try {
                const filename = value.split("/").pop()
                await fetch(`/api/upload?filename=${filename}`, {
                    method: "DELETE",
                })
            } catch (error) {
                console.error("Delete error:", error)
            }
        }

        setPreview(null)
        onChange("")
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    return (
        <div className={`space-y-4 ${className}`}>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleFileChange}
                disabled={disabled || isUploading}
                className="hidden"
            />

            {preview ? (
                <div className="relative w-full max-w-sm mx-auto">
                    <div className="relative aspect-square rounded-lg overflow-hidden border">
                        <Image
                            src={preview}
                            alt="Preview"
                            fill
                            className="object-cover"
                            unoptimized={preview.startsWith("data:")}
                        />
                    </div>
                    <Button
                        type="button"
                        onClick={handleRemove}
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-8 w-8 rounded-full p-0"
                        disabled={disabled || isUploading}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                    {value && (
                        <Button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            variant="outline"
                            className="mt-2 w-full"
                            disabled={disabled || isUploading}
                        >
                            <Upload className="mr-2 h-4 w-4" />
                            Thay đổi ảnh
                        </Button>
                    )}
                </div>
            ) : (
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
                            <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        )}
                        <div className="text-sm text-muted-foreground">
                            <p className="font-medium">
                                {isUploading ? "Đang upload..." : "Click để chọn ảnh"}
                            </p>
                            <p className="text-xs mt-1">PNG, JPG, GIF, WEBP tối đa 5MB</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

