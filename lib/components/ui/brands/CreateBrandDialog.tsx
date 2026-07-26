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
import { ImagePlus, Loader2, Sparkles, Trash2 } from "lucide-react";
import { CldImage, CldUploadWidget } from "next-cloudinary";
import { useState } from "react";

interface CreateBrandDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

// Helper chuyển đổi Tiếng Việt có dấu thành slug
function convertToSlug(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/([^0-9a-z-\s])/g, "")
    .replace(/(\s+)/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function CreateBrandDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateBrandDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [logoUrl, setLogoUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const [slug, setSlug] = useState("");
  const [isSlugEdited, setIsSlugEdited] = useState(false);

  // Pattern của React: Reset state trực tiếp khi đóng/mở Modal
  const [prevIsOpen, setPrevIsOpen] = useState(open);
  if (open !== prevIsOpen) {
    setPrevIsOpen(open);
    if (!open) {
      setLogoUrl("");
      setSlug("");
      setIsSlugEdited(false);
      setIsUploading(false);
      setIsLoading(false);
      setErrorMessage(null);
    } else {
      setErrorMessage(null);
    }
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nameValue = e.target.value;
    if (!isSlugEdited) {
      setSlug(convertToSlug(nameValue));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlug(e.target.value);
    setIsSlugEdited(true);
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: formData.get("name"),
      slug: slug.trim(),
      description: formData.get("description") || null,
      logo: logoUrl || null,
    };

    try {
      const response = await fetch("/api/catalogs/brands", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        onOpenChange(false);
        if (onSuccess) onSuccess();
      } else {
        setErrorMessage(result.message || "Không thể tạo thương hiệu này");
      }
    } catch (err) {
      setErrorMessage("Lỗi hệ thống khi gửi yêu cầu tạo mới");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] bg-white border border-slate-100 p-5 gap-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader className="space-y-1">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-slate-700">
                <Sparkles size={20} />
              </div>
              <div>
                <DialogTitle className="font-semibold text-slate-800 text-sm">
                  Thêm thương hiệu mới
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  Nhập thông tin chi tiết để tạo thương hiệu vào hệ thống.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Form Fields Container */}
          <div className="space-y-3">
            {/* Field: Tên thương hiệu */}
            <div className="space-y-1.5">
              <Label
                htmlFor="create-brand-name"
                className="text-xs font-medium text-slate-700"
              >
                Tên thương hiệu <span className="text-red-500">*</span>
              </Label>
              <Input
                id="create-brand-name"
                name="name"
                placeholder="Ví dụ: Nike, Adidas..."
                required
                onChange={handleNameChange}
                className="h-9 text-xs border-slate-200 focus-visible:ring-slate-400 rounded-lg placeholder:text-slate-400"
              />
            </div>

            {/* Field: Slug */}
            <div className="space-y-1.5">
              <Label
                htmlFor="create-brand-slug"
                className="text-xs font-medium text-slate-700"
              >
                Slug (Đường dẫn) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="create-brand-slug"
                name="slug"
                placeholder="vi-du-nike"
                required
                value={slug}
                onChange={handleSlugChange}
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
                {({ open: openWidget }) => (
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        document.body.style.pointerEvents = "auto";
                        openWidget();
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
                          openWidget();
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
                htmlFor="create-brand-desc"
                className="text-xs font-medium text-slate-700"
              >
                Mô tả
              </Label>
              <Textarea
                id="create-brand-desc"
                name="description"
                placeholder="Nhập mô tả ngắn về thương hiệu..."
                rows={2}
                className="text-xs border-slate-200 focus-visible:ring-slate-400 rounded-lg placeholder:text-slate-400 resize-none p-2.5"
              />
            </div>

            {/* Banner hiển thị lỗi (thay thế window.alert) */}
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
              onClick={() => onOpenChange(false)}
              disabled={isLoading || isUploading}
              className="px-3.5 py-1.5 h-auto text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isLoading || isUploading}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 h-auto text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg disabled:opacity-50 transition-colors shadow-sm"
            >
              {isLoading && <Loader2 size={14} className="animate-spin" />}
              {isLoading ? "Đang tạo..." : "Tạo mới"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
