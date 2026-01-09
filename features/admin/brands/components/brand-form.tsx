"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import slugify from "slugify"
import { BrandFormData, ActiveStatus } from "../types"
import { Brand } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImageUpload } from "@/components/image-upload"

interface BrandFormProps {
    brand?: Brand | null
    onSubmit: (data: BrandFormData) => Promise<void>
    onCancel: () => void
    isSubmitting?: boolean
}

export function BrandForm({
    brand,
    onSubmit,
    onCancel,
    isSubmitting = false,
}: BrandFormProps) {
    const [autoSlug, setAutoSlug] = React.useState(!brand?.slug)
    const [logo, setLogo] = React.useState<string | undefined>(
        brand?.logo || undefined
    )
    const [uploadedImages, setUploadedImages] = React.useState<string[]>([])
    const initialLogoRef = React.useRef(brand?.logo || "")

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<BrandFormData>({
        defaultValues: {
            name: brand?.name || "",
            slug: brand?.slug || "",
            description: brand?.description || "",
            logo: brand?.logo || "",
            website: brand?.website || "",
            featured: brand?.featured || false,
            status: brand?.status || ActiveStatus.ACTIVE,
            sortOrder: brand?.sortOrder || 0,
        },
    })

    // eslint-disable-next-line react-hooks/incompatible-library
    const name = watch("name")
    const featured = watch("featured")
    const status = watch("status")

    React.useEffect(() => {
        if (autoSlug && name) {
            const generatedSlug = slugify(name, {
                lower: true,
                strict: true,
                locale: "vi",
            })
            setValue("slug", generatedSlug)
        }
    }, [name, autoSlug, setValue])

    React.useEffect(() => {
        setValue("logo", logo || "")

        if (logo && logo !== initialLogoRef.current && !uploadedImages.includes(logo)) {
            setUploadedImages(prev => [...prev, logo])
        }
    }, [logo, setValue, uploadedImages])

    const handleFormSubmit = async (data: BrandFormData) => {
        await onSubmit(data)
        setUploadedImages([])
    }

    const handleCancel = async () => {
        for (const url of uploadedImages) {
            if (url !== logo) {
                try {
                    const filename = url.split("/").pop()
                    await fetch(`/api/upload?filename=${filename}`, {
                        method: "DELETE",
                    })
                } catch (error) {
                    console.error("Cleanup error:", error)
                }
            }
        }
        onCancel()
    }

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="general">Thông tin chung</TabsTrigger>
                    <TabsTrigger value="media">Logo</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">
                            Tên thương hiệu <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="name"
                            {...register("name", { required: "Tên thương hiệu là bắt buộc" })}
                            placeholder="Nhập tên thương hiệu"
                        />
                        {errors.name && (
                            <p className="text-sm text-destructive">{errors.name.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="slug">Slug</Label>
                            <div className="flex items-center gap-2">
                                <Label htmlFor="auto-slug" className="text-sm font-normal">
                                    Tự động tạo
                                </Label>
                                <Switch
                                    id="auto-slug"
                                    checked={autoSlug}
                                    onCheckedChange={setAutoSlug}
                                />
                            </div>
                        </div>
                        <Input
                            id="slug"
                            {...register("slug")}
                            placeholder="tu-dong-tao-slug"
                            disabled={autoSlug}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="website">Website</Label>
                        <Input
                            id="website"
                            type="url"
                            {...register("website")}
                            placeholder="https://example.com"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Mô tả</Label>
                        <Textarea
                            id="description"
                            {...register("description")}
                            placeholder="Nhập mô tả thương hiệu"
                            rows={4}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="status">Trạng thái</Label>
                            <Select
                                value={status}
                                onValueChange={(value) =>
                                    setValue("status", value as ActiveStatus)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={ActiveStatus.ACTIVE}>
                                        Hoạt động
                                    </SelectItem>
                                    <SelectItem value={ActiveStatus.INACTIVE}>
                                        Không hoạt động
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="sortOrder">Thứ tự sắp xếp</Label>
                            <Input
                                id="sortOrder"
                                type="number"
                                {...register("sortOrder", { valueAsNumber: true })}
                                placeholder="0"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label htmlFor="featured" className="font-medium">
                                Thương hiệu nổi bật
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                Hiển thị thương hiệu này ở vị trí nổi bật
                            </p>
                        </div>
                        <Switch
                            id="featured"
                            checked={featured}
                            onCheckedChange={(checked) => setValue("featured", checked)}
                        />
                    </div>
                </TabsContent>

                <TabsContent value="media" className="space-y-4">
                    <div className="space-y-2">
                        <Label>Logo thương hiệu</Label>
                        <ImageUpload
                            value={logo}
                            onChange={setLogo}
                        />
                    </div>
                </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={handleCancel}>
                    Hủy
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Đang lưu..." : brand ? "Cập nhật" : "Tạo mới"}
                </Button>
            </div>
        </form>
    )
}

