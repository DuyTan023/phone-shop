"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImagePlus, Loader2 } from "lucide-react";
import { CldImage, CldUploadWidget } from "next-cloudinary";
import { useState } from "react";

interface CreateBrandDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

// Hàm helper chuyển đổi Tiếng Việt có dấu thành slug
function convertToSlug(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Xóa dấu
    .replace(/đ/g, "d")
    .replace(/([^0-9a-z-\s])/g, "") // Xóa ký tự đặc biệt
    .replace(/(\s+)/g, "-") // Thay khoảng trắng bằng dấu -
    .replace(/-+/g, "-") // Thu gọn nhiều dấu - liên tiếp
    .replace(/^-+|-+$/g, ""); // Xóa dấu - ở đầu và cuối
}

export function CreateBrandDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateBrandDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [logoUrl, setLogoUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // State quản lý slug để có thể tự động điền hoặc sửa thủ công
  const [slug, setSlug] = useState("");
  // Biến đánh dấu xem người dùng đã tự tay sửa slug chưa (nếu sửa rồi thì dừng tự động đồng bộ)
  const [isSlugEdited, setIsSlugEdited] = useState(false);

  // Hàm reset form khi đóng dialog hoặc tạo thành công
  const resetForm = () => {
    setLogoUrl("");
    setSlug("");
    setIsSlugEdited(false);
    setIsUploading(false);
    setIsLoading(false);
  };

  // Sự kiện khi thay đổi tên thương hiệu -> Tự sinh slug
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nameValue = e.target.value;
    if (!isSlugEdited) {
      setSlug(convertToSlug(nameValue));
    }
  };

  // Sự kiện khi người dùng tự gõ vào ô slug
  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlug(e.target.value);
    setIsSlugEdited(true); // Đánh dấu là user đã tự sửa
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsLoading(true);
    const formData = new FormData(event.currentTarget);

    // Chuẩn bị payload khớp với cấu trúc API nhận vào (bao gồm cả slug)
    const payload = {
      name: formData.get("name"),
      slug: slug.trim(), // Lấy từ state slug
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

      if (result.success) {
        onOpenChange(false);
        resetForm();
        if (onSuccess) onSuccess();
      } else {
        // 🔥 XỬ LÝ CHECK TRÙNG SLUG: API của bạn trả về { success: false, message: "Slug đã tồn tại" }
        alert(result.message || "Có lỗi xảy ra khi tạo brand");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi kết nối server");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) resetForm();
      }}
    >
      <DialogContent className="sm:max-w-sm bg-white text-black">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Thêm thương hiệu mới</DialogTitle>
            <DialogDescription>
              Nhập thông tin chi tiết để tạo thương hiệu mới vào hệ thống.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup>
            {/* Field Tên thương hiệu */}
            <Field>
              <Label htmlFor="create-brand-name">Tên thương hiệu</Label>
              <Input
                id="create-brand-name"
                name="name"
                placeholder="Nhập tên thương hiệu..."
                required
                onChange={handleNameChange}
              />
            </Field>

            {/* 🔥 MỚI: Field Slug đường dẫn */}
            <Field>
              <Label htmlFor="create-brand-slug">Slug (Đường dẫn)</Label>
              <Input
                id="create-brand-slug"
                name="slug"
                placeholder="vi-du-ten-thuong-hieu"
                required
                value={slug}
                onChange={handleSlugChange}
              />
            </Field>

            {/* Field Logo */}
            <Field>
              <Label>Logo thương hiệu</Label>
              <CldUploadWidget
                uploadPreset="brand_logos"
                options={{
                  maxFiles: 1,
                  sources: ["local", "url", "camera"],
                  multiple: false,
                  cropping: true,
                  croppingAspectRatio: 1,
                  language: "vi",
                  text: {
                    vi: {
                      local: { browse: "Chọn ảnh từ máy" },
                    },
                  },
                  styles: {
                    palette: {
                      window: "#FFFFFF",
                      windowBorder: "#90A4AE",
                      tabIcon: "#0078FF",
                      menuIcons: "#5A616A",
                      textDark: "#000000",
                      textLight: "#FFFFFF",
                      link: "#0078FF",
                      action: "#FF620C",
                      inactiveTabIcon: "#0E2F5A",
                      error: "#F44235",
                      inProgress: "#0078FF",
                      complete: "#20B2AA",
                      sourceBg: "#E4EBF1",
                    },
                    fonts: {
                      default: null,
                      "'Fira Sans', sans-serif": {
                        url: "https://fonts.googleapis.com/css?family=Fira+Sans",
                        active: true,
                      },
                    },
                  },
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
                {({ open }) => (
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        document.body.style.pointerEvents = "auto";
                        open();
                      }}
                      disabled={isUploading}
                      className="relative h-20 w-20 shrink-0 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/50 transition-colors flex items-center justify-center overflow-hidden group"
                      title="Bấm để chọn ảnh"
                    >
                      {isUploading ? (
                        <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                      ) : logoUrl ? (
                        <CldImage
                          src={logoUrl}
                          alt="Logo thương hiệu"
                          width={80}
                          height={80}
                          crop="fill"
                          gravity="auto"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <ImagePlus className="h-6 w-6 text-gray-400 group-hover:text-blue-500" />
                      )}
                    </button>

                    <div className="flex flex-col gap-1.5 text-sm">
                      <button
                        type="button"
                        onClick={() => {
                          document.body.style.pointerEvents = "auto";
                          open();
                        }}
                        disabled={isUploading}
                        className="text-blue-600 hover:text-blue-700 font-medium text-left"
                      >
                        {logoUrl ? "Đổi ảnh khác" : "Tải ảnh lên"}
                      </button>

                      {logoUrl && (
                        <button
                          type="button"
                          onClick={() => setLogoUrl("")}
                          className="text-gray-400 hover:text-red-500 flex items-center gap-1 text-left"
                        >
                          Xoá ảnh
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </CldUploadWidget>
            </Field>

            {/* Field Mô tả */}
            <Field>
              <Label htmlFor="create-brand-desc">Mô tả</Label>
              <Textarea
                id="create-brand-desc"
                name="description"
                placeholder="Nhập mô tả ngắn về thương hiệu..."
                rows={3}
              />
            </Field>
          </FieldGroup>

          <DialogFooter className="pt-2">
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Hủy
              </Button>
            </DialogClose>

            <Button type="submit" disabled={isLoading || isUploading}>
              {isLoading ? "Đang tạo..." : "Tạo mới"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
