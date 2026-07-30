"use client";

import type { ApiResponse, PaginationResult } from "@/lib/types/public/types";
import { Pencil, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { SearchBar, SectionHeader } from "@/app/admin/catalogs/page";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { CldImage } from "next-cloudinary";
import { CreateSeriesDialog } from "./CreateSeriesDialog";
import { DeleteSerieDialog } from "./DeleteSeriesDialog";
import { UpdateSerieDialog } from "./UpdateSeriesDialog";

// ===== Type Definition =====
export type SerieWithBrand = {
  id: number;
  brand_id: number;
  name: string;
  slug: string;
  release_year: number;
  brands: {
    id: number;
    name: string;
    slug: string;
    logo: string | null;
    description: string | null;
  };
};

// ===== Styles =====
const cardWrap =
  "flex flex-col rounded-lg border border-slate-100 overflow-hidden";
const tableScroll = "overflow-x-auto";
const thead = "bg-slate-50 border-b border-slate-100 text-slate-600";
const th = "px-4 py-3 text-left font-semibold";
const thRight = "px-4 py-3 text-right font-semibold";
const tbody = "divide-y divide-slate-100";
const tr = "hover:bg-slate-50/50 transition-colors";
const td = "px-4 py-3 text-slate-600 align-middle";

const ROWS_PER_PAGE = 6;
const ROW_HEIGHT = 57;

export function SeriesSection() {
  const [seriesList, setSeriesList] = useState<SerieWithBrand[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");

  // ===== Dialog States =====
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSerie, setEditingSerie] = useState<SerieWithBrand | null>(null);
  const [deletingSerie, setDeletingSerie] = useState<SerieWithBrand | null>(
    null,
  );

  // 1. Dùng useCallback để bọc hàm fetch API (dùng cho onSuccess của các Dialog)
  const fetchSeries = useCallback(async () => {
    try {
      setIsLoading(true);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: ROWS_PER_PAGE.toString(),
      });

      if (searchKeyword.trim()) {
        params.append("keyword", searchKeyword.trim());
      }

      const res = await fetch(`/api/catalogs/series?${params.toString()}`);
      const result: ApiResponse<PaginationResult<SerieWithBrand>> =
        await res.json();

      if (result.success && result.data) {
        setSeriesList(result.data.data);
        setTotalPages(result.data.totalPage);
      }
    } catch (error) {
      console.error("Lỗi khi fetch dữ liệu series:", error);
    } finally {
      setIsLoading(false);
    }
  }, [page, searchKeyword]);

  // 2. Một Effect duy nhất xử lý cả Debounce & Fetch Data (Giống hệt BrandsSection)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSeries();
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchSeries]);

  // Handle khi đổi từ khóa thì về trang 1
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(e.target.value);
    setPage(1);
  };

  const emptyRowsCount = Math.max(0, ROWS_PER_PAGE - seriesList.length);

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Dòng sản phẩm (Series)"
        description="Quản lý các dòng sản phẩm thuộc thương hiệu"
        onAdd={() => setIsCreateOpen(true)}
        addLabel="Thêm dòng sản phẩm"
      />

      <SearchBar
        placeholder="Tìm kiếm dòng sản phẩm..."
        value={searchKeyword}
        onChange={handleSearchChange}
      />

      {/* Khung cố định bảng 6 dòng */}
      <div
        className={`${cardWrap} flex flex-col justify-between overflow-hidden rounded-xl border border-slate-100 shadow-sm bg-white`}
      >
        <div className={`${tableScroll} flex-1 overflow-x-auto`}>
          <table className="w-full text-sm table-fixed border-collapse">
            <thead
              className={`${thead} bg-slate-50/70 border-b border-slate-100`}
            >
              <tr>
                <th
                  className={`${th} text-left font-semibold text-slate-600 px-4 py-3`}
                  style={{ width: 60 }}
                >
                  ID
                </th>
                <th
                  className={`${th} text-left font-semibold text-slate-600 px-4 py-3`}
                >
                  Tên Serie
                </th>
                <th
                  className={`${th} text-left font-semibold text-slate-600 px-4 py-3`}
                >
                  Thương hiệu
                </th>
                <th
                  className={`${th} text-left font-semibold text-slate-600 px-4 py-3`}
                >
                  Slug
                </th>
                <th
                  className={`${th} text-left font-semibold text-slate-600 px-4 py-3`}
                  style={{ width: 110 }}
                >
                  Năm ra mắt
                </th>
                <th
                  className={`${thRight} text-right font-semibold text-slate-600 px-4 py-3`}
                  style={{ width: 120 }}
                >
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className={tbody}>
              {isLoading ? (
                <tr style={{ height: ROW_HEIGHT * ROWS_PER_PAGE }}>
                  <td colSpan={6} className="text-center text-slate-400 py-8">
                    <div className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
                      Đang tải dữ liệu...
                    </div>
                  </td>
                </tr>
              ) : seriesList.length === 0 ? (
                <tr style={{ height: ROW_HEIGHT * ROWS_PER_PAGE }}>
                  <td colSpan={6} className="text-center text-slate-400 py-8">
                    Không tìm thấy dòng sản phẩm nào.
                  </td>
                </tr>
              ) : (
                <>
                  {seriesList.map((item) => (
                    <tr
                      key={item.id}
                      className={`${tr} border-b border-slate-50/80 hover:bg-slate-50/50 transition-colors`}
                      style={{ height: ROW_HEIGHT }}
                    >
                      <td className={`${td} text-slate-400 px-4 py-2`}>
                        #{item.id}
                      </td>
                      <td
                        className={`${td} font-medium text-slate-800 px-4 py-2 truncate`}
                      >
                        {item.name}
                      </td>
                      <td className={`${td} px-4 py-2`}>
                        <div className="flex items-center gap-2">
                          {item.brands?.logo ? (
                            <CldImage
                              src={item.brands.logo}
                              alt={item.brands.name}
                              width={24}
                              height={24}
                              crop="pad"
                              className="w-6 h-6 rounded object-contain bg-slate-50 border border-slate-100 p-0.5"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-[10px] font-semibold text-slate-500 border border-slate-100 uppercase">
                              {item.brands?.name?.[0] || "B"}
                            </div>
                          )}
                          <span className="font-medium text-slate-700 truncate">
                            {item.brands?.name || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className={`${td} px-4 py-2`}>
                        <code className="text-[11px] font-mono text-blue-600 bg-blue-50/60 px-2 py-0.5 rounded border border-blue-100/40">
                          {item.slug}
                        </code>
                      </td>
                      <td className={`${td} text-slate-600 px-4 py-2`}>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                          {item.release_year}
                        </span>
                      </td>
                      <td className={`${td} text-right px-4 py-2`}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setEditingSerie(item)}
                            title="Chỉnh sửa"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setDeletingSerie(item)}
                            title="Xóa"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {Array.from({ length: emptyRowsCount }).map((_, i) => (
                    <tr
                      key={`empty-${i}`}
                      className="border-b border-transparent"
                      style={{ height: ROW_HEIGHT }}
                    >
                      <td colSpan={6} className="px-4 py-2">
                        &nbsp;
                      </td>
                    </tr>
                  ))}
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* Phân trang */}
        <div className="flex justify-end items-center px-4 py-3 border-t border-slate-100 bg-slate-50/30 min-h-[52px]">
          {totalPages > 1 ? (
            <Pagination className="mx-0 w-auto">
              <PaginationContent className="gap-1">
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (page > 1) setPage(page - 1);
                    }}
                    className={`h-8 px-2 text-xs border border-slate-200 shadow-sm ${
                      page === 1
                        ? "pointer-events-none opacity-40 bg-slate-50"
                        : "cursor-pointer bg-white hover:bg-slate-50"
                    }`}
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }).map((_, index) => {
                  const pageNumber = index + 1;
                  return (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        href="#"
                        isActive={page === pageNumber}
                        onClick={(e) => {
                          e.preventDefault();
                          setPage(pageNumber);
                        }}
                        className={`w-8 h-8 text-xs border shadow-sm cursor-pointer flex items-center justify-center rounded-md transition-all ${
                          page === pageNumber
                            ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700 shadow-blue-100"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (page < totalPages) setPage(page + 1);
                    }}
                    className={`h-8 px-2 text-xs border border-slate-200 shadow-sm ${
                      page === totalPages
                        ? "pointer-events-none opacity-40 bg-slate-50"
                        : "cursor-pointer bg-white hover:bg-slate-50"
                    }`}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          ) : (
            <span className="text-xs font-medium text-slate-400 bg-slate-100/80 px-2 py-1 rounded">
              Tổng số:{" "}
              <strong className="text-slate-600">{seriesList.length}</strong>{" "}
              dòng sản phẩm
            </span>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <CreateSeriesDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={fetchSeries}
      />

      <UpdateSerieDialog
        serie={editingSerie}
        open={!!editingSerie}
        onOpenChange={(open) => {
          if (!open) setEditingSerie(null);
        }}
        onSuccess={fetchSeries}
      />

      <DeleteSerieDialog
        serie={deletingSerie}
        open={!!deletingSerie}
        onOpenChange={(open) => {
          if (!open) setDeletingSerie(null);
        }}
        onSuccess={fetchSeries}
      />
    </div>
  );
}
