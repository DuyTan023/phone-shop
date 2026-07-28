"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SerieWithBrand } from "@/lib/repositories/catalogs/series.repository";
import { Edit3, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface BrandOption {
  id: string | number;
  name: string;
}

export interface UpdateSerieDialogProps {
  serie: SerieWithBrand | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void | Promise<void>;
}

// Helper chuyển đổi Tiếng Việt có dấu thành slug
function convertToSlug(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/([^0-9a-z-\s])/g, "")
    .replace(/(\s+)/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function UpdateSerieDialog({
  serie,
  open,
  onOpenChange,
  onSuccess,
}: UpdateSerieDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Danh sách thương hiệu
  const [brands, setBrands] = useState<BrandOption[]>([]);
  const [isLoadingBrands, setIsLoadingBrands] = useState(false);

  // State các trường thông tin
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [selectedBrandId, setSelectedBrandId] = useState<string>("");
  const [releaseYear, setReleaseYear] = useState<number>(
    new Date().getFullYear(),
  );
  const [description, setDescription] = useState("");
  const [isSlugEdited, setIsSlugEdited] = useState(false);

  // Sync dữ liệu ban đầu từ prop `serie`
  const [prevIsOpen, setPrevIsOpen] = useState(open);
  if (open !== prevIsOpen) {
    setPrevIsOpen(open);
    if (open && serie) {
      setName(serie.name || "");
      setSlug(serie.slug || "");
      setSelectedBrandId(String(serie.brand_id || serie.brands?.id || ""));
      setReleaseYear(serie.release_year || new Date().getFullYear());
      setIsSlugEdited(true); // Giữ slug cũ, không tự sinh trừ khi người dùng tự xóa
      setErrorMessage(null);
    } else if (!open) {
      setIsLoading(false);
      setErrorMessage(null);
    }
  }

  // Fetch danh sách thương hiệu khi mở Dialog
  useEffect(() => {
    if (!open) return;

    let isMounted = true;
    async function fetchBrands() {
      try {
        setIsLoadingBrands(true);
        const res = await fetch("/api/catalogs/brands?limit=100");
        const result = await res.json();

        if (isMounted && result.success && result.data) {
          const brandData = Array.isArray(result.data)
            ? result.data
            : result.data.data || [];
          setBrands(brandData);
        }
      } catch (err) {
        console.error("Lỗi khi tải danh sách thương hiệu:", err);
      } finally {
        if (isMounted) setIsLoadingBrands(false);
      }
    }

    fetchBrands();
    return () => {
      isMounted = false;
    };
  }, [open]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nameValue = e.target.value;
    setName(nameValue);
    if (!isSlugEdited) {
      setSlug(convertToSlug(nameValue));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlug(e.target.value);
    setIsSlugEdited(true);
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!serie?.id) return;

    setErrorMessage(null);

    if (!selectedBrandId) {
      setErrorMessage("Vui lòng chọn Thương hiệu cho dòng sản phẩm");
      return;
    }

    setIsLoading(true);

    const payload = {
      name: name.trim(),
      slug: slug.trim(),
      brand_id: Number(selectedBrandId),
      release_year: Number(releaseYear),
      description: description.trim() || null,
    };

    try {
      const response = await fetch(`/api/catalogs/series/${serie.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        onOpenChange(false);
        if (onSuccess) await onSuccess();
      } else {
        setErrorMessage(
          result.message || "Không thể cập nhật dòng sản phẩm này",
        );
      }
    } catch (err) {
      setErrorMessage("Lỗi kết nối hệ thống khi gửi yêu cầu cập nhật");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px] bg-white border border-slate-100 p-6 gap-4 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader className="space-y-1">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-slate-700">
                <Edit3 size={18} />
              </div>
              <div>
                <DialogTitle className="font-semibold text-slate-800 text-sm">
                  Cập nhật dòng sản phẩm
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  Chỉnh sửa các thông tin chi tiết của dòng sản phẩm.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Form Fields Container */}
          <div className="space-y-3.5 pt-1">
            {/* Field: Chọn Thương hiệu */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-700">
                Thương hiệu <span className="text-red-500">*</span>
              </Label>
              <Select
                value={selectedBrandId}
                onValueChange={setSelectedBrandId}
                disabled={isLoadingBrands || isLoading}
              >
                <SelectTrigger className="w-full h-9 px-3 text-xs border-slate-200 bg-white focus:ring-1 focus:ring-slate-400 focus:border-slate-400 rounded-lg shadow-sm">
                  <SelectValue placeholder="-- Chọn thương hiệu --" />
                </SelectTrigger>
                {/* Fix triệt để lỗi bị z-index đè và lệch layout */}
                <SelectContent
                  position="popper"
                  className="w-[var(--radix-select-trigger-width)] max-h-60 bg-white border border-slate-200 shadow-lg rounded-lg z-50 p-1"
                >
                  {isLoadingBrands ? (
                    <div className="flex items-center justify-center p-3 text-xs text-slate-400 gap-2">
                      <Loader2
                        size={14}
                        className="animate-spin text-slate-500"
                      />{" "}
                      Đang tải thương hiệu...
                    </div>
                  ) : brands.length === 0 ? (
                    <div className="p-3 text-xs text-slate-400 text-center">
                      Chưa có thương hiệu nào
                    </div>
                  ) : (
                    brands.map((brand) => (
                      <SelectItem
                        key={String(brand.id)}
                        value={String(brand.id)}
                        className="text-xs py-2 px-2.5 rounded-md focus:bg-slate-100 cursor-pointer text-slate-700"
                      >
                        {brand.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Field: Tên Serie */}
            <div className="space-y-1.5">
              <Label
                htmlFor="update-serie-name"
                className="text-xs font-medium text-slate-700"
              >
                Tên Serie <span className="text-red-500">*</span>
              </Label>
              <Input
                id="update-serie-name"
                name="name"
                value={name}
                onChange={handleNameChange}
                placeholder="Ví dụ: iPhone 15 Series, Galaxy S..."
                required
                className="h-9 text-xs border-slate-200 focus-visible:ring-slate-400 rounded-lg placeholder:text-slate-400"
              />
            </div>

            {/* Field: Slug */}
            <div className="space-y-1.5">
              <Label
                htmlFor="update-serie-slug"
                className="text-xs font-medium text-slate-700"
              >
                Slug (Đường dẫn) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="update-serie-slug"
                name="slug"
                value={slug}
                onChange={handleSlugChange}
                placeholder="iphone-15-series"
                required
                className="h-9 text-xs border-slate-200 focus-visible:ring-slate-400 rounded-lg placeholder:text-slate-400"
              />
            </div>

            {/* Field: Năm ra mắt */}
            <div className="space-y-1.5">
              <Label
                htmlFor="update-serie-year"
                className="text-xs font-medium text-slate-700"
              >
                Năm ra mắt <span className="text-red-500">*</span>
              </Label>
              <Input
                id="update-serie-year"
                type="number"
                value={releaseYear}
                onChange={(e) => setReleaseYear(Number(e.target.value))}
                placeholder="Ví dụ: 2024"
                required
                className="h-9 text-xs border-slate-200 focus-visible:ring-slate-400 rounded-lg"
              />
            </div>

            {/* Hiển thị thông báo lỗi */}
            {errorMessage && (
              <div className="p-2.5 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg font-medium">
                {errorMessage}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="px-3.5 py-1.5 h-auto text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isLoading || isLoadingBrands}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 h-auto text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg disabled:opacity-50 transition-colors shadow-sm"
            >
              {isLoading && <Loader2 size={14} className="animate-spin" />}
              {isLoading ? "Đang lưu..." : "Cập nhật"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
