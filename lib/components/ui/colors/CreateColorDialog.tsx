"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

  // Hàm trung gian để vừa đóng dialog vừa dọn dẹp dữ liệu cũ an toàn
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
        handleClose(); // Gọi hàm này để đóng form và xóa sạch chữ đã gõ cùng lúc
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
      <DialogContent className="bg-white sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Thêm màu sắc mới</DialogTitle>
            <DialogDescription>
              Nhập các thông tin chi tiết của màu sắc điện thoại để thêm vào
              danh mục.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">
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
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="hex_code">
                Mã màu (HEX) <span className="text-red-500">*</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  id="hex_color_picker"
                  type="color"
                  className="w-12 h-10 p-1 cursor-pointer rounded-md border"
                  value={formData.hex_code}
                  onChange={(e) =>
                    setFormData({ ...formData, hex_code: e.target.value })
                  }
                  disabled={loading}
                />
                <Input
                  id="hex_code"
                  placeholder="#ffffff"
                  className="font-mono uppercase flex-1"
                  value={formData.hex_code}
                  onChange={(e) =>
                    setFormData({ ...formData, hex_code: e.target.value })
                  }
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Mô tả</Label>
              <Input
                id="description"
                placeholder="Nhập mô tả ngắn về màu sắc này (nếu có)"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                disabled={loading}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={handleClose} // Đổi từ onOpenChange(false) sang handleClose
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                "Lưu lại"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
