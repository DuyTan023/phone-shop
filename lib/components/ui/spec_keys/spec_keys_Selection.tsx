"use client";

import { Prisma } from "@/app/generated/prisma/client";
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
import { CreateSpecKeyDialog } from "./CreateSpecKeyDialog";
import { DeleteSpecKeyDialog } from "./DeleteSpecKeyDialog";
import { UpdateSpecKeyDialog } from "./UpdateSpecKeyDialog";

export type SpecKeyWithGroup = Prisma.spec_keysGetPayload<{
  include: { spec_groups: true };
}>;

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

export function SpecKeysSection() {
  const [specKeys, setSpecKeys] = useState<SpecKeyWithGroup[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // 1. Quản lý từ khóa tìm kiếm
  const [keyword, setKeyword] = useState("");

  // 2. Token để kích hoạt refetch sau khi Tạo / Sửa / Xóa thành công
  const [refreshToken, setRefreshToken] = useState(0);
  const refetch = () => setRefreshToken((prev) => prev + 1);

  // 3. Effect đảm nhận Fetching, Debounce 400ms và Tránh Race Condition
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
          `/api/catalogs/spec_keys?${queryParams.toString()}`,
        );
        const result: ApiResponse<PaginationResult<SpecKeyWithGroup>> =
          await res.json();

        if (!ignore && result.success && result.data) {
          setSpecKeys(result.data.data);
          setTotalPages(result.data.totalPage);
        }
      } catch (error) {
        if (!ignore) {
          console.error("Lỗi khi fetch dữ liệu spec keys:", error);
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

  // Handle thay đổi từ khóa tìm kiếm -> reset trang về 1
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value);
    setPage(1);
  };

  const emptyRowsCount = Math.max(0, ROWS_PER_PAGE - specKeys.length);

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Tên thông số kỹ thuật"
        description="Tần số quét, Độ sáng, NFC, Chất liệu khung..."
        onAdd={() => setIsCreateOpen(true)}
        addLabel="Thêm thông số"
      />

      <CreateSpecKeyDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={refetch}
      />

      {/* Thanh tìm kiếm đã gán keyword đầy đủ */}
      <SearchBar
        placeholder="Tìm kiếm thông số kỹ thuật..."
        value={keyword}
        onChange={handleSearchChange}
      />

      {/* Khung cố định 6 dòng */}
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
                  style={{ width: 160 }}
                >
                  Nhóm
                </th>
                <th
                  className={`${th} text-left font-semibold text-slate-600 px-4 py-3`}
                >
                  Tên thông số
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
                  <td colSpan={4} className="text-center text-slate-400 py-8">
                    <div className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
                      Đang tải dữ liệu...
                    </div>
                  </td>
                </tr>
              ) : specKeys.length === 0 ? (
                <tr style={{ height: ROW_HEIGHT * ROWS_PER_PAGE }}>
                  <td colSpan={4} className="text-center text-slate-400 py-8">
                    {keyword
                      ? `Không tìm thấy thông số nào khớp với "${keyword}".`
                      : "Không tìm thấy thông số kỹ thuật nào."}
                  </td>
                </tr>
              ) : (
                <>
                  {specKeys.map((item) => (
                    <tr
                      key={item.id}
                      className={`${tr} border-b border-slate-50/80 hover:bg-slate-50/50 transition-colors`}
                      style={{ height: ROW_HEIGHT }}
                    >
                      <td className={`${td} text-slate-400 px-4 py-2`}>
                        #{item.id}
                      </td>
                      <td className={`${td} px-4 py-2`}>
                        <span className="text-xs font-medium text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100">
                          {item.spec_groups?.name || `Nhóm ${item.group_id}`}
                        </span>
                      </td>
                      <td
                        className={`${td} font-medium text-slate-800 px-4 py-2 truncate`}
                      >
                        {item.name}
                      </td>
                      <td className={`${td} text-right px-4 py-2`}>
                        <div className="flex items-center justify-end gap-1.5">
                          <UpdateSpecKeyDialog
                            specKey={item}
                            onSuccess={refetch}
                          />

                          <DeleteSpecKeyDialog
                            id={item.id}
                            name={item.name}
                            onDeleted={refetch}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}

                  {/* Dòng trống giữ khung cố định */}
                  {Array.from({ length: emptyRowsCount }).map((_, i) => (
                    <tr
                      key={`empty-${i}`}
                      className="border-b border-transparent"
                      style={{ height: ROW_HEIGHT }}
                    >
                      <td colSpan={4} className="px-4 py-2">
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
              <strong className="text-slate-600">{specKeys.length}</strong>{" "}
              thông số
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
