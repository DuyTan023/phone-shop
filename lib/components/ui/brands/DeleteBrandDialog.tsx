"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner"; // nếu dùng shadcn toast thay vì sonner thì đổi lại

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
import { Button } from "@/components/ui/button";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

interface DeleteBrandDialogProps {
  slug: string;
  brandName?: string;
  onDeleted?: () => void; // callback để refetch/reload lại list sau khi xóa thành công
}

export function DeleteBrandDialog({
  slug,
  brandName,
  onDeleted,
}: DeleteBrandDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/catalogs/brands/${slug}`, {
        method: "DELETE",
      });

      const json: ApiResponse<null> = await res.json();

      if (json.success) {
        toast.success(json.message || "Xóa thành công");
        setOpen(false);
        onDeleted?.();
      } else {
        // Các message lỗi từ server: NOT_FOUND, BRAND_HAS_PRODUCTS, hoặc lỗi server
        toast.error(json.message || "Có lỗi xảy ra, vui lòng thử lại");
        setOpen(false);
      }
    } catch (error) {
      console.error("Delete brand error:", error);
      toast.error("Không thể kết nối tới server, vui lòng thử lại");
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="icon">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className="bg-white">
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xóa brand</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa
            {brandName ? ` "${brandName}"` : " brand này"} không? Hành động này
            không thể hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            disabled={loading}
            onClick={(e) => {
              e.preventDefault(); // chặn đóng dialog tự động để tự xử lý loading
              handleDelete();
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
