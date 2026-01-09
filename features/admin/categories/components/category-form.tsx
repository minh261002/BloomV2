"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import slugify from "slugify"
import { CategoryFormData, CategoryWithChildren, ActiveStatus } from "../types"
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

interface CategoryFormProps {
    category?: CategoryWithChildren | null
    categories: CategoryWithChildren[]
    onSubmit: (data: CategoryFormData) => Promise<void>
    onCancel: () => void
    isSubmitting?: boolean
}

export function CategoryForm({
    category,
    categories,
    onSubmit,
    onCancel,
    isSubmitting = false,
}: CategoryFormProps) {
    const [autoSlug, setAutoSlug] = React.useState(!category?.slug)
    const [image, setImage] = React.useState<string | undefined>(
        category?.image || undefined
    )
    const [uploadedImages, setUploadedImages] = React.useState<string[]>([])
    const initialImageRef = React.useRef(category?.image || "")

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<CategoryFormData>({
        defaultValues: {
            name: category?.name || "",
            slug: category?.slug || "",
            description: category?.description || "",
            image: category?.image || "",
            parentId: category?.parentId || undefined,
            featured: category?.featured || false,
            status: category?.status || ActiveStatus.ACTIVE,
            sortOrder: category?.sortOrder || 0,
            metaTitle: category?.metaTitle || "",
            metaDescription: category?.metaDescription || "",
            metaKeywords: category?.metaKeywords || "",
        },
    })

    // eslint-disable-next-line react-hooks/incompatible-library
    const name = watch("name")
    const featured = watch("featured")
    const status = watch("status")
    const parentId = watch("parentId")

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

        // Track uploaded images (not initial image)
        if (image && image !== initialImageRef.current && !uploadedImages.includes(image)) {
            setUploadedImages(prev => [...prev, image])
        }
    }, [image, setValue, uploadedImages])

    const getParentOptions = () => {
        if (!category) return categories

        const isDescendant = (cat: CategoryWithChildren, ancestorId: string): boolean => {
            if (cat.id === ancestorId) return true
            if (cat.children) {
                return cat.children.some((child) => isDescendant(child, ancestorId))
            }
            return false
        }

        return categories.filter(
            (cat) => cat.id !== category.id && !isDescendant(cat, category.id)
        )
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

    const parentOptions = flattenCategories(getParentOptions())

    const handleFormSubmit = async (data: CategoryFormData) => {
        await onSubmit(data)
        // Clear tracking after successful submit
        setUploadedImages([])
    }

    const handleCancel = async () => {
        // Cleanup unused uploaded images when cancel
        for (const url of uploadedImages) {
            // Don't delete if it's being used in the form
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

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-4">
                    <TabsTrigger value="general">Thông tin chung</TabsTrigger>
                    <TabsTrigger value="media">Hình ảnh</TabsTrigger>
                    <TabsTrigger value="seo">SEO</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">
                            Tên danh mục <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="name"
                            {...register("name", { required: "Tên danh mục là bắt buộc" })}
                            placeholder="Nhập tên danh mục"
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
                        <Label htmlFor="parentId">Danh mục cha</Label>
                        <Select
                            value={parentId || "__none__"}
                            onValueChange={(value) =>
                                setValue("parentId", value === "__none__" ? undefined : value)
                            }
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Chọn danh mục cha (nếu có)" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="__none__">Không có</SelectItem>
                                {parentOptions.map(({ category, level }) => (
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
                            placeholder="Nhập mô tả danh mục"
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
                                <SelectTrigger className="w-full">
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

                    {/* Featured */}
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label htmlFor="featured" className="font-medium">
                                Danh mục nổi bật
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                Hiển thị danh mục này ở vị trí nổi bật
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
                        <Label>Hình ảnh danh mục</Label>
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
                    {isSubmitting ? "Đang lưu..." : category ? "Cập nhật" : "Tạo mới"}
                </Button>
            </div>
        </form>
    )
}

