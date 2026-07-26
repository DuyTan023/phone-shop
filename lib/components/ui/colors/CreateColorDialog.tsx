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
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Palette } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface CreateColorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const INITIAL_FORM_STATE = {
  name: "",
  hex_code: "#000000",
  description: "",
};

export function CreateColorDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateColorDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);

  const handleClose = () => {
    setFormData(INITIAL_FORM_STATE);
    onOpenChange(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.hex_code.trim()) {
      toast.error("Vui lòng điền đầy đủ Tên màu và Mã màu");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/catalogs/colors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();

      if (json.success) {
        toast.success(json.message || "Thêm màu sắc thành công");
        handleClose();
        onSuccess?.();
      } else {
        toast.error(json.message || "Có lỗi xảy ra, vui lòng thử lại");
      }
    } catch (error) {
      console.error("Create color error:", error);
      toast.error("Không thể kết nối tới server, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) handleClose();
        else onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-[440px] bg-white border border-slate-100 p-5 gap-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader className="space-y-1">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-slate-700">
                <Palette size={18} />
              </div>
              <div>
                <DialogTitle className="font-semibold text-slate-800 text-sm">
                  Thêm màu sắc mới
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  Nhập thông tin chi tiết màu sắc sản phẩm để thêm vào danh mục.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Form Fields Container */}
          <div className="space-y-3">
            {/* Field: Tên màu */}
            <div className="space-y-1.5">
              <Label
                htmlFor="name"
                className="text-xs font-medium text-slate-700"
              >
                Tên màu <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Ví dụ: Titanium Sa Mạc, Xanh Coral..."
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                disabled={loading}
                className="h-9 text-xs border-slate-200 focus-visible:ring-slate-400 rounded-lg placeholder:text-slate-400"
              />
            </div>

            {/* Field: Mã màu (HEX) */}
            <div className="space-y-1.5">
              <Label
                htmlFor="hex_code"
                className="text-xs font-medium text-slate-700"
              >
                Mã màu (HEX) <span className="text-red-500">*</span>
              </Label>
              <div className="flex gap-2">
                <div className="relative w-9 h-9 shrink-0 rounded-lg border border-slate-200 overflow-hidden flex items-center justify-center bg-slate-50">
                  <Input
                    id="hex_color_picker"
                    type="color"
                    className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 cursor-pointer p-0 border-none bg-transparent"
                    value={formData.hex_code}
                    onChange={(e) =>
                      setFormData({ ...formData, hex_code: e.target.value })
                    }
                    disabled={loading}
                  />
                </div>
                <Input
                  id="hex_code"
                  placeholder="#000000"
                  className="h-9 text-xs font-mono uppercase flex-1 border-slate-200 focus-visible:ring-slate-400 rounded-lg placeholder:text-slate-400"
                  value={formData.hex_code}
                  onChange={(e) =>
                    setFormData({ ...formData, hex_code: e.target.value })
                  }
                  disabled={loading}
                />
              </div>
            </div>

            {/* Field: Mô tả */}
            <div className="space-y-1.5">
              <Label
                htmlFor="description"
                className="text-xs font-medium text-slate-700"
              >
                Mô tả
              </Label>
              <Textarea
                id="description"
                placeholder="Nhập mô tả ngắn về màu sắc này (nếu có)"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                disabled={loading}
                rows={2}
                className="text-xs border-slate-200 focus-visible:ring-slate-400 rounded-lg placeholder:text-slate-400 resize-none p-2.5"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={loading}
              className="px-3.5 py-1.5 h-auto text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 h-auto text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg disabled:opacity-50 transition-colors shadow-sm"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {loading ? "Đang lưu..." : "Lưu lại"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
