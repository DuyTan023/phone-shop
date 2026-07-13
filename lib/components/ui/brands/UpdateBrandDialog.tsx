"use client";

import type { brands } from "@/app/generated/prisma/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImagePlus, Loader2, Pencil, X } from "lucide-react";
import { CldImage, CldUploadWidget } from "next-cloudinary";
import { useEffect, useState } from "react";

interface UpdateBrandDialogProps {
  brand: brands;
  onSuccess?: () => void;
}

export function UpdateBrandDialog({
  brand,
  onSuccess,
}: UpdateBrandDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [logoUrl, setLogoUrl] = useState(brand.logo || "");
  const [isUploading, setIsUploading] = useState(false);

  // Đồng bộ lại logoUrl nếu dữ liệu brand từ ngoài thay đổi
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLogoUrl(brand.logo || "");
  }, [brand.logo]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!brand.slug) {
      alert("Không tìm thấy slug của thương hiệu này!");
      return;
    }

    setIsLoading(true);
    const formData = new FormData(event.currentTarget);

    const payload = {
      name: formData.get("name"),
      logo: logoUrl,
    };

    try {
      const response = await fetch(`/api/catalogs/brands/${brand.slug}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        setOpen(false);
        if (onSuccess) onSuccess();
      } else {
        alert(result.message || "Có lỗi xảy ra khi cập nhật brand");
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
        setOpen(v);
        if (!v) setLogoUrl(brand.logo || "");
      }}
    >
      {/* TRIGGER ĐẶT ĐỘC LẬP VỚI FORM */}
      <DialogTrigger asChild>
        <button
          type="button"
          className="p-1.5 rounded-md text-blue-500 hover:bg-blue-50 hover:text-blue-600 transition-colors inline-flex items-center justify-center"
          title="Cập nhật"
        >
          <Pencil className="h-4 w-4" />
        </button>
      </DialogTrigger>

      {/* THÊM bg-white ĐỂ ĐẢM BẢO DIALOG MÀU TRẮNG */}
      <DialogContent className="sm:max-w-sm bg-white text-black">
        {/* ĐƯA THẺ FORM VÀO ĐÂY ĐỂ TRÁNH LỖI PHÂN TÁCH DIALOG */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Cập nhật thương hiệu</DialogTitle>
            <DialogDescription>
              Chỉnh sửa thông tin chi tiết của thương hiệu. Nhấn lưu để hoàn
              tất.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup>
            {/* Field Tên thương hiệu */}
            <Field>
              <Label htmlFor={`name-${brand.id}`}>Tên thương hiệu</Label>
              <Input
                id={`name-${brand.id}`}
                name="name"
                defaultValue={brand.name}
                required
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
                  // 🔥 THÊM ĐOẠN CẤU HÌNH STYLES NÀY VÀO:
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
                          <X className="h-3 w-3" />
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
              <Label htmlFor={`desc-${brand.id}`}>Mô tả</Label>
              <Textarea
                id={`desc-${brand.id}`}
                name="description"
                defaultValue={brand.description || ""}
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
              {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
