"use client";

import type { spec_groups } from "@/app/generated/prisma/client";
import type { ApiResponse } from "@/lib/types/public/types";
import { Layers, Loader2, Pencil, X } from "lucide-react";
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

  // Cập nhật state trực tiếp khi phát hiện props thay đổi (Tránh useEffect)
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
      <div className="w-full max-w-[440px] bg-white rounded-xl shadow-lg border border-slate-100 p-5 space-y-4">
        {/* Header Section */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-slate-700">
              {isEdit ? <Pencil size={18} /> : <Layers size={18} />}
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-sm">
                {isEdit ? "Cập nhật nhóm thông số" : "Thêm mới nhóm thông số"}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isEdit
                  ? "Chỉnh sửa thông tin nhóm thông số kỹ thuật hiện tại."
                  : "Tạo nhóm thông số kỹ thuật mới cho danh mục sản phẩm."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <div className="p-2.5 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg">
              {errorMessage}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700">
              Tên nhóm thông số <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="VD: Màn hình, Cấu hình, Kết nối..."
              autoFocus
              disabled={isPending}
              className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 placeholder:text-slate-400 transition-all disabled:opacity-50"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg disabled:opacity-50 transition-colors shadow-sm"
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
