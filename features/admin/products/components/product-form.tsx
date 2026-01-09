"use client"

import * as React from "react"
import { useForm, Controller } from "react-hook-form"
import slugify from "slugify"
import { ProductFormData, ProductWithRelations, ProductType, ActiveStatus } from "../types"
import { CategoryWithChildren } from "@/features/admin/categories/types"
import { Brand } from "@prisma/client"
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
import { Checkbox } from "@/components/ui/checkbox"
import { MultipleImageUpload } from "@/components/multiple-image-upload"
import { ProductVariantManager } from "./product-variant-manager"
import { Card } from "@/components/ui/card"

interface ProductFormProps {
    product?: ProductWithRelations | null
    categories: CategoryWithChildren[]
    brands: Brand[]
    collections: { id: string; name: string }[]
    onSubmit: (data: ProductFormData) => Promise<void>
    onCancel: () => void
    isSubmitting?: boolean
}

export function ProductForm({
    product,
    categories,
    brands,
    collections,
    onSubmit,
    onCancel,
    isSubmitting = false,
}: ProductFormProps) {
    const [autoSlug, setAutoSlug] = React.useState(!product?.slug)

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        control,
        formState: { errors },
    } = useForm<ProductFormData>({
        defaultValues: {
            name: product?.name || "",
            slug: product?.slug || "",
            description: product?.description || "",
            shortDesc: product?.shortDesc || "",
            type: product?.type || ProductType.SIMPLE,
            price: Number(product?.price || 0),
            comparePrice: product?.comparePrice ? Number(product.comparePrice) : undefined,
            costPrice: product?.costPrice ? Number(product.costPrice) : undefined,
            sku: product?.sku || "",
            barcode: product?.barcode || "",
            trackStock: product?.trackStock ?? true,
            stock: product?.stock || 0,
            lowStock: product?.lowStock || 10,
            status: product?.status || ActiveStatus.ACTIVE,
            featured: product?.featured || false,
            categoryIds: product?.productCategories.map((pc) => pc.category.id) || [],
            brandId: product?.brandId || undefined,
            collectionId: product?.collectionId || undefined,
            metaTitle: product?.metaTitle || "",
            metaDescription: product?.metaDescription || "",
            metaKeywords: product?.metaKeywords || "",
            images: product?.images.map((img) => img.url) || [],
            variants: product?.variants.map((v) => ({
                id: v.id,
                name: v.name || "",
                sku: v.sku || "",
                barcode: v.barcode || "",
                price: Number(v.price),
                comparePrice: v.comparePrice ? Number(v.comparePrice) : undefined,
                costPrice: v.costPrice ? Number(v.costPrice) : undefined,
                stock: v.stock,
                image: v.image || "",
                options: JSON.parse(v.options),
            })) || [],
        },
    })

    // eslint-disable-next-line react-hooks/incompatible-library
    const name = watch("name")
    const productType = watch("type")
    const status = watch("status")
    const featured = watch("featured")
    const trackStock = watch("trackStock")
    const brandId = watch("brandId")
    const collectionId = watch("collectionId")
    const categoryIds = watch("categoryIds")

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

    const handleFormSubmit = async (data: ProductFormData) => {
        await onSubmit(data)
    }

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-5 mb-4 ">
                    <TabsTrigger value="general">Chung</TabsTrigger>
                    <TabsTrigger value="pricing">Giá</TabsTrigger>
                    <TabsTrigger value="inventory">Kho</TabsTrigger>
                    <TabsTrigger value="media">Hình ảnh</TabsTrigger>
                    <TabsTrigger value="seo">SEO</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">
                            Tên sản phẩm <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="name"
                            {...register("name", { required: "Tên sản phẩm là bắt buộc" })}
                            placeholder="Nhập tên sản phẩm"
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
                                    Tự động
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
                        <Label htmlFor="shortDesc">Mô tả ngắn</Label>
                        <Textarea
                            id="shortDesc"
                            {...register("shortDesc")}
                            placeholder="Mô tả ngắn hiển thị trong listing"
                            rows={2}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Mô tả chi tiết</Label>
                        <Textarea
                            id="description"
                            {...register("description")}
                            placeholder="Mô tả chi tiết sản phẩm"
                            rows={6}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Loại sản phẩm</Label>
                            <Select
                                value={productType}
                                onValueChange={(value) =>
                                    setValue("type", value as ProductType)
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={ProductType.SIMPLE}>
                                        Đơn giản
                                    </SelectItem>
                                    <SelectItem value={ProductType.VARIABLE}>
                                        Có biến thể
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Trạng thái</Label>
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
                    </div>

                    <div className="space-y-3">
                        <Label>Danh mục (chọn nhiều)</Label>
                        <Card className="p-4 max-h-60 overflow-y-auto">
                            {categoryOptions.map(({ category, level }) => (
                                <div
                                    key={category.id}
                                    className="flex items-center space-x-2 py-2"
                                    style={{ paddingLeft: `${level * 16}px` }}
                                >
                                    <Checkbox
                                        id={`cat-${category.id}`}
                                        checked={categoryIds?.includes(category.id)}
                                        onCheckedChange={(checked) => {
                                            const current = categoryIds || []
                                            if (checked) {
                                                setValue("categoryIds", [...current, category.id])
                                            } else {
                                                setValue(
                                                    "categoryIds",
                                                    current.filter((id) => id !== category.id)
                                                )
                                            }
                                        }}
                                    />
                                    <Label
                                        htmlFor={`cat-${category.id}`}
                                        className="text-sm font-normal cursor-pointer"
                                    >
                                        {category.name}
                                    </Label>
                                </div>
                            ))}
                        </Card>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Thương hiệu</Label>
                            <Select
                                value={brandId || "__none__"}
                                onValueChange={(value) =>
                                    setValue("brandId", value === "__none__" ? undefined : value)
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Chọn thương hiệu" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="__none__">Không có</SelectItem>
                                    {brands.map((brand) => (
                                        <SelectItem key={brand.id} value={brand.id}>
                                            {brand.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Bộ sưu tập</Label>
                            <Select
                                value={collectionId || "__none__"}
                                onValueChange={(value) =>
                                    setValue("collectionId", value === "__none__" ? undefined : value)
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Chọn bộ sưu tập" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="__none__">Không có</SelectItem>
                                    {collections.map((collection) => (
                                        <SelectItem key={collection.id} value={collection.id}>
                                            {collection.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label className="font-medium">Sản phẩm nổi bật</Label>
                            <p className="text-sm text-muted-foreground">
                                Hiển thị sản phẩm này ở vị trí nổi bật
                            </p>
                        </div>
                        <Switch
                            checked={featured}
                            onCheckedChange={(checked) => setValue("featured", checked)}
                        />
                    </div>
                </TabsContent>

                <TabsContent value="pricing" className="space-y-4">
                    {productType === ProductType.SIMPLE ? (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="price">
                                    Giá bán <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="price"
                                    type="number"
                                    step="0.01"
                                    {...register("price", {
                                        required: "Giá bán là bắt buộc",
                                        valueAsNumber: true,
                                    })}
                                    placeholder="0"
                                />
                                {errors.price && (
                                    <p className="text-sm text-destructive">{errors.price.message}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="comparePrice">Giá so sánh</Label>
                                    <Input
                                        id="comparePrice"
                                        type="number"
                                        step="0.01"
                                        {...register("comparePrice", { valueAsNumber: true })}
                                        placeholder="0"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Giá gốc trước khi giảm
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="costPrice">Giá vốn</Label>
                                    <Input
                                        id="costPrice"
                                        type="number"
                                        step="0.01"
                                        {...register("costPrice", { valueAsNumber: true })}
                                        placeholder="0"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Giá nhập hàng
                                    </p>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="rounded-lg border p-6 text-center text-muted-foreground">
                            <p>Giá được quản lý ở từng biến thể trong tab Kho</p>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="inventory" className="space-y-4">
                    {productType === ProductType.SIMPLE ? (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="sku">SKU (Auto-generate)</Label>
                                    <Input
                                        id="sku"
                                        value={watch("sku") || "Auto"}
                                        disabled
                                        className="bg-muted"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        SKU sẽ được tạo tự động khi lưu
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="barcode">Barcode (Auto-generate)</Label>
                                    <Input
                                        id="barcode"
                                        value={watch("barcode") || "Auto"}
                                        disabled
                                        className="bg-muted"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Barcode sẽ được tạo tự động khi lưu
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label className="font-medium">Theo dõi tồn kho</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Quản lý số lượng tồn kho
                                    </p>
                                </div>
                                <Switch
                                    checked={trackStock}
                                    onCheckedChange={(checked) => setValue("trackStock", checked)}
                                />
                            </div>

                            {trackStock && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="stock">Tồn kho</Label>
                                        <Input
                                            id="stock"
                                            type="number"
                                            {...register("stock", { valueAsNumber: true })}
                                            placeholder="0"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="lowStock">Cảnh báo tồn kho thấp</Label>
                                        <Input
                                            id="lowStock"
                                            type="number"
                                            {...register("lowStock", { valueAsNumber: true })}
                                            placeholder="10"
                                        />
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <div className="rounded-lg bg-muted p-4 mb-4">
                                <p className="text-sm font-medium mb-1">Sản phẩm có biến thể</p>
                                <p className="text-xs text-muted-foreground">
                                    Thêm các biến thể cho sản phẩm (VD: Size, Color, v.v.). Mỗi biến thể có giá và tồn kho riêng.
                                </p>
                            </div>
                            <Controller
                                name="variants"
                                control={control}
                                render={({ field }) => (
                                    <ProductVariantManager
                                        variants={field.value || []}
                                        onChange={field.onChange}
                                    />
                                )}
                            />
                        </>
                    )}
                </TabsContent>

                <TabsContent value="media" className="space-y-4">
                    <div className="space-y-2">
                        <Label>Thư viện ảnh</Label>
                        <Controller
                            name="images"
                            control={control}
                            render={({ field }) => (
                                <MultipleImageUpload
                                    values={field.value || []}
                                    onChange={field.onChange}
                                    maxFiles={10}
                                />
                            )}
                        />
                        <p className="text-xs text-muted-foreground">
                            Kéo thả để sắp xếp lại. Ảnh đầu tiên sẽ là ảnh đại diện.
                        </p>
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
                    </div>
                </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2 pt-4 border-t">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Hủy
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Đang lưu..." : product ? "Cập nhật" : "Tạo mới"}
                </Button>
            </div>
        </form>
    )
}

