"use client";

import { Prisma, type units } from "@/app/generated/prisma/client";
import type { ApiResponse, PaginationResult } from "@/lib/types/public/types";
import { useEffect, useState } from "react";

import { SearchBar, SectionHeader } from "@/app/admin/catalogs/page";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Ruler } from "lucide-react";
import { CreateUnitDialog } from "./CreateUnitDialog";
import { DeleteUnitDialog } from "./DeleteUnitDialog";
import { UpdateUnitDialog } from "./UpdateUnitDialog";

export type SpecKeyWithGroup = Prisma.spec_keysGetPayload<{
  include: { spec_groups: true };
}>;

const ROWS_PER_PAGE = 12; // Tăng số lượng item mỗi trang vì Card nhỏ gọn hơn Table

export function UnitsSection() {
  const [units, setUnits] = useState<units[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [keyword, setKeyword] = useState("");

  const [refreshToken, setRefreshToken] = useState(0);
  const refetch = () => setRefreshToken((prev) => prev + 1);

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
          `/api/catalogs/units?${queryParams.toString()}`,
        );
        const result: ApiResponse<PaginationResult<units>> = await res.json();

        if (!ignore && result.success && result.data) {
          setUnits(result.data.data);
          setTotalPages(result.data.totalPage);
        }
      } catch (error) {
        if (!ignore) {
          console.error("Lỗi khi fetch dữ liệu units:", error);
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

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Đơn vị thông số kỹ thuật"
        description="Tần số quét, Độ sáng, NFC, Chất liệu khung..."
        onAdd={() => setIsCreateOpen(true)}
        addLabel="Thêm đơn vị"
      />

      <CreateUnitDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={refetch}
      />

      {/* Thanh tìm kiếm */}
      <SearchBar
        placeholder="Tìm kiếm đơn vị thông số..."
        value={keyword}
        onChange={handleSearchChange}
      />

      {/* Khung chứa Card Grid */}
      <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm min-h-[320px] flex flex-col justify-between gap-4">
        {isLoading ? (
          /* State 1: Đang tải dữ liệu */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {Array.from({ length: ROWS_PER_PAGE }).map((_, i) => (
              <Skeleton key={i} className="h-[96px] w-full rounded-xl" />
            ))}
          </div>
        ) : units.length === 0 ? (
          /* State 2: Không có dữ liệu */
          <div className="flex flex-col items-center justify-center py-12 text-center my-auto">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
              <Ruler size={18} />
            </div>
            <p className="text-sm font-medium text-slate-500">
              {keyword
                ? `Không tìm thấy đơn vị nào khớp với "${keyword}".`
                : "Chưa có đơn vị tính nào."}
            </p>
          </div>
        ) : (
          /* State 3: Danh sách Card */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {units.map((item) => (
              <Card
                key={item.id}
                className="group relative overflow-hidden border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all bg-white shadow-none rounded-lg"
              >
                <CardContent className="p-2 flex flex-col justify-between gap-1">
                  {/* Hàng 1: ID - Tên đơn vị - Badge (Nằm chung 1 hàng) */}
                  <div className="flex items-center justify-between gap-1.5 min-w-0">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-[10px] font-bold text-slate-400 shrink-0">
                        #{item.id}
                      </span>
                      <span
                        className="font-bold text-slate-900 text-xs truncate"
                        title={item.name}
                      >
                        {item.name}
                      </span>
                    </div>

                    <Badge
                      variant="secondary"
                      className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-[10px] px-1.5 py-0 rounded shrink-0"
                    >
                      {item.symbol || "N/A"}
                    </Badge>
                  </div>

                  {/* Hàng 2: Nút thao tác (Giảm margin/padding) */}
                  <div className="flex items-center justify-end gap-1 pt-1 border-t border-slate-100/80">
                    <UpdateUnitDialog unit={item} onSuccess={refetch} />
                    <DeleteUnitDialog
                      id={item.id}
                      name={item.name}
                      onDeleted={refetch}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Thanh Phân trang */}
        <div className="flex justify-end items-center pt-3 border-t border-slate-100 min-h-[44px]">
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
              <strong className="text-slate-600">{units.length}</strong> Đơn vị
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
