"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import slugify from "slugify"
import { CollectionFormData, CollectionWithCategory, ActiveStatus } from "../types"
import { CategoryWithChildren } from "@/features/admin/categories/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImageUpload } from "@/components/image-upload"

interface CollectionFormProps {
    collection?: CollectionWithCategory | null
    categories: CategoryWithChildren[]
    onSubmit: (data: CollectionFormData) => Promise<void>
    onCancel: () => void
    isSubmitting?: boolean
}

export function CollectionForm({
    collection,
    categories,
    onSubmit,
    onCancel,
    isSubmitting = false,
}: CollectionFormProps) {
    const [autoSlug, setAutoSlug] = React.useState(!collection?.slug)
    const [image, setImage] = React.useState<string | undefined>(
        collection?.image || undefined
    )
    const [uploadedImages, setUploadedImages] = React.useState<string[]>([])
    const initialImageRef = React.useRef(collection?.image || "")

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<CollectionFormData>({
        defaultValues: {
            name: collection?.name || "",
            slug: collection?.slug || "",
            description: collection?.description || "",
            image: collection?.image || "",
            categoryId: collection?.categoryId || undefined,
            featured: collection?.featured || false,
            status: collection?.status || ActiveStatus.ACTIVE,
            sortOrder: collection?.sortOrder || 0,
            metaTitle: collection?.metaTitle || "",
            metaDescription: collection?.metaDescription || "",
            metaKeywords: collection?.metaKeywords || "",
        },
    })

    // eslint-disable-next-line react-hooks/incompatible-library
    const name = watch("name")
    const featured = watch("featured")
    const status = watch("status")
    const categoryId = watch("categoryId")

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
        setValue("image", image || "")
        
        if (image && image !== initialImageRef.current && !uploadedImages.includes(image)) {
            setUploadedImages(prev => [...prev, image])
        }
    }, [image, setValue, uploadedImages])

    const handleFormSubmit = async (data: CollectionFormData) => {
        await onSubmit(data)
        setUploadedImages([])
    }
    
    const handleCancel = async () => {
        for (const url of uploadedImages) {
            if (url !== image) {
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

    const flattenCategories = (
        cats: CategoryWithChildren[],
        level = 0
    ): Array<{ category: CategoryWithChildren; level: number }> => {
        return cats.reduce((acc: Array<{ category: CategoryWithChildren; level: number }>, cat) => {
            acc.push({ category: cat, level })
            if (cat.children && cat.children.length > 0) {
                acc.push(...flattenCategories(cat.children, level + 1))
            }
            return acc
        }, [])
    }

    const categoryOptions = flattenCategories(categories)

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="general">Thông tin chung</TabsTrigger>
                    <TabsTrigger value="media">Hình ảnh</TabsTrigger>
                    <TabsTrigger value="seo">SEO</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">
                            Tên bộ sưu tập <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="name"
                            {...register("name", { required: "Tên bộ sưu tập là bắt buộc" })}
                            placeholder="Nhập tên bộ sưu tập"
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
                        <Label htmlFor="categoryId">Danh mục</Label>
                        <Select
                            value={categoryId || "__none__"}
                            onValueChange={(value) =>
                                setValue("categoryId", value === "__none__" ? undefined : value)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn danh mục (nếu có)" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="__none__">Không có</SelectItem>
                                {categoryOptions.map(({ category, level }) => (
                                    <SelectItem key={category.id} value={category.id}>
                                        {"\u00A0".repeat(level * 4)}
                                        {category.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Mô tả</Label>
                        <Textarea
                            id="description"
                            {...register("description")}
                            placeholder="Nhập mô tả bộ sưu tập"
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
                                Bộ sưu tập nổi bật
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                Hiển thị bộ sưu tập này ở vị trí nổi bật
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
                        <Label>Hình ảnh bộ sưu tập</Label>
                        <ImageUpload
                            value={image}
                            onChange={setImage}
                        />
                    </div>
                </TabsContent>

                <TabsContent value="seo" className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="metaTitle">Meta Title</Label>
                        <Input
                            id="metaTitle"
                            {...register("metaTitle")}
                            placeholder="Tiêu đề SEO"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="metaDescription">Meta Description</Label>
                        <Textarea
                            id="metaDescription"
                            {...register("metaDescription")}
                            placeholder="Mô tả SEO"
                            rows={3}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="metaKeywords">Meta Keywords</Label>
                        <Input
                            id="metaKeywords"
                            {...register("metaKeywords")}
                            placeholder="keyword1, keyword2, keyword3"
                        />
                        <p className="text-xs text-muted-foreground">
                            Các từ khóa cách nhau bởi dấu phẩy
                        </p>
                    </div>
                </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={handleCancel}>
                    Hủy
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Đang lưu..." : collection ? "Cập nhật" : "Tạo mới"}
                </Button>
            </div>
        </form>
    )
}


