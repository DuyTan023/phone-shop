"use client";

import type { spec_groups } from "@/app/generated/prisma/client";
import type { ApiResponse } from "@/lib/types/public/types";
import { Loader2 } from "lucide-react";
import { useState, useTransition } from "react";

const API_URL = "/api/catalogs/spec_groups";

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: spec_groups | null;
  onSuccess: () => void;
}

export function SpecGroupFormModal({
  isOpen,
  onClose,
  initialData,
  onSuccess,
}: FormModalProps) {
  const [name, setName] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Pattern của React: Cập nhật state trực tiếp khi phát hiện props thay đổi
  // Giúp loại bỏ hoàn toàn useEffect và tránh lỗi cascading renders
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  const [prevInitialData, setPrevInitialData] = useState(initialData);

  if (isOpen !== prevIsOpen || initialData !== prevInitialData) {
    setPrevIsOpen(isOpen);
    setPrevInitialData(initialData);
    if (isOpen) {
      setName(initialData ? initialData.name : "");
      setErrorMessage(null);
    }
  }

  if (!isOpen) return null;

  const isEdit = !!initialData;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setErrorMessage("Tên nhóm thông số không được bỏ trống");
      return;
    }

    startTransition(async () => {
      try {
        const url = isEdit ? `${API_URL}/${initialData.id}` : API_URL;
        const method = isEdit ? "PUT" : "POST";

        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: trimmedName }),
        });

        const result: ApiResponse<spec_groups> = await res.json();

        if (res.ok && result.success) {
          onSuccess();
          onClose();
        } else {
          setErrorMessage(result.message || "Có lỗi xảy ra, vui lòng thử lại");
        }
      } catch (err) {
        setErrorMessage("Lỗi kết nối máy chủ");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">
            {isEdit ? "Cập nhật nhóm thông số" : "Thêm mới nhóm thông số"}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMessage && (
            <div className="p-3 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg">
              {errorMessage}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700">
              Tên nhóm thông số *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Màn hình, Cấu hình..."
              autoFocus
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg disabled:opacity-50 transition-colors shadow-sm"
            >
              {isPending && <Loader2 size={14} className="animate-spin" />}
              {isEdit ? "Lưu thay đổi" : "Tạo mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
