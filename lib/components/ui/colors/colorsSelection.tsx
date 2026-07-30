"use client";

import type { colors } from "@/app/generated/prisma/client";
import type { ApiResponse, PaginationResult } from "@/lib/types/public/types";
import { useEffect, useState } from "react";

import { SearchBar, SectionHeader } from "@/app/admin/catalogs/page";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { CreateColorDialog } from "./CreateColorDialog";
import { DeleteColorDialog } from "./DeleteColorDialog";
import { UpdateColorDialog } from "./UpdateColorDialog";

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

export function ColorsSection() {
  const [colors, setColors] = useState<colors[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // State quản lý từ khóa tìm kiếm
  const [keyword, setKeyword] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Trigger refetch thủ công sau khi Thêm/Sửa/Xóa thành công
  const [refreshToken, setRefreshToken] = useState(0);
  const refetch = () => setRefreshToken((prev) => prev + 1);

  // Effect đảm nhận Fetching, Debounce 400ms và Tránh Race Condition
  useEffect(() => {
    let ignore = false;

    const timer = setTimeout(async () => {
      try {
        setIsLoading(true);

        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: ROWS_PER_PAGE.toString(),
        });

        if (keyword.trim()) {
          queryParams.append("keyword", keyword.trim());
        }

        const res = await fetch(
          `/api/catalogs/colors?${queryParams.toString()}`,
        );
        const result: ApiResponse<PaginationResult<colors>> = await res.json();

        if (!ignore && result.success && result.data) {
          setColors(result.data.data);
          setTotalPages(result.data.totalPage);
        }
      } catch (error) {
        if (!ignore) {
          console.error("Lỗi khi fetch dữ liệu colors:", error);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }, 300);

    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [page, keyword, refreshToken]);

  // Đổi từ khóa tìm kiếm -> reset trang về 1
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value);
    setPage(1);
  };

  const emptyRowsCount = Math.max(0, ROWS_PER_PAGE - colors.length);

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Màu sắc"
        description="Quản lý các màu sắc điện thoại được bán tại cửa hàng"
        onAdd={() => setIsCreateOpen(true)}
        addLabel="Thêm màu sắc"
      />

      <CreateColorDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={refetch}
      />

      {/* Thanh tìm kiếm đã gắn đầy đủ Props */}
      <SearchBar
        placeholder="Tìm kiếm màu sắc theo tên..."
        value={keyword}
        onChange={handleSearchChange}
      />

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
                  style={{ width: 70 }}
                >
                  ID
                </th>
                <th
                  className={`${th} text-left font-semibold text-slate-600 px-4 py-3`}
                  style={{ width: 70 }}
                >
                  Mẫu màu
                </th>
                <th
                  className={`${th} text-left font-semibold text-slate-600 px-4 py-3`}
                >
                  Tên màu
                </th>
                <th
                  className={`${th} text-left font-semibold text-slate-600 px-4 py-3`}
                >
                  Mã màu
                </th>
                <th
                  className={`${th} text-left font-semibold text-slate-600 px-4 py-3`}
                >
                  Mô tả
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
              ) : colors.length === 0 ? (
                <tr style={{ height: ROW_HEIGHT * ROWS_PER_PAGE }}>
                  <td colSpan={6} className="text-center text-slate-400 py-8">
                    {keyword
                      ? `Không tìm thấy màu sắc nào khớp với "${keyword}".`
                      : "Không có màu sắc nào."}
                  </td>
                </tr>
              ) : (
                <>
                  {colors.map((color) => (
                    <tr
                      key={color.id}
                      className={`${tr} border-b border-slate-50/80 hover:bg-slate-50/50 transition-colors`}
                      style={{ height: ROW_HEIGHT }}
                    >
                      <td className={`${td} text-slate-400 px-4 py-2`}>
                        #{color.id}
                      </td>
                      <td className={`${td} px-4 py-2`}>
                        <div className="flex items-center">
                          <div
                            className="w-8 h-8 rounded-lg border border-slate-100 shadow-sm"
                            style={{
                              backgroundColor: color.hex_code || "#e2e8f0",
                            }}
                            title={color.hex_code ?? undefined}
                          />
                        </div>
                      </td>
                      <td
                        className={`${td} font-medium text-slate-800 px-4 py-2 truncate`}
                      >
                        {color.name}
                      </td>
                      <td className={`${td} px-4 py-2`}>
                        <code className="text-[11px] font-mono text-blue-600 bg-blue-50/60 px-2 py-0.5 rounded border border-blue-100/40">
                          {color.hex_code}
                        </code>
                      </td>
                      <td
                        className={`${td} text-slate-500 px-4 py-2 truncate max-w-[200px]`}
                      >
                        {color.description || (
                          <span className="text-slate-300 italic text-xs">
                            Chưa có mô tả
                          </span>
                        )}
                      </td>
                      <td className={`${td} text-right px-4 py-2`}>
                        <div className="flex items-center justify-end gap-1.5">
                          <UpdateColorDialog
                            color={color}
                            onSuccess={refetch}
                          />
                          <DeleteColorDialog
                            hexCode={color.hex_code}
                            colorName={color.name}
                            onDeleted={refetch}
                          />
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

        {/* Dynamic Pagination */}
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
              <strong className="text-slate-600">{colors.length}</strong> màu
              sắc
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
