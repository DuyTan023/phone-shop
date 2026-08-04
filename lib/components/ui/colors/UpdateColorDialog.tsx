"use client";

import type { colors } from "@/app/generated/prisma/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Pencil } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface UpdateColorDialogProps {
  color: colors;
  onSuccess?: () => void;
}

export function UpdateColorDialog({
  color,
  onSuccess,
}: UpdateColorDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hexCode, setHexCode] = useState(color.hex_code || "#000000");

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    setHexCode(color.hex_code || "#000000");
  };

  const handleHexTextChange = (val: string) => {
    let cleanVal = val.replace(/[^0-9a-fA-F#]/g, "");

    if (cleanVal.length > 0 && !cleanVal.startsWith("#")) {
      cleanVal = "#" + cleanVal;
    }

    if (cleanVal.length <= 7) {
      setHexCode(cleanVal);
    }
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const hexTrimmed = hexCode.trim();
    const hexRegex = /^#[0-9A-Fa-f]{6}$/;

    if (!hexRegex.test(hexTrimmed)) {
      toast.error("Mã màu HEX không hợp lệ (Ví dụ: #FFFFFF)");
      return;
    }

    setIsLoading(true);
    const formData = new FormData(event.currentTarget);

    const payload = {
      name: (formData.get("name") as string)?.trim(),
      hex_code: hexTrimmed,
      description: (formData.get("description") as string)?.trim() || null,
    };

    try {
      const safeUrlParam = encodeURIComponent(color.hex_code);
      const response = await fetch(`/api/catalogs/colors/${safeUrlParam}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.message || "Cập nhật màu sắc thành công");
        setOpen(false);
        if (onSuccess) onSuccess();
      } else {
        toast.error(result.message || "Có lỗi xảy ra khi cập nhật màu sắc");
      }
    } catch (err) {
      console.error(err);
      toast.error("Lỗi kết nối server");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="p-1.5 rounded-md text-blue-500 hover:bg-blue-50 hover:text-blue-600 transition-colors inline-flex items-center justify-center"
            title="Cập nhật"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        }
      />

      <DialogContent
        key={`${color.id}-${open}`}
        className="sm:max-w-[440px] bg-white border border-slate-100 p-5 gap-4"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader className="space-y-1">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-slate-700">
                <Pencil size={18} />
              </div>
              <div>
                <DialogTitle className="font-semibold text-slate-800 text-sm">
                  Cập nhật màu sắc
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  Chỉnh sửa thông tin chi tiết của màu sắc. Nhấn lưu để hoàn
                  tất.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Form Fields Container */}
          <div className="space-y-3">
            {/* Field: Tên màu */}
            <div className="space-y-1.5">
              <Label
                htmlFor={`color-name-${color.id}`}
                className="text-xs font-medium text-slate-700"
              >
                Tên màu sắc <span className="text-red-500">*</span>
              </Label>
              <Input
                id={`color-name-${color.id}`}
                name="name"
                defaultValue={color.name}
                required
                autoComplete="off"
                className="h-9 text-xs border-slate-200 focus-visible:ring-slate-400 rounded-lg placeholder:text-slate-400"
              />
            </div>

            {/* Field: Mã màu (HEX) */}
            <div className="space-y-1.5">
              <Label
                htmlFor={`color-hex-${color.id}`}
                className="text-xs font-medium text-slate-700"
              >
                Mã màu (HEX) <span className="text-red-500">*</span>
              </Label>
              <div className="flex gap-2">
                <div className="relative w-9 h-9 shrink-0 rounded-lg border border-slate-200 overflow-hidden flex items-center justify-center bg-slate-50">
                  <Input
                    id={`color-hex-${color.id}`}
                    type="color"
                    value={
                      hexCode.startsWith("#") && hexCode.length === 7
                        ? hexCode.toLowerCase()
                        : "#000000"
                    }
                    onChange={(e) => setHexCode(e.target.value)}
                    disabled={isLoading}
                    className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 cursor-pointer p-0 border-none bg-transparent"
                  />
                </div>
                <Input
                  type="text"
                  value={hexCode}
                  onChange={(e) => handleHexTextChange(e.target.value)}
                  placeholder="#000000"
                  disabled={isLoading}
                  className="h-9 text-xs font-mono uppercase flex-1 border-slate-200 focus-visible:ring-slate-400 rounded-lg placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Field: Mô tả */}
            <div className="space-y-1.5">
              <Label
                htmlFor={`color-desc-${color.id}`}
                className="text-xs font-medium text-slate-700"
              >
                Mô tả
              </Label>
              <Textarea
                id={`color-desc-${color.id}`}
                name="description"
                defaultValue={color.description || ""}
                rows={2}
                disabled={isLoading}
                className="text-xs border-slate-200 focus-visible:ring-slate-400 rounded-lg placeholder:text-slate-400 resize-none p-2.5"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={isLoading}
              className="px-3.5 py-1.5 h-auto text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 h-auto text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg disabled:opacity-50 transition-colors shadow-sm"
            >
              {isLoading && <Loader2 size={14} className="animate-spin" />}
              {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
