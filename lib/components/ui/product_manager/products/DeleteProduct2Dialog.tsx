"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
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
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

interface DeleteProductDialogProps {
  id: number;
  name?: string;
  onDeleted?: () => void;
}

export function DeleteProduct2Dialog({ id, name }: DeleteProductDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!id) {
      toast.error("Không tìm thấy sản phẩm để xóa!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/product_manager/products/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const json: ApiResponse<null> = await res.json();

      if (json.success) {
        toast.success(json.message || "Xóa sản phẩm thành công");
        setOpen(false);
        // Chuyển hướng về trang danh sách sản phẩm/điện thoại
        router.push("/admin/phones/");
        router.refresh();
      } else {
        toast.error(json.message || "Có lỗi xảy ra, vui lòng thử lại");
      }
    } catch (error) {
      console.error("Delete product error:", error);
      toast.error("Không thể kết nối tới server, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <button
          type="button"
          className="p-1.5 rounded-md text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors inline-flex items-center justify-center disabled:opacity-50"
          title="Xóa sản phẩm"
          disabled={loading}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </AlertDialogTrigger>

      <AlertDialogContent className="sm:max-w-[400px] bg-white border border-slate-100 p-5 gap-4 rounded-xl shadow-lg">
        {/* Header với Badged Icon Red */}
        <AlertDialogHeader className="space-y-1">
          <div className="flex items-center gap-3 text-red-600 mb-1">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
              <Trash2 size={20} />
            </div>
            <div>
              <AlertDialogTitle className="font-semibold text-slate-800 text-sm">
                Xác nhận xóa sản phẩm
              </AlertDialogTitle>
              <p className="text-xs text-slate-500">
                Hành động này không thể hoàn tác.
              </p>
            </div>
          </div>
        </AlertDialogHeader>

        {/* Nội dung chi tiết */}
        <AlertDialogDescription asChild className="text-xs text-slate-600">
          <div>
            <p className="leading-relaxed">
              Bạn có chắc chắn muốn xóa sản phẩm{" "}
              <strong className="text-slate-800 font-semibold">
                &quot;{name || "Sản phẩm không tên"}&quot;
              </strong>{" "}
              khỏi danh mục hệ thống không?
            </p>
          </div>
        </AlertDialogDescription>

        {/* Action Buttons */}
        <AlertDialogFooter className="flex items-center justify-end gap-2 pt-1">
          <AlertDialogCancel
            disabled={loading}
            className="px-3.5 py-1.5 h-auto text-xs font-medium text-slate-600 border-none bg-transparent hover:bg-slate-100 rounded-lg transition-colors m-0"
          >
            Hủy
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={loading}
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            className={cn(
              buttonVariants({ variant: "destructive" }),
              "inline-flex items-center gap-1.5 px-3.5 py-1.5 h-auto text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50 transition-colors shadow-sm",
            )}
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Đang xóa...
              </>
            ) : (
              "Xóa vĩnh viễn"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
