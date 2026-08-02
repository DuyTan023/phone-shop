"use client";

import type { products } from "@/app/generated/prisma/client";
import type { ApiResponse } from "@/lib/types/public/types";
import { Check, ChevronsUpDown, Loader2, PackageCheck, X } from "lucide-react";
import { useEffect, useState, useTransition } from "react";

const PRODUCTS_API_URL = "/api/product_manager/products";
const SERIES_URL = "/api/catalogs/series";

interface SeriesOption {
  id: number;
  name: string;
}

interface UpdateProductDialogProps {
  isOpen: boolean;
  product: products | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function UpdateProductDialog({
  isOpen,
  product,
  onClose,
  onSuccess,
}: UpdateProductDialogProps) {
  // -------------------------------------------------------------
  // BƯỚC 1: KHAI BÁO TẤT CẢ CÁC HOOK Ở TOP-LEVEL
  // -------------------------------------------------------------

  // State theo dõi product_id cũ để sync data ngay trong Render Pass
  const [prevProductId, setPrevProductId] = useState<number | null>(null);

  // Form State
  const [serieId, setSerieId] = useState<number | "">("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");

  // UI State
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Series Combobox State
  const [seriesList, setSeriesList] = useState<SeriesOption[]>([]);
  const [isComboboxOpen, setIsComboboxOpen] = useState(false);
  const [seriesSearch, setSeriesSearch] = useState("");
  const [isLoadingSeries, setIsLoadingSeries] = useState(false);

  // Synchronize state khi prop `product` thay đổi
  if (product && product.id !== prevProductId) {
    setPrevProductId(product.id);
    setSerieId(product.serie_id ?? "");
    setName(product.name ?? "");
    setSlug(product.slug ?? "");
    setDescription(product.description ?? "");
    setErrorMessage(null);
    setIsComboboxOpen(false);
    setSeriesSearch("");
  }

  // Fetch danh sách Series khi dialog mở
  useEffect(() => {
    if (!isOpen) return;

    const fetchSeries = async () => {
      setIsLoadingSeries(true);
      try {
        const res = await fetch(SERIES_URL);
        const result = await res.json();

        const list = Array.isArray(result?.data?.data)
          ? result.data.data
          : Array.isArray(result?.data)
            ? result.data
            : Array.isArray(result)
              ? result
              : [];

        setSeriesList(list);
      } catch (err) {
        console.error("Lỗi tải danh sách series:", err);
        setSeriesList([]);
      } finally {
        setIsLoadingSeries(false);
      }
    };

    fetchSeries();
  }, [isOpen]);

  // -------------------------------------------------------------
  // BƯỚC 2: RETURN ĐIỀU KIỆN (BẮT BUỘC ĐẶT NẰM DƯỚI CÁC HOOK)
  // -------------------------------------------------------------
  if (!isOpen || !product) return null;

  // -------------------------------------------------------------
  // BƯỚC 3: XỬ LÝ EVENT & RENDER JSX
  // -------------------------------------------------------------
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    if (errorMessage) setErrorMessage(null);

    // Tự động tạo slug từ tên
    const generatedSlug = value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[đĐ]/g, "d")
      .replace(/([^0-9a-z-\s])/g, "")
      .replace(/(\s+)/g, "-")
      .replace(/^-+|-+$/g, "");

    setSlug(generatedSlug);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (serieId === "") {
      setErrorMessage("Vui lòng chọn Series");
      return;
    }
    if (!name.trim()) {
      setErrorMessage("Tên sản phẩm không được bỏ trống");
      return;
    }
    if (!slug.trim()) {
      setErrorMessage("Slug không được bỏ trống");
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch(`${PRODUCTS_API_URL}/${product.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            serie_id: Number(serieId),
            name: name.trim(),
            slug: slug.trim(),
            description: description.trim(),
          }),
        });

        const result: ApiResponse<products> = await res.json();

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

  const filteredSeries = seriesList.filter((item) =>
    item.name.toLowerCase().includes(seriesSearch.toLowerCase()),
  );

  const selectedSeries = seriesList.find((item) => item.id === serieId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-[480px] bg-white rounded-xl shadow-lg border border-slate-100 p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-slate-700">
              <PackageCheck size={18} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-sm">
                Cập nhật sản phẩm
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Thay đổi thông tin chi tiết của sản phẩm.
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {errorMessage && (
            <div className="p-2.5 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg">
              {errorMessage}
            </div>
          )}

          {/* Field: Series Combobox */}
          <div className="space-y-1.5 relative">
            <label className="text-xs font-medium text-slate-700">
              Series <span className="text-red-500">*</span>
            </label>
            <div>
              <button
                type="button"
                disabled={isPending || isLoadingSeries}
                onClick={() => setIsComboboxOpen(!isComboboxOpen)}
                className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg flex items-center justify-between text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-400 disabled:opacity-50"
              >
                <span
                  className={
                    selectedSeries ? "text-slate-800" : "text-slate-400"
                  }
                >
                  {isLoadingSeries
                    ? "Đang tải series..."
                    : selectedSeries
                      ? selectedSeries.name
                      : "Chọn Series..."}
                </span>
                <ChevronsUpDown size={14} className="text-slate-400 shrink-0" />
              </button>

              {isComboboxOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsComboboxOpen(false)}
                  />
                  <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-md p-1 space-y-1 max-h-48 overflow-y-auto">
                    <input
                      type="text"
                      placeholder="Tìm series..."
                      value={seriesSearch}
                      onChange={(e) => setSeriesSearch(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border border-slate-100 rounded bg-slate-50 focus:outline-none focus:border-slate-300"
                    />
                    {filteredSeries.length === 0 ? (
                      <div className="px-2 py-2 text-xs text-slate-400 text-center">
                        Không tìm thấy series
                      </div>
                    ) : (
                      filteredSeries.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            setSerieId(item.id);
                            setIsComboboxOpen(false);
                            setSeriesSearch("");
                            if (errorMessage) setErrorMessage(null);
                          }}
                          className="flex items-center justify-between px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 rounded cursor-pointer"
                        >
                          <span>{item.name}</span>
                          {serieId === item.id && (
                            <Check size={14} className="text-slate-800" />
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Field: Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700">
              Tên sản phẩm <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              placeholder="VD: iPhone 15 Pro Max"
              disabled={isPending}
              className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 placeholder:text-slate-400 transition-all disabled:opacity-50"
            />
          </div>

          {/* Field: Slug */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700">
              Slug <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="VD: iphone-15-pro-max"
              disabled={isPending}
              className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 placeholder:text-slate-400 transition-all disabled:opacity-50"
            />
          </div>

          {/* Field: Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700">Mô tả</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả tóm tắt về sản phẩm..."
              rows={3}
              disabled={isPending}
              className="w-full p-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 placeholder:text-slate-400 transition-all disabled:opacity-50 resize-none"
            />
          </div>

          {/* Actions */}
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
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
