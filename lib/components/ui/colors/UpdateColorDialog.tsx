"use client";

import type { colors } from "@/app/generated/prisma/client";
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
import { Pencil } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner"; // Chuyển từ alert sang toast cho đồng bộ UX với form Create nhé bạn

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

  const [hex_code, setHexCode] = useState(color.hex_code || "#000000");

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    setHexCode(color.hex_code || "#000000");
  };

  // Hàm xử lý khi gõ text trực tiếp để ô Color Picker không bị crash hiển thị
  const handleHexTextChange = (val: string) => {
    let cleanVal = val.replace(/[^0-9a-fA-F#]/g, ""); // Chỉ nhận ký tự HEX hợp lệ

    if (cleanVal.length > 0 && !cleanVal.startsWith("#")) {
      cleanVal = "#" + cleanVal;
    }

    if (cleanVal.length <= 7) {
      setHexCode(cleanVal);
    }
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const hexTrimmed = hex_code.trim();
    const hexRegex = /^#[0-9A-Fa-f]{6}$/;

    if (!hexRegex.test(hexTrimmed)) {
      toast.error("Mã màu HEX không hợp lệ (Ví dụ: #FFFFFF)");
      return;
    }

    setIsLoading(true);
    const formData = new FormData(event.currentTarget);

    // Sửa tên key từ hexCode thành hex_code khớp hoàn toàn với API Route body destruct
    const payload = {
      name: (formData.get("name") as string)?.trim(),
      hex_code: hexTrimmed,
      description: (formData.get("description") as string)?.trim() || null,
    };

    try {
      // SỬA ĐỔI QUAN TRỌNG: Mã hóa ký tự đặc biệt # trên URL bằng encodeURIComponent
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
      <DialogTrigger asChild>
        <button
          type="button"
          className="p-1.5 rounded-md text-blue-500 hover:bg-blue-50 hover:text-blue-600 transition-colors inline-flex items-center justify-center"
          title="Cập nhật màu"
        >
          <Pencil className="h-4 w-4" />
        </button>
      </DialogTrigger>

      <DialogContent
        key={`${color.id}-${open}`}
        className="sm:max-w-sm bg-white text-black"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Cập nhật màu sắc</DialogTitle>
            <DialogDescription>
              Chỉnh sửa thông tin chi tiết của màu sắc sản phẩm. Nhấn lưu để
              hoàn tất.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup>
            {/* Tên màu */}
            <Field>
              <Label htmlFor={`color-name-${color.id}`}>Tên màu sắc</Label>
              <Input
                id={`color-name-${color.id}`}
                name="name"
                defaultValue={color.name}
                required
                autoComplete="off"
              />
            </Field>

            {/* Mã màu HEX */}
            <Field>
              <Label htmlFor={`color-hex-${color.id}`}>Mã màu (Hex Code)</Label>
              <div className="flex gap-2 items-center">
                <Input
                  id={`color-hex-${color.id}`}
                  type="color"
                  // Đảm bảo giá trị truyền vào picker luôn là chữ thường và chuẩn cấu trúc màu sắc
                  value={
                    hex_code.startsWith("#") && hex_code.length === 7
                      ? hex_code.toLowerCase()
                      : "#000000"
                  }
                  onChange={(e) => setHexCode(e.target.value)}
                  className="w-12 h-10 p-1 block rounded-md cursor-pointer custom-color-picker"
                />
                <Input
                  type="text"
                  value={hex_code}
                  onChange={(e) => handleHexTextChange(e.target.value)}
                  placeholder="#000000"
                  className="font-mono uppercase flex-1"
                />
              </div>
            </Field>

            {/* Mô tả màu sắc nếu có */}
            <Field>
              <Label htmlFor={`color-desc-${color.id}`}>Mô tả</Label>
              <Input
                id={`color-desc-${color.id}`}
                name="description"
                defaultValue={color.description || ""}
                autoComplete="off"
              />
            </Field>
          </FieldGroup>

          <DialogFooter className="pt-2">
            <DialogClose asChild>
              <Button variant="outline" type="button" disabled={isLoading}>
                Hủy
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
