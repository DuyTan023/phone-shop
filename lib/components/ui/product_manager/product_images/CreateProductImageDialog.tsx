"use client";

import { ImagePlus, Loader2, Sparkles, Trash2 } from "lucide-react";
import { CldImage, CldUploadWidget } from "next-cloudinary";
import { useState } from "react";

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

interface CreateProductImageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: number;
  variantId?: number | null; // Nếu truyền vào sẽ là ảnh theo biến thể/màu, nếu null/undefined là ảnh chung
  colorName?: string; // Tên màu (nếu có) để hiển thị UI thân thiện hơn
  onSuccess?: () => void;
}

export function CreateProductImageDialog({
  open = false,
  onOpenChange,
  productId,
  variantId = null,
  colorName,
  onSuccess,
}: CreateProductImageDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // States của form hình ảnh
  const [imageUrl, setImageUrl] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);

  // Pattern React: Reset state trực tiếp khi đóng/mở Dialog mà không dùng useEffect
  const [prevIsOpen, setPrevIsOpen] = useState(open);
  if (open !== prevIsOpen) {
    setPrevIsOpen(open);
    if (!open) {
      setImageUrl("");
      setIsFeatured(false);
      setIsUploading(false);
      setIsLoading(false);
      setErrorMessage(null);
    } else {
      setErrorMessage(null);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!imageUrl) {
      setErrorMessage("Vui lòng tải lên một hình ảnh.");
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    const payload = {
      product_id: productId,
      variant_id: variantId || null,
      image_url: imageUrl,
      is_featured: variantId ? false : isFeatured, // Ảnh biến thể thường không đặt làm đại diện chung
    };

    try {
      const response = await fetch("/api/product_manager/product_images", {
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
        setErrorMessage(result.message || "Không thể thêm hình ảnh này");
      }
    } catch (err) {
      setErrorMessage("Lỗi hệ thống khi gửi yêu cầu thêm ảnh");
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
                  {colorName
                    ? `Thêm ảnh cho màu: ${colorName}`
                    : "Thêm ảnh sản phẩm mới"}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  Tải hình ảnh lên Cloudinary để liên kết với sản phẩm này.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Form Fields Container */}
          <div className="space-y-4">
            {/* Field: Upload Ảnh bằng CldUploadWidget */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-700">
                Hình ảnh sản phẩm <span className="text-red-500">*</span>
              </Label>
              <CldUploadWidget
                uploadPreset="product_images" // Thay đổi preset đúng cấu hình Cloudinary của bạn
                options={{
                  maxFiles: 1,
                  sources: ["local", "url", "camera"],
                  multiple: false,
                  cropping: false, // Thường ảnh sản phẩm giữ nguyên tỉ lệ gốc
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
                        {imageUrl ? "Đổi ảnh khác" : "Tải ảnh lên"}
                      </button>

                      {imageUrl ? (
                        <button
                          type="button"
                          onClick={() => setImageUrl("")}
                          className="text-red-500 hover:text-red-600 flex items-center gap-1 text-left transition-colors"
                        >
                          <Trash2 size={12} />
                          Xóa ảnh
                        </button>
                      ) : (
                        <span className="text-slate-400">
                          Hỗ trợ định dạng JPG, PNG, WEBP
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </CldUploadWidget>
            </div>

            {/* Field: Đặt làm ảnh đại diện (Chỉ hiển thị với ảnh chung) */}
            {!variantId && (
              <div className="flex items-center space-x-2 pt-1">
                <Checkbox
                  id="is_featured"
                  checked={isFeatured}
                  onCheckedChange={(checked) => setIsFeatured(!!checked)}
                />
                <Label
                  htmlFor="is_featured"
                  className="text-xs font-medium text-slate-700 cursor-pointer"
                >
                  Đặt làm ảnh đại diện sản phẩm (Featured Image)
                </Label>
              </div>
            )}

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
              onClick={() => onOpenChange(false)}
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
              {isLoading ? "Đang lưu..." : "Thêm ảnh"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
