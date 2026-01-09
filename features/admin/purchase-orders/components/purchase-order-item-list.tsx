"use client"

import * as React from "react"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { ProductWithRelations } from "@/features/admin/products/types"

type POItem = {
    productId: string
    variantId?: string | null
    quantity: number
    unitPrice: number
}

interface PurchaseOrderItemListProps {
    products: ProductWithRelations[]
    items: POItem[]
    onChange: (items: POItem[]) => void
}

export function PurchaseOrderItemList({
    products,
    items,
    onChange,
}: PurchaseOrderItemListProps) {
    const handleAdd = () => {
        onChange([...items, { productId: "", variantId: null, quantity: 1, unitPrice: 0 }])
    }

    const handleRemove = (index: number) => {
        onChange(items.filter((_, i) => i !== index))
    }

    const handleUpdate = (index: number, field: keyof POItem, value: unknown) => {
        const updated = [...items]
        updated[index] = { ...updated[index], [field]: value }
        onChange(updated)
    }

    const handleProductChange = (index: number, productId: string) => {
        const product = products.find((p) => p.id === productId)
        if (product) {
            const updated = [...items]
            updated[index] = {
                ...updated[index],
                productId,
                variantId: null,
                unitPrice: product.costPrice || product.price || 0,
            }
            onChange(updated)
        }
    }

    const handleVariantChange = (index: number, variantId: string) => {
        const item = items[index]
        const product = products.find((p) => p.id === item.productId)
        const variant = product?.variants.find((v) => v.id === variantId)
        
        if (variant) {
            const updated = [...items]
            updated[index] = {
                ...updated[index],
                variantId: variantId === "__none__" ? null : variantId,
                unitPrice: variant.costPrice || variant.price || 0,
            }
            onChange(updated)
        }
    }

    const getProductName = (productId: string, variantId?: string | null) => {
        const product = products.find((p) => p.id === productId)
        if (!product) return "Chọn sản phẩm"
        
        if (variantId) {
            const variant = product.variants.find((v) => v.id === variantId)
            return `${product.name} - ${variant?.name || ""}`
        }
        
        return product.name
    }

    const calculateTotal = () => {
        return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price)
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Label className="text-base font-medium">
                    Sản phẩm ({items.length})
                </Label>
                <Button type="button" onClick={handleAdd} size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm sản phẩm
                </Button>
            </div>

            {items.length === 0 ? (
                <div className="rounded-lg border p-8 text-center text-muted-foreground">
                    <p>Chưa có sản phẩm nào. Click &quot;Thêm sản phẩm&quot; để bắt đầu.</p>
                </div>
            ) : (
                <>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[400px]">Sản phẩm</TableHead>
                                    <TableHead className="w-[120px]">Số lượng</TableHead>
                                    <TableHead className="w-[150px]">Đơn giá</TableHead>
                                    <TableHead className="w-[150px]">Thành tiền</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.map((item, index) => {
                                    const product = products.find((p) => p.id === item.productId)
                                    const hasVariants = product && product.variants.length > 0

                                    return (
                                        <TableRow key={index}>
                                            <TableCell>
                                                <div className="space-y-2">
                                                    <Select
                                                        value={item.productId || "__none__"}
                                                        onValueChange={(value) =>
                                                            handleProductChange(index, value)
                                                        }
                                                    >
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Chọn sản phẩm" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="__none__">Chọn sản phẩm</SelectItem>
                                                            {products.map((p) => (
                                                                <SelectItem key={p.id} value={p.id}>
                                                                    {p.name} ({p.sku || "No SKU"})
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>

                                                    {hasVariants && (
                                                        <Select
                                                            value={item.variantId || "__none__"}
                                                            onValueChange={(value) =>
                                                                handleVariantChange(index, value)
                                                            }
                                                        >
                                                            <SelectTrigger className="w-full">
                                                                <SelectValue placeholder="Chọn biến thể" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="__none__">Không chọn</SelectItem>
                                                                {product.variants.map((v) => (
                                                                    <SelectItem key={v.id} value={v.id}>
                                                                        {v.name} ({v.sku || "No SKU"})
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    value={item.quantity}
                                                    onChange={(e) =>
                                                        handleUpdate(
                                                            index,
                                                            "quantity",
                                                            parseInt(e.target.value) || 1
                                                        )
                                                    }
                                                    className="w-full"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={item.unitPrice}
                                                    onChange={(e) =>
                                                        handleUpdate(
                                                            index,
                                                            "unitPrice",
                                                            parseFloat(e.target.value) || 0
                                                        )
                                                    }
                                                    className="w-full"
                                                />
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {formatPrice(item.quantity * item.unitPrice)}
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleRemove(index)}
                                                    className="h-8 w-8"
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex justify-end">
                        <div className="w-64 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Tổng cộng:</span>
                                <span className="font-bold text-lg">
                                    {formatPrice(calculateTotal())}
                                </span>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}


