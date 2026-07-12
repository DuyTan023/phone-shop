"use client";

import type { brands } from "@/app/generated/prisma/client";
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
import { CldImage } from "next-cloudinary";
import { CreateBrandDialog } from "./CreateBrandDialog";
import { DeleteBrandDialog } from "./DeleteBrandDialog";
import { UpdateBrandDialog } from "./UpdateBrandDialog";

// ===== Styles =====
const cardWrap =
  "flex flex-col rounded-lg border border-slate-100 overflow-hidden"; // khung tổng, giữ ngang tự nhiên theo container cha
const tableScroll = "overflow-x-auto";
const thead = "bg-slate-50 border-b border-slate-100 text-slate-600";
const th = "px-4 py-3 text-left font-semibold";
const thRight = "px-4 py-3 text-right font-semibold";
const tbody = "divide-y divide-slate-100";
const tr = "hover:bg-slate-50/50 transition-colors";
const td = "px-4 py-3 text-slate-600 align-middle";

const ROWS_PER_PAGE = 6; // 6 dòng / trang cố định
const ROW_HEIGHT = 57; // px, ước lượng chiều cao mỗi hàng (padding + line-height), chỉnh nếu cần

export function BrandsSection() {
  const [brands, setBrands] = useState<brands[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const fetchBrands = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(
        `/api/catalogs/brands?page=${page}&limit=${ROWS_PER_PAGE}`,
      );
      const result: ApiResponse<PaginationResult<brands>> = await res.json();

      if (result.success && result.data) {
        setBrands(result.data.data);
        setTotalPages(result.data.totalPage);
      }
    } catch (error) {
      console.error("Lỗi khi fetch dữ liệu brands:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. useEffect chỉ làm nhiệm vụ tự động gọi lại hàm mỗi khi biến 'page' thay đổi
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchBrands();
  }, [page]);

  // Số dòng trống cần thêm để bảng luôn cao đúng 6 dòng (tránh khung bị co giãn)
  const emptyRowsCount = Math.max(0, ROWS_PER_PAGE - brands.length);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Thương hiệu"
        description="Quản lý các hãng điện thoại được bán tại cửa hàng"
        onAdd={() => setIsCreateOpen(true)} // Mở Dialog khi click nút
        addLabel="Thêm thương hiệu"
      />

      <CreateBrandDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={fetchBrands} // Refresh lại danh sách Table sau khi thêm thành công
      />

      <SearchBar placeholder="Tìm kiếm thương hiệu..." />

      {/* Khung cố định: bảng luôn hiển thị đúng 6 dòng, pagination neo góc phải dưới */}
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
                  Logo
                </th>
                <th
                  className={`${th} text-left font-semibold text-slate-600 px-4 py-3`}
                >
                  Tên thương hiệu
                </th>
                <th
                  className={`${th} text-left font-semibold text-slate-600 px-4 py-3`}
                >
                  Slug
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
              ) : brands.length === 0 ? (
                <tr style={{ height: ROW_HEIGHT * ROWS_PER_PAGE }}>
                  <td colSpan={6} className="text-center text-slate-400 py-8">
                    Không tìm thấy thương hiệu nào.
                  </td>
                </tr>
              ) : (
                <>
                  {brands.map((brand) => (
                    <tr
                      key={brand.id}
                      className={`${tr} border-b border-slate-50/80 hover:bg-slate-50/50 transition-colors`}
                      style={{ height: ROW_HEIGHT }}
                    >
                      <td className={`${td} text-slate-400 px-4 py-2`}>
                        #{brand.id}
                      </td>
                      <td className={`${td} px-4 py-2`}>
                        <div className="flex items-center">
                          {brand.logo ? (
                            <CldImage
                              src={brand.logo}
                              alt={brand.name}
                              width={32} // Chỉnh width bằng kích thước hiển thị thực tế w-8 (32px)
                              height={32} // Chỉnh height bằng kích thước hiển thị thực tế h-8 (32px)
                              crop="pad"
                              className="w-8 h-8 rounded-lg object-contain bg-slate-50 border border-slate-100 p-0.5"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-500 border border-slate-100 uppercase">
                              {brand.name[0]}
                            </div>
                          )}
                        </div>
                      </td>
                      <td
                        className={`${td} font-medium text-slate-800 px-4 py-2 truncate`}
                      >
                        {brand.name}
                      </td>
                      <td className={`${td} px-4 py-2`}>
                        <code className="text-[11px] font-mono text-blue-600 bg-blue-50/60 px-2 py-0.5 rounded border border-blue-100/40">
                          {brand.slug}
                        </code>
                      </td>
                      <td
                        className={`${td} text-slate-500 px-4 py-2 truncate max-w-[200px]`}
                      >
                        {brand.description || (
                          <span className="text-slate-300 italic text-xs">
                            Chưa có mô tả
                          </span>
                        )}
                      </td>
                      <td className={`${td} text-right px-4 py-2`}>
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Chức năng cập nhật brand*/}
                          <UpdateBrandDialog
                            brand={brand}
                            onSuccess={fetchBrands} // Hàm load lại data của bạn sau khi update thành công
                          />

                          {/* Chức năng xóa brand*/}
                          <DeleteBrandDialog
                            slug={brand.slug}
                            brandName={brand.name}
                            onDeleted={fetchBrands}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}

                  {/* Dòng trống để giữ khung luôn đúng 6 dòng, không bị co lại */}
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

        {/* Pagination cố định góc phải dưới của khung */}
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
              <strong className="text-slate-600">{brands.length}</strong> thương
              hiệu
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
