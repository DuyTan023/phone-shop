"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { ApiResponse } from "@/lib/types/public/types";
import { Loader2, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";

const API_URL = "/api/catalogs/brands";

interface DeleteBrandDialogProps {
  slug: string;
  brandName?: string;
  onDeleted?: () => void;
}

export function DeleteBrandDialog({
  slug,
  brandName,
  onDeleted,
}: DeleteBrandDialogProps) {
  const [open, setOpen] = useState(false);
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

  const handleDelete = () => {
    setErrorMessage(null);
    startTransition(async () => {
      try {
        const res = await fetch(`${API_URL}/${slug}`, { method: "DELETE" });
        const result: ApiResponse<null> = await res.json();

        if (res.ok && result.success) {
          setOpen(false);
          onDeleted?.();
        } else {
          // Hiển thị lỗi inline ngay trên modal (vd: BRAND_HAS_PRODUCTS, NOT_FOUND)
          setErrorMessage(result.message || "Không thể xóa thương hiệu này");
        }
      } catch (err) {
        setErrorMessage("Lỗi hệ thống khi gửi yêu cầu xóa");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="p-1.5 rounded-md text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors inline-flex items-center justify-center"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>

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

        <DialogDescription asChild className="text-xs text-slate-600 space-y-3">
          <div>
            <p>
              Bạn có chắc chắn muốn xóa thương hiệu{" "}
              <strong className="text-slate-800">
                {brandName ? `"${brandName}"` : "này"}
              </strong>{" "}
              không?
            </p>

            {errorMessage && (
              <div className="p-2.5 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg">
                {errorMessage}
              </div>
            )}
          </div>
        </DialogDescription>

        <div className="flex items-center justify-end gap-2 pt-1">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setOpen(false)}
            disabled={isPending}
            className="px-3.5 py-1.5 h-auto text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Hủy
          </Button>
          <Button
            type="button"
            onClick={handleDelete}
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
