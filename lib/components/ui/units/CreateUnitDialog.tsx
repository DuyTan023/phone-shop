"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2, Ruler } from "lucide-react";
import { useState } from "react";

interface CreateUnitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

// Inner Form Component - Mount khi dialog mở, dọn dẹp state tự động khi unmount
function CreateUnitForm({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !symbol.trim()) return;

    setErrorMessage(null);

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/catalogs/units", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), symbol: symbol.trim() }),
      });

      const resData = await res.json().catch(() => null);

      if (res.ok && resData?.success) {
        onClose();
        onSuccess();
        return;
      }

      // Xử lý thông báo lỗi dựa theo response API
      if (resData?.message) {
        setErrorMessage(resData.message);
      } else {
        switch (res.status) {
          case 409:
            setErrorMessage("Đơn vị tính hoặc ký hiệu này đã tồn tại.");
            break;
          case 400:
            setErrorMessage(
              "Dữ liệu đầu vào không hợp lệ. Vui lòng kiểm tra lại.",
            );
            break;
          default:
            setErrorMessage(
              "Có lỗi xảy ra phía máy chủ (500). Vui lòng thử lại sau.",
            );
            break;
        }
      }
    } catch (error) {
      console.error("Lỗi tạo Đơn vị:", error);
      setErrorMessage("Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Header Section */}
      <DialogHeader className="space-y-1">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-slate-700">
            <Ruler size={18} />
          </div>
          <div>
            <DialogTitle className="font-semibold text-slate-800 text-sm">
              Thêm đơn vị tính
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Tạo mới đơn vị đo lường cho các thuộc tính sản phẩm.
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      {/* Khối hiển thị thông báo lỗi */}
      {errorMessage && (
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs animate-in fade-in-50">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
          <div className="flex-1 font-medium">{errorMessage}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Tên đơn vị */}
        <div className="space-y-1.5">
          <Label
            htmlFor="unit-name"
            className="text-xs font-medium text-slate-700"
          >
            Tên đơn vị <span className="text-red-500">*</span>
          </Label>
          <Input
            id="unit-name"
            placeholder="VD: Megapixel, inch, gam..."
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errorMessage) setErrorMessage(null);
            }}
            disabled={isSubmitting}
            required
            className="h-9 text-xs border-slate-200 focus-visible:ring-slate-400 rounded-lg placeholder:text-slate-400"
          />
        </div>

        {/* Ký hiệu */}
        <div className="space-y-1.5">
          <Label
            htmlFor="unit-symbol"
            className="text-xs font-medium text-slate-700"
          >
            Ký hiệu <span className="text-red-500">*</span>
          </Label>
          <Input
            id="unit-symbol"
            placeholder="VD: MP, in, g..."
            value={symbol}
            onChange={(e) => {
              setSymbol(e.target.value);
              if (errorMessage) setErrorMessage(null);
            }}
            disabled={isSubmitting}
            required
            className="h-9 text-xs border-slate-200 focus-visible:ring-slate-400 rounded-lg placeholder:text-slate-400"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-3.5 py-1.5 h-auto text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Hủy
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !name.trim() || !symbol.trim()}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 h-auto text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg disabled:opacity-50 transition-colors shadow-sm"
          >
            {isSubmitting && <Loader2 size={14} className="animate-spin" />}
            Tạo mới
          </Button>
        </div>
      </form>
    </>
  );
}

// Outer Component
export function CreateUnitDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateUnitDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] bg-white border border-slate-100 p-5 gap-4 shadow-xl">
        {open && (
          <CreateUnitForm
            onClose={() => onOpenChange(false)}
            onSuccess={onSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
