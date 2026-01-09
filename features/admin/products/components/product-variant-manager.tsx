"use client"

import * as React from "react"
import { Plus, Trash2, Settings2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { VariantFormData } from "../types"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

interface ProductVariantManagerProps {
    variants: VariantFormData[]
    onChange: (variants: VariantFormData[]) => void
}

export function ProductVariantManager({
    variants,
    onChange,
}: ProductVariantManagerProps) {
    const [optionTypes, setOptionTypes] = React.useState<string[]>([])
    const [optionValues, setOptionValues] = React.useState<Record<string, string[]>>({})
    const [inputValues, setInputValues] = React.useState<Record<string, string>>({})
    const [showOptions, setShowOptions] = React.useState(false)

    // Parse existing variants to extract option types
    React.useEffect(() => {
        if (variants.length > 0) {
            const allKeys = new Set<string>()
            const valuesByKey: Record<string, Set<string>> = {}

            variants.forEach((v) => {
                Object.entries(v.options).forEach(([key, value]) => {
                    allKeys.add(key)
                    if (!valuesByKey[key]) valuesByKey[key] = new Set()
                    valuesByKey[key].add(value)
                })
            })

            setOptionTypes(Array.from(allKeys))
            const values: Record<string, string[]> = {}
            Object.entries(valuesByKey).forEach(([key, set]) => {
                values[key] = Array.from(set)
            })
            setOptionValues(values)
        }
    }, [variants])

    const handleAddVariant = () => {
        const newVariant: VariantFormData = {
            name: "",
            price: 0,
            stock: 0,
            options: {},
        }
        onChange([...variants, newVariant])
    }

    const handleRemoveVariant = (index: number) => {
        onChange(variants.filter((_, i) => i !== index))
    }

    const handleUpdateVariant = (index: number, field: keyof VariantFormData, value: unknown) => {
        const updated = [...variants]
        updated[index] = { ...updated[index], [field]: value }
        onChange(updated)
    }

    const handleGenerateVariants = () => {
        if (Object.keys(optionValues).length === 0) return

        const optionKeys = Object.keys(optionValues)
        const combinations: Record<string, string>[] = []

        const generate = (index: number, current: Record<string, string>) => {
            if (index === optionKeys.length) {
                combinations.push({ ...current })
                return
            }

            const key = optionKeys[index]
            const values = optionValues[key]

            values.forEach((value) => {
                generate(index + 1, { ...current, [key]: value })
            })
        }

        generate(0, {})

        const newVariants = combinations.map((options) => {
            const name = Object.entries(options)
                .map(([k, v]) => `${k}: ${v}`)
                .join(" - ")

            return {
                name,
                price: 0,
                stock: 0,
                options,
            }
        })

        onChange(newVariants)
        setShowOptions(false)
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <Label className="text-base font-medium">
                        Biến thể ({variants.length})
                    </Label>
                    <p className="text-sm text-muted-foreground">
                        Quản lý các biến thể của sản phẩm
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowOptions(!showOptions)}
                    >
                        <Settings2 className="mr-2 h-4 w-4" />
                        Tùy chọn
                    </Button>
                    <Button type="button" onClick={handleAddVariant} size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Thêm thủ công
                    </Button>
                </div>
            </div>

            {/* Option Generator */}
            {showOptions && (
                <Card className="p-4 bg-muted/50">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="font-medium">Tự động tạo biến thể</Label>
                        </div>

                        <div className="space-y-3">
                            {optionTypes.map((type) => (
                                <div key={type} className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Label className="text-sm capitalize">{type}</Label>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 text-xs"
                                            onClick={() => {
                                                const newTypes = optionTypes.filter((t) => t !== type)
                                                setOptionTypes(newTypes)
                                                const newValues = { ...optionValues }
                                                delete newValues[type]
                                                setOptionValues(newValues)
                                                const newInputs = { ...inputValues }
                                                delete newInputs[type]
                                                setInputValues(newInputs)
                                            }}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                    <Input
                                        placeholder="VD: S, M, L, XL"
                                        value={inputValues[type] || ""}
                                        onChange={(e) => {
                                            const inputValue = e.target.value
                                            setInputValues({ ...inputValues, [type]: inputValue })

                                            // Parse values for preview
                                            const values = inputValue
                                                .split(",")
                                                .map((v) => v.trim())
                                                .filter((v) => v)
                                            setOptionValues({ ...optionValues, [type]: values })
                                        }}
                                        className="h-9"
                                    />
                                </div>
                            ))}

                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    const newType = `option${optionTypes.length + 1}`
                                    setOptionTypes([...optionTypes, newType])
                                    setOptionValues({ ...optionValues, [newType]: [] })
                                }}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Thêm tùy chọn
                            </Button>
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium">
                                    Sẽ tạo {Object.values(optionValues).reduce((acc, vals) => acc * (vals.length || 1), 1)} biến thể
                                </p>
                                {Object.keys(optionValues).length > 0 && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {Object.entries(optionValues).map(([k, v]) => `${k} (${v.length})`).join(" × ")}
                                    </p>
                                )}
                            </div>
                            <Button
                                type="button"
                                onClick={handleGenerateVariants}
                                disabled={Object.values(optionValues).reduce((acc, vals) => acc * (vals.length || 1), 1) === 0}
                            >
                                Tạo biến thể
                            </Button>
                        </div>
                    </div>
                </Card>
            )}

            {/* Variants Table */}
            {variants.length === 0 ? (
                <Card className="p-8 text-center text-muted-foreground">
                    <p className="mb-2">Chưa có biến thể nào</p>
                    <p className="text-sm">
                        Click &quot;Tùy chọn&quot; để tự động tạo hoặc &quot;Thêm thủ công&quot; để thêm từng biến thể
                    </p>
                </Card>
            ) : (
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[300px]">Biến thể</TableHead>
                                <TableHead>Thuộc tính</TableHead>
                                <TableHead className="w-[120px]">Giá</TableHead>
                                <TableHead className="w-[100px]">Tồn kho</TableHead>
                                <TableHead className="w-[100px]">SKU</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {variants.map((variant, index) => {
                                const optionBadges = Object.entries(variant.options).map(([key, value]) => (
                                    <Badge key={key} variant="secondary" className="text-xs">
                                        {key}: {value}
                                    </Badge>
                                ))

                                return (
                                    <TableRow key={index}>
                                        <TableCell>
                                            <Input
                                                value={variant.name || ""}
                                                onChange={(e) =>
                                                    handleUpdateVariant(index, "name", e.target.value)
                                                }
                                                placeholder="Tên biến thể"
                                                className="h-9"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {optionBadges.length > 0 ? optionBadges : (
                                                    <span className="text-xs text-muted-foreground">Không có</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                value={variant.price}
                                                onChange={(e) =>
                                                    handleUpdateVariant(index, "price", Number(e.target.value))
                                                }
                                                placeholder="0"
                                                className="h-9"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                value={variant.stock}
                                                onChange={(e) =>
                                                    handleUpdateVariant(index, "stock", Number(e.target.value))
                                                }
                                                placeholder="0"
                                                className="h-9"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="text-xs">
                                                Auto
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleRemoveVariant(index)}
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
            )}
        </div>
    )
}

