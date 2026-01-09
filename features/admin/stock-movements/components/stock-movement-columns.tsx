"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  MoreHorizontal,
  Trash2,
  TrendingUp,
  TrendingDown,
  RefreshCw,
} from "lucide-react";
import { StockMovementWithRelations, StockMovementType } from "../types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTableColumnHeader } from "@/components/data-table";

const typeConfig = {
  IN: {
    label: "Nhập kho",
    variant: "default" as const,
    icon: TrendingUp,
    color: "text-green-600",
  },
  OUT: {
    label: "Xuất kho",
    variant: "destructive" as const,
    icon: TrendingDown,
    color: "text-red-600",
  },
  ADJUSTMENT: {
    label: "Kiểm kê",
    variant: "secondary" as const,
    icon: RefreshCw,
    color: "text-blue-600",
  },
};

export const createStockMovementColumns = (
  onDelete?: (movement: StockMovementWithRelations) => void
): ColumnDef<StockMovementWithRelations>[] => [
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ngày giờ" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return (
        <div className="flex flex-col">
          <span className="font-medium">
            {date.toLocaleDateString("vi-VN")}
          </span>
          <span className="text-xs text-muted-foreground">
            {date.toLocaleTimeString("vi-VN")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "product",
    header: "Sản phẩm",
    cell: ({ row }) => {
      const movement = row.original;
      return (
        <div className="flex flex-col">
          <span className="font-medium">{movement.product.name}</span>
          {movement.variant && (
            <span className="text-xs text-muted-foreground">
              {movement.variant.name}
            </span>
          )}
          <span className="text-xs text-muted-foreground">
            SKU: {movement.variant?.sku || movement.product.sku || "N/A"}
          </span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const movement = row.original;
      const searchValue = value.toLowerCase();
      return (
        movement.product.name.toLowerCase().includes(searchValue) ||
        movement.variant?.name?.toLowerCase().includes(searchValue) ||
        movement.product.sku?.toLowerCase().includes(searchValue) ||
        movement.variant?.sku?.toLowerCase().includes(searchValue) ||
        false
      );
    },
  },
  {
    accessorKey: "type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Loại" />
    ),
    cell: ({ row }) => {
      const type = row.getValue("type") as StockMovementType;
      const config = typeConfig[type];
      const Icon = config.icon;
      return (
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${config.color}`} />
          <Badge variant={config.variant}>{config.label}</Badge>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "quantity",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Số lượng" />
    ),
    cell: ({ row }) => {
      const movement = row.original;
      const type = movement.type;
      const prefix =
        type === StockMovementType.IN
          ? "+"
          : type === StockMovementType.OUT
          ? "-"
          : "";
      const color =
        type === StockMovementType.IN
          ? "text-green-600"
          : type === StockMovementType.OUT
          ? "text-red-600"
          : "text-blue-600";

      return (
        <span className={`font-bold ${color}`}>
          {prefix}
          {movement.quantity}
        </span>
      );
    },
  },
  {
    id: "stock",
    header: "Tồn kho",
    cell: ({ row }) => {
      const movement = row.original;
      return (
        <div className="flex items-center gap-2 text-sm">
          <span>{movement.stockBefore}</span>
          <span className="text-muted-foreground">→</span>
          <span className="font-medium">{movement.stockAfter}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "reference",
    header: "Tham chiếu",
    cell: ({ row }) => {
      const reference = row.getValue("reference") as string | null;
      if (!reference) return <span className="text-muted-foreground">-</span>;

      // If it's a PO code, make it stand out
      if (reference.startsWith("PO")) {
        return (
          <Badge variant="outline" className="font-mono">
            {reference}
          </Badge>
        );
      }

      return <span className="text-sm">{reference}</span>;
    },
  },
  {
    accessorKey: "notes",
    header: "Ghi chú",
    cell: ({ row }) => {
      const notes = row.getValue("notes") as string | null;
      if (!notes) return <span className="text-muted-foreground">-</span>;
      return (
        <span className="text-sm line-clamp-2" title={notes}>
          {notes}
        </span>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const movement = row.original;

      // Don't show delete for movements from PO
      if (movement.reference?.startsWith("PO") || !onDelete) {
        return null;
      }

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Mở menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Hành động</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(movement)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Xóa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
