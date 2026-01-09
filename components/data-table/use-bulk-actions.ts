"use client";

import * as React from "react";
import { useConfirmDialog } from "./confirm-dialog";
import { BulkAction } from "./data-table-bulk-actions";

interface UseBulkActionsOptions<TData, TUpdate = Partial<TData>> {
  onDelete?: (items: TData[]) => void | Promise<void>;
  onUpdate?: (items: TData[], updates: TUpdate) => void | Promise<void>;
  deleteConfirmation?: {
    title?: string;
    description?: string | ((count: number) => string);
    confirmText?: string;
  };
}

export function useBulkActions<TData, TUpdate = Partial<TData>>(
  options: UseBulkActionsOptions<TData, TUpdate> = {}
) {
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleBulkDelete = React.useCallback(
    (items: TData[]) => {
      if (!options.onDelete) return;

      const count = items.length;
      const description =
        typeof options.deleteConfirmation?.description === "function"
          ? options.deleteConfirmation.description(count)
          : options.deleteConfirmation?.description ||
            `Bạn có chắc chắn muốn xóa ${count} bản ghi đã chọn? Hành động này không thể hoàn tác.`;

      confirm({
        title: options.deleteConfirmation?.title || "Xóa nhiều bản ghi",
        description,
        confirmText: options.deleteConfirmation?.confirmText || "Xóa tất cả",
        cancelText: "Hủy",
        variant: "destructive",
        onConfirm: async () => {
          setIsLoading(true);
          try {
            await options.onDelete?.(items);
          } finally {
            setIsLoading(false);
          }
        },
      });
    },
    [options, confirm]
  );

  const handleBulkUpdate = React.useCallback(
    async (items: TData[], updates: TUpdate) => {
      if (!options.onUpdate) return;

      setIsLoading(true);
      try {
        await options.onUpdate(items, updates);
      } finally {
        setIsLoading(false);
      }
    },
    [options]
  );

  const createBulkAction = React.useCallback(
    (config: {
      label: string;
      icon?: React.ComponentType<{ className?: string }>;
      variant?:
        | "default"
        | "destructive"
        | "outline"
        | "secondary"
        | "ghost"
        | "link";
      onClick: (items: TData[]) => void | Promise<void>;
      confirmBefore?: {
        title: string;
        description: string | ((count: number) => string);
        confirmText?: string;
      };
    }): BulkAction<TData> => {
      return {
        label: config.label,
        icon: config.icon,
        variant: config.variant,
        disabled: isLoading,
        onClick: (items: TData[]) => {
          if (config.confirmBefore) {
            const description =
              typeof config.confirmBefore.description === "function"
                ? config.confirmBefore.description(items.length)
                : config.confirmBefore.description;

            confirm({
              title: config.confirmBefore.title,
              description,
              confirmText: config.confirmBefore.confirmText || "Xác nhận",
              cancelText: "Hủy",
              variant:
                config.variant === "destructive" ? "destructive" : "default",
              onConfirm: async () => {
                setIsLoading(true);
                try {
                  await config.onClick(items);
                } finally {
                  setIsLoading(false);
                }
              },
            });
          } else {
            config.onClick(items);
          }
        },
      };
    },
    [confirm, isLoading]
  );

  return {
    isLoading,
    handleBulkDelete,
    handleBulkUpdate,
    createBulkAction,
    ConfirmDialog,
  };
}
