"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { SerieWithBrand } from "@/lib/repositories/catalogs/series.repository";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useState } from "react";

export interface DeleteSerieDialogProps {
  serie: SerieWithBrand | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void | Promise<void>;
}

export function DeleteSerieDialog({
  serie,
  open,
  onOpenChange,
  onSuccess,
}: DeleteSerieDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Reset state khi đóng dialog
  const [prevIsOpen, setPrevIsOpen] = useState(open);
  if (open !== prevIsOpen) {
    setPrevIsOpen(open);
    if (!open) {
      setIsLoading(false);
      setErrorMessage(null);
    }
  }

  async function handleDelete() {
    if (!serie?.id) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/catalogs/series/${serie.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (response.ok && result.success) {
        onOpenChange(false);
        if (onSuccess) {
          await onSuccess();
        }
      } else {
        setErrorMessage(
          result.message || "Không thể xóa dòng sản phẩm này. Hãy thử lại sau.",
        );
      }
    } catch (err) {
      setErrorMessage("Lỗi kết nối hệ thống khi gửi yêu cầu xóa");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] bg-white border border-slate-100 p-5 gap-4">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0 text-red-600">
              <AlertTriangle size={20} />
            </div>
            <div>
              <DialogTitle className="font-semibold text-slate-900 text-sm">
                Xác nhận xóa dòng sản phẩm
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Hành động này không thể hoàn tác.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3">
          <p className="text-xs text-slate-600 leading-relaxed">
            Bạn có chắc chắn muốn xóa dòng sản phẩm{" "}
            <span className="font-semibold text-slate-900">
              &quot;{serie?.name}&quot;
            </span>{" "}
            không? Mọi dữ liệu liên quan có thể bị ảnh hưởng.
          </p>

          {/* Hiển thị lỗi nếu xóa thất bại */}
          {errorMessage && (
            <div className="p-2.5 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg font-medium">
              {errorMessage}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="px-3.5 py-1.5 h-auto text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Hủy
          </Button>
          <Button
            type="button"
            onClick={handleDelete}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 h-auto text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50 transition-colors shadow-sm"
          >
            {isLoading && <Loader2 size={14} className="animate-spin" />}
            {isLoading ? "Đang xóa..." : "Xóa vĩnh viễn"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
