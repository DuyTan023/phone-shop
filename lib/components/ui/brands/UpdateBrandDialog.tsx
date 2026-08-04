"use client";

import type { brands } from "@/app/generated/prisma/client";
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
import type { ApiResponse } from "@/lib/types/public/types";
import { ImagePlus, Loader2, Pencil, Trash2 } from "lucide-react";
import { CldImage, CldUploadWidget } from "next-cloudinary";
import { useState, useTransition } from "react";

const API_URL = "/api/catalogs/brands";

interface UpdateBrandDialogProps {
  brand: brands;
  onSuccess?: () => void;
}

export function UpdateBrandDialog({
  brand,
  onSuccess,
}: UpdateBrandDialogProps) {
  const [open, setOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState(brand.logo || "");
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Pattern React: Reset state trực tiếp khi đóng/mở dialog
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setLogoUrl(brand.logo || "");
      setErrorMessage(null);
    }
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!brand.slug) {
      setErrorMessage("Không tìm thấy slug của thương hiệu này!");
      return;
    }

    setErrorMessage(null);
    const formData = new FormData(event.currentTarget);

    const payload = {
      name: formData.get("name"),
      logo: logoUrl || null,
      description: formData.get("description") || null,
    };

    startTransition(async () => {
      try {
        const res = await fetch(`${API_URL}/${brand.slug}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const result: ApiResponse<null> = await res.json();

        if (res.ok && result.success) {
          setOpen(false);
          onSuccess?.();
        } else {
          setErrorMessage(
            result.message || "Có lỗi xảy ra khi cập nhật thương hiệu",
          );
        }
      } catch (err) {
        setErrorMessage("Lỗi hệ thống khi gửi yêu cầu cập nhật");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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

      <DialogContent className="sm:max-w-[440px] bg-white border border-slate-100 p-5 gap-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader className="space-y-1">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-slate-700">
                <Pencil size={18} />
              </div>
              <div>
                <DialogTitle className="font-semibold text-slate-800 text-sm">
                  Cập nhật thương hiệu
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  Chỉnh sửa thông tin chi tiết của thương hiệu. Nhấn lưu để hoàn
                  tất.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Form Fields Container */}
          <div className="space-y-3">
            {/* Field: Tên thương hiệu */}
            <div className="space-y-1.5">
              <Label
                htmlFor={`name-${brand.id}`}
                className="text-xs font-medium text-slate-700"
              >
                Tên thương hiệu <span className="text-red-500">*</span>
              </Label>
              <Input
                id={`name-${brand.id}`}
                name="name"
                defaultValue={brand.name}
                required
                className="h-9 text-xs border-slate-200 focus-visible:ring-slate-400 rounded-lg placeholder:text-slate-400"
              />
            </div>

            {/* Field: Logo Upload */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-700">
                Logo thương hiệu
              </Label>

              <CldUploadWidget
                uploadPreset="brand_logos"
                options={{
                  maxFiles: 1,
                  sources: ["local", "url", "camera"],
                  multiple: false,
                  cropping: true,
                  croppingAspectRatio: 1,
                  language: "vi",
                }}
                onUpload={() => setIsUploading(true)}
                onSuccess={(result) => {
                  setIsUploading(false);
                  const info = result.info;
                  if (
                    info &&
                    typeof info === "object" &&
                    "secure_url" in info
                  ) {
                    setLogoUrl(info.secure_url as string);
                  }
                }}
                onError={() => setIsUploading(false)}
              >
                {({ open: openCloudinary }) => (
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        document.body.style.pointerEvents = "auto";
                        openCloudinary();
                      }}
                      disabled={isUploading}
                      className="relative h-16 w-16 shrink-0 rounded-lg border border-dashed border-slate-200 bg-slate-50 hover:border-slate-400 hover:bg-slate-100/60 transition-colors flex items-center justify-center overflow-hidden group"
                    >
                      {isUploading ? (
                        <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
                      ) : logoUrl ? (
                        <CldImage
                          src={logoUrl}
                          alt="Logo thương hiệu"
                          width={64}
                          height={64}
                          crop="fill"
                          gravity="auto"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <ImagePlus className="h-5 w-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
                      )}
                    </button>

                    <div className="flex flex-col gap-1 text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          document.body.style.pointerEvents = "auto";
                          openCloudinary();
                        }}
                        disabled={isUploading}
                        className="text-slate-700 hover:text-slate-900 font-medium text-left transition-colors"
                      >
                        {logoUrl ? "Đổi ảnh khác" : "Tải logo lên"}
                      </button>

                      {logoUrl ? (
                        <button
                          type="button"
                          onClick={() => setLogoUrl("")}
                          className="text-red-500 hover:text-red-600 flex items-center gap-1 text-left transition-colors"
                        >
                          <Trash2 size={12} />
                          Xóa logo
                        </button>
                      ) : (
                        <span className="text-slate-400">
                          Khuyên dùng ảnh vuông PNG, JPG
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </CldUploadWidget>
            </div>

            {/* Field: Mô tả */}
            <div className="space-y-1.5">
              <Label
                htmlFor={`desc-${brand.id}`}
                className="text-xs font-medium text-slate-700"
              >
                Mô tả
              </Label>
              <Textarea
                id={`desc-${brand.id}`}
                name="description"
                defaultValue={brand.description || ""}
                rows={2}
                className="text-xs border-slate-200 focus-visible:ring-slate-400 rounded-lg placeholder:text-slate-400 resize-none p-2.5"
              />
            </div>

            {/* Banner hiển thị lỗi */}
            {errorMessage && (
              <div className="p-2.5 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg">
                {errorMessage}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={isPending || isUploading}
              className="px-3.5 py-1.5 h-auto text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isPending || isUploading}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 h-auto text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg disabled:opacity-50 transition-colors shadow-sm"
            >
              {isPending && <Loader2 size={14} className="animate-spin" />}
              {isPending ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
