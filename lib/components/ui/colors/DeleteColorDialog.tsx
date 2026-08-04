"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button"; // Thêm buttonVariants từ shadcn
import { cn } from "@/lib/utils";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

interface DeleteColorDialogProps {
  hexCode: string; // Mã màu dạng #ff0000 hoặc ffff00
  colorName?: string;
  onDeleted?: () => void; // Callback để reload danh sách sau khi xóa thành công
}

export function DeleteColorDialog({
  hexCode,
  colorName,
  onDeleted,
}: DeleteColorDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!hexCode) {
      toast.error("Không tìm thấy mã màu để xóa!");
      return;
    }

    setLoading(true);
    try {
      // Mã hóa dấu '#' thành '%23' để tránh lỗi gãy cấu trúc URL Route
      const encodedHex = encodeURIComponent(hexCode);

      const res = await fetch(`/api/catalogs/colors/${encodedHex}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const json: ApiResponse<null> = await res.json();

      if (json.success) {
        toast.success(json.message || "Xóa màu sắc thành công");
        setOpen(false);
        onDeleted?.();
      } else {
        toast.error(json.message || "Có lỗi xảy ra, vui lòng thử lại");
      }
    } catch (error) {
      console.error("Delete color error:", error);
      toast.error("Không thể kết nối tới server, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <button
            type="button"
            className="p-1.5 rounded-md text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors inline-flex items-center justify-center disabled:opacity-50"
            title="Xóa màu"
            disabled={loading}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        }
      />

      <AlertDialogContent className="bg-white text-black max-w-[400px] rounded-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xóa màu sắc</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa màu sắc
            <strong className="text-stone-900 font-semibold">
              {colorName ? ` "${colorName}" (${hexCode})` : ` ${hexCode}`}
            </strong>{" "}
            không? Hành động này sẽ loại bỏ màu ra khỏi danh mục hệ thống và
            không thể hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            disabled={loading}
            onClick={(e) => {
              e.preventDefault(); // Chặn tự động đóng dialog để giữ vòng xoay loading
              handleDelete();
            }}
            // Ép kiểu style bằng helper mang tính đồng bộ hệ thống Shadcn UI
            className={cn(
              buttonVariants({ variant: "destructive" }),
              "bg-red-600 hover:bg-red-700 text-white",
            )}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xóa...
              </>
            ) : (
              "Xóa"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
