"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";

interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemName: string;
  itemId?: number | string;
  onConfirm: () => Promise<void> | void;
}

export function DeleteDialog({
  open,
  onOpenChange,
  itemName,
  itemId,
  onConfirm,
}: DeleteDialogProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Reset error state khi dialog đóng/mở (State-during-render pattern)
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setErrorMessage(null);
    }
  }

  const handleConfirm = () => {
    setErrorMessage(null);
    startTransition(async () => {
      try {
        await onConfirm();
        onOpenChange(false);
      } catch (err) {
        setErrorMessage(
          err instanceof Error
            ? err.message
            : "Đã xảy ra lỗi khi gửi yêu cầu xóa",
        );
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] bg-white border border-slate-100 p-5 gap-4">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-3 text-red-600 mb-1">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
              <Trash2 size={20} />
            </div>
            <div>
              <DialogTitle className="font-semibold text-slate-800 text-sm">
                Xác nhận xóa
              </DialogTitle>
              <p className="text-xs text-slate-500">
                Hành động này không thể hoàn tác.
              </p>
            </div>
          </div>
        </DialogHeader>

        <DialogDescription
          render={<div />}
          className="text-xs text-slate-600 space-y-3"
        >
          <p>
            Bạn có chắc chắn muốn xóa{" "}
            <strong className="text-slate-800">&quot;{itemName}&quot;</strong>
            {itemId !== undefined && ` (ID: #${itemId})`} không?
          </p>

          {errorMessage && (
            <div className="p-2.5 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg">
              {errorMessage}
            </div>
          )}
        </DialogDescription>

        <div className="flex items-center justify-end gap-2 pt-1">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className="px-3.5 py-1.5 h-auto text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Hủy
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 h-auto text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50 transition-colors shadow-sm"
          >
            {isPending && <Loader2 size={14} className="animate-spin" />}
            Xóa vĩnh viễn
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
