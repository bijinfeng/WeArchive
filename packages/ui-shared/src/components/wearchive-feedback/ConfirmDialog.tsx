import type { AlertDialogProps } from "@astryxdesign/core/AlertDialog";
import { AlertDialog } from "@astryxdesign/core/AlertDialog";
import { useEffect } from "react";

export interface ConfirmDialogProps {
  isOpen: boolean;
  isInline?: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  confirmVariant?: AlertDialogProps["actionVariant"];
  isConfirmLoading?: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: () => void | Promise<void>;
}

export function ConfirmDialog({
  isOpen,
  isInline = false,
  title,
  description,
  confirmLabel,
  cancelLabel = "取消",
  confirmVariant = "destructive",
  isConfirmLoading = false,
  onOpenChange,
  onConfirm,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!isOpen || typeof document === "undefined") {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onOpenChange(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onOpenChange]);

  return (
    <AlertDialog
      isOpen={isOpen}
      isInline={isInline}
      title={title}
      description={description}
      cancelLabel={cancelLabel}
      actionLabel={confirmLabel}
      actionVariant={confirmVariant}
      isActionLoading={isConfirmLoading}
      width={420}
      onOpenChange={onOpenChange}
      onAction={() => {
        void onConfirm();
      }}
    />
  );
}
