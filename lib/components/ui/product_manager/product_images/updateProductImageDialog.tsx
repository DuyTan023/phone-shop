"use client";

import { ImagePlus, Loader2, RefreshCw, Star, Trash2 } from "lucide-react";
import { CldImage, CldUploadWidget } from "next-cloudinary";
import { useEffect, useState } from "react";

import type { product_images } from "@/app/generated/prisma/client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface UpdateProductImageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  image: product_images | null; // Đối tượng hình ảnh cần chỉnh sửa
  colorName?: string; // Tên màu (nếu là ảnh biến thể/màu)
  onSuccess?: () => void;
}

export function UpdateProductImageDialog({
  open = false,
  onOpenChange,
  image,
  colorName,
  onSuccess,
}: UpdateProductImageDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // States form hình ảnh
  const [imageUrl, setImageUrl] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);

  // Điền dữ liệu cũ vào Form khi Dialog mở ra hoặc image thay đổi
  useEffect(() => {
    if (open && image) {
      setImageUrl(image.image_url || "");
      setIsFeatured(Boolean(image.is_featured));
      setErrorMessage(null);
    }
  }, [open, image]);

  // Reset state khi đóng Dialog
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setImageUrl("");
      setIsFeatured(false);
      setIsUploading(false);
      setIsLoading(false);
      setErrorMessage(null);
    }
    onOpenChange(newOpen);
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!image) return;

    if (!imageUrl) {
      setErrorMessage("Vui lòng tải lên hoặc chọn một hình ảnh.");
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    const payload = {
      image_url: imageUrl,
      // Cho phép cập nhật is_featured cho cả ảnh chung lẫn ảnh biến thể
      is_featured: isFeatured,
    };

    try {
      const response = await fetch(
        `/api/product_manager/product_images/${image.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const result = await response.json();

      if (response.ok && result.success) {
        handleOpenChange(false);
        if (onSuccess) onSuccess();
      } else {
        setErrorMessage(result.message || "Không thể cập nhật hình ảnh này.");
      }
    } catch (err) {
      setErrorMessage("Lỗi hệ thống khi gửi yêu cầu cập nhật ảnh.");
    } finally {
      setIsLoading(false);
    }
  }

  if (!image) return null;

  const isColorImage = Boolean(image.variant_id);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[440px] bg-white border border-slate-100 p-5 gap-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader className="space-y-1">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-slate-700">
                <RefreshCw size={20} />
              </div>
              <div>
                <DialogTitle className="font-semibold text-slate-800 text-sm">
                  Cập nhật hình ảnh{" "}
                  {isColorImage && colorName ? `(${colorName})` : "sản phẩm"}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  Thay đổi hình ảnh trên Cloudinary hoặc đặt làm ảnh đại diện
                  chính.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Form Fields Container */}
          <div className="space-y-4">
            {/* Field: Upload/Thay đổi ảnh bằng CldUploadWidget */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-700">
                Hình ảnh sản phẩm <span className="text-red-500">*</span>
              </Label>
              <CldUploadWidget
                uploadPreset="product_images"
                options={{
                  maxFiles: 1,
                  sources: ["local", "url", "camera"],
                  multiple: false,
                  cropping: false,
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
                    setImageUrl(info.secure_url as string);
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
                      className="relative h-20 w-20 shrink-0 rounded-lg border border-dashed border-slate-200 bg-slate-50 hover:border-slate-400 hover:bg-slate-100/60 transition-colors flex items-center justify-center overflow-hidden group"
                    >
                      {isUploading ? (
                        <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
                      ) : imageUrl ? (
                        <CldImage
                          src={imageUrl}
                          alt="Ảnh sản phẩm"
                          width={80}
                          height={80}
                          crop="fill"
                          gravity="auto"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <ImagePlus className="h-6 w-6 text-slate-400 group-hover:text-slate-600 transition-colors" />
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
                        {imageUrl ? "Đổi sang ảnh khác" : "Tải ảnh lên"}
                      </button>

                      {imageUrl && (
                        <button
                          type="button"
                          onClick={() => setImageUrl("")}
                          className="text-red-500 hover:text-red-600 flex items-center gap-1 text-left transition-colors"
                        >
                          <Trash2 size={12} />
                          Xóa ảnh hiện tại
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </CldUploadWidget>
            </div>

            {/* Field: Checkbox Đặt làm ảnh đại diện (Hiển thị cho TẤT CẢ các ảnh) */}
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg space-y-1">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit_is_featured"
                  checked={isFeatured}
                  onCheckedChange={(checked) => setIsFeatured(!!checked)}
                />
                <Label
                  htmlFor="edit_is_featured"
                  className="text-xs font-medium text-slate-800 cursor-pointer flex items-center gap-1.5"
                >
                  <Star
                    size={14}
                    className={
                      isFeatured
                        ? "fill-amber-400 text-amber-500"
                        : "text-slate-400"
                    }
                  />
                  Đặt làm ảnh đại diện sản phẩm (Featured Image)
                </Label>
              </div>
              <p className="text-[11px] text-slate-500 pl-6">
                Ảnh đại diện sẽ hiển thị ưu tiên trên danh sách sản phẩm và
                trang cửa hàng.
              </p>
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
              onClick={() => handleOpenChange(false)}
              disabled={isLoading || isUploading}
              className="px-3.5 py-1.5 h-auto text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isLoading || isUploading || !imageUrl}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 h-auto text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg disabled:opacity-50 transition-colors shadow-sm"
            >
              {isLoading && <Loader2 size={14} className="animate-spin" />}
              {isLoading ? "Đang cập nhật..." : "Lưu thay đổi"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
