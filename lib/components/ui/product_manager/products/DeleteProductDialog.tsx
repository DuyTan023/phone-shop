"use client";

import type { ApiResponse } from "@/lib/types/public/types";
import { Loader2, Trash2, X } from "lucide-react";
import { useEffect, useState, useTransition } from "react";

const PRODUCTS_API_URL = "/api/product_manager/products";

interface DeleteProductDialogProps {
  productId: number;
  productName?: string;
  onDeleted?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showTrigger?: boolean;
}

export function DeleteProductDialog({
  productId,
  productName,
  onDeleted,
  open: externalOpen,
  onOpenChange: setExternalOpen,
  showTrigger = true,
}: DeleteProductDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Controlled vs Uncontrolled state
  const isControlled = externalOpen !== undefined;
  const isOpen = isControlled ? externalOpen : internalOpen;

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setErrorMessage(null); // Reset error when opening
    }
    if (isControlled) {
      setExternalOpen?.(newOpen);
    } else {
      setInternalOpen(newOpen);
    }
  };

  // Đóng Modal khi nhấn phím ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isPending) {
        handleOpenChange(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isPending]);

  // Khóa scroll body khi Modal đang mở
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleDelete = () => {
    setErrorMessage(null);
    startTransition(async () => {
      try {
        const res = await fetch(`${PRODUCTS_API_URL}/${productId}`, {
          method: "DELETE",
        });
        const result: ApiResponse<null> = await res.json();

        if (res.ok && result.success) {
          handleOpenChange(false);
          onDeleted?.();
        } else {
          setErrorMessage(result.message || "Không thể xóa sản phẩm này");
        }
      } catch (err) {
        setErrorMessage("Lỗi hệ thống khi gửi yêu cầu xóa");
      }
    });
  };

  return (
    <>
      {/* Trigger Button thuần */}
      {showTrigger && (
        <button
          type="button"
          onClick={() => handleOpenChange(true)}
          className="p-1.5 rounded-md text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors inline-flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-red-500/20"
          title="Xóa sản phẩm"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}

      {/* Modal Overlay + Content */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop (Nền mờ) */}
          <div
            className="fixed inset-0 bg-black/50 transition-opacity animate-in fade-in duration-200"
            onClick={() => !isPending && handleOpenChange(false)}
          />

          {/* Modal Box */}
          <div className="relative w-full max-w-[400px] bg-white rounded-xl border border-slate-100 p-5 shadow-lg z-10 animate-in zoom-in-95 duration-200 space-y-4">
            {/* Close Button top-right */}
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleOpenChange(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 text-sm">
                  Xác nhận xóa
                </h3>
                <p className="text-xs text-slate-500">
                  Hành động này không thể hoàn tác.
                </p>
              </div>
            </div>

            {/* Body Description */}
            <div className="text-xs text-slate-600 space-y-2">
              <p>
                Bạn có chắc chắn muốn xóa sản phẩm{" "}
                <strong className="text-slate-800">
                  {productName ? `"${productName}"` : "này"}
                </strong>{" "}
                không?
              </p>

              {errorMessage && (
                <div className="p-2.5 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg">
                  {errorMessage}
                </div>
              )}
            </div>

            {/* Actions / Footer */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleOpenChange(false)}
                disabled={isPending}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-lg disabled:opacity-50 transition-colors shadow-sm"
              >
                {isPending && <Loader2 size={14} className="animate-spin" />}
                Xóa vĩnh viễn
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
