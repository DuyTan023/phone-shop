/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type { ProductWithSerie } from "@/lib/repositories/product/product.repository";
import type { ApiResponse, PaginationResult } from "@/lib/types/public/types";
import { CldImage } from "next-cloudinary";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreateProductDialog } from "@/lib/components/ui/product_manager/products/CreateProductDialog";
import { DeleteProductDialog } from "@/lib/components/ui/product_manager/products/DeleteProductDialog";
import { UpdateProductDialog } from "@/lib/components/ui/product_manager/products/UpdateProductDialog";
import {
  Cpu,
  Download,
  Eye,
  Layers,
  MoreHorizontal,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Smartphone,
  Trash2,
} from "lucide-react";

const ROWS_PER_PAGE = 6;
const ROW_HEIGHT = 64;

export default function ProductListPage() {
  const [products, setProducts] = useState<ProductWithSerie[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  // 1. Quản lý Modal Thêm mới
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // 2. Quản lý sản phẩm đang được chọn để Sửa
  const [editingProduct, setEditingProduct] = useState<ProductWithSerie | null>(
    null,
  );

  // 3. Quản lý sản phẩm đang chọn để Xóa
  const [deletingProduct, setDeletingProduct] =
    useState<ProductWithSerie | null>(null);

  // Trigger refetch thủ công
  const [refreshToken, setRefreshToken] = useState(0);
  const refetch = () => setRefreshToken((prev) => prev + 1);

  const handleSuccess = () => {
    refetch();
  };

  // Fetch Data với Debounce & Cleanup
  useEffect(() => {
    let ignore = false;

    const timer = setTimeout(async () => {
      try {
        setIsLoading(true);

        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: ROWS_PER_PAGE.toString(),
        });

        if (searchTerm.trim()) {
          queryParams.append("keyword", searchTerm.trim());
        }

        const res = await fetch(
          `/api/product_manager/products?${queryParams.toString()}`,
        );
        const result: ApiResponse<PaginationResult<ProductWithSerie>> =
          await res.json();

        if (!ignore && result.success && result.data) {
          setProducts(result.data.data);
          setTotalPages(result.data.totalPage);
          setTotalItems(result.data.total);
        }
      } catch (error) {
        if (!ignore) {
          console.error("Lỗi khi fetch dữ liệu products:", error);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }, 200);

    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [page, searchTerm, refreshToken]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  return (
    <div className="space-y-3">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Quản lý sản phẩm
            </h1>
            <Badge
              variant="outline"
              className="border-blue-200 bg-blue-50 text-blue-700 font-medium"
            >
              {totalItems} sản phẩm
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý danh mục sản phẩm gốc, biến thể, hình ảnh và thông số kỹ
            thuật.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-2 border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-sm"
          >
            <Download className="w-4 h-4 text-slate-500" /> Xuất file
          </Button>

          <Button
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            className="h-9 gap-2 bg-blue-600 text-white hover:bg-blue-700 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Thêm sản phẩm
          </Button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="border-slate-200/80 shadow-sm bg-white rounded-xl flex items-center gap-2 p-1.5">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Tìm theo tên sản phẩm, slug..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-9 h-9 border-slate-200 bg-slate-50/50 text-xs focus:bg-white focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchTerm("");
              setPage(1);
            }}
            className="h-9 px-3 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Đặt lại
          </Button>
        )}
      </div>

      {/* Main Table Card */}
      <Card className="border-slate-200/80 shadow-sm bg-white rounded-xl overflow-hidden flex flex-col justify-between">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="table-fixed border-collapse">
              <TableHeader className="bg-slate-50/80 border-b border-slate-200">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[70px] text-xs font-semibold text-slate-600 pl-4 py-3">
                    Ảnh
                  </TableHead>
                  <TableHead className="w-[200px] text-xs font-semibold text-slate-600 py-3">
                    Tên & Slug
                  </TableHead>
                  <TableHead className="w-[140px] text-xs font-semibold text-slate-600 py-3">
                    Dòng (Serie)
                  </TableHead>
                  <TableHead className="w-[120px] text-xs font-semibold text-slate-600 py-3">
                    Năm ra mắt
                  </TableHead>
                  <TableHead className="w-[110px] text-xs font-semibold text-slate-600 py-3">
                    Biến thể
                  </TableHead>
                  <TableHead className="w-[110px] text-xs font-semibold text-slate-600 py-3">
                    Thông số
                  </TableHead>
                  <TableHead className="w-[200px] text-xs font-semibold text-slate-600 py-3">
                    Mô tả
                  </TableHead>
                  <TableHead className="w-[80px] text-right text-xs font-semibold text-slate-600 pr-4 py-3">
                    Thao tác
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow style={{ height: ROW_HEIGHT * 6 }}>
                    <TableCell
                      colSpan={8}
                      className="text-center text-slate-400 py-8"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
                        Đang tải dữ liệu...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : products.length === 0 ? (
                  <TableRow style={{ height: ROW_HEIGHT * 6 }}>
                    <TableCell
                      colSpan={8}
                      className="text-center text-slate-400 py-8"
                    >
                      {searchTerm
                        ? `Không tìm thấy sản phẩm nào khớp với "${searchTerm}".`
                        : "Không có sản phẩm nào."}
                    </TableCell>
                  </TableRow>
                ) : (
                  <>
                    {products.slice(0, 6).map((product: any) => {
                      const serie = product.series;
                      const brand = serie?.brands;

                      const variantCount =
                        product._count?.product_variants ?? 0;
                      const hasSpecs = product._count?.product_specs ?? 0;

                      return (
                        <TableRow
                          key={product.id}
                          className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors"
                          style={{ height: ROW_HEIGHT }}
                        >
                          {/* 1. Ảnh */}
                          <TableCell className="pl-4 py-2">
                            <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-200/80 p-0.5 flex items-center justify-center shrink-0">
                              {product.product_images[0]?.image_url ||
                              brand?.logo ? (
                                <CldImage
                                  src={
                                    product.product_images[0]?.image_url ||
                                    brand?.logo
                                  }
                                  alt={product.name}
                                  width={32}
                                  height={32}
                                  crop="pad"
                                  className="max-w-full max-h-full object-contain rounded"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                  }}
                                />
                              ) : (
                                <Smartphone className="w-4 h-4 text-slate-400" />
                              )}
                            </div>
                          </TableCell>

                          {/* 2. Tên & Slug */}
                          <TableCell className="py-2">
                            <div className="flex flex-col min-w-0 pr-2">
                              <Link
                                href={`/admin/phones/${product.id}`}
                                className="font-semibold text-xs text-slate-900 hover:text-blue-600 transition-colors block truncate"
                              >
                                {product.name}
                              </Link>
                              <code className="text-[10px] font-mono text-blue-600 bg-blue-50/80 px-1 py-0.5 rounded border border-blue-100/50 w-fit mt-0.5">
                                /{product.slug}
                              </code>
                            </div>
                          </TableCell>

                          {/* 3. Dòng (Serie) */}
                          <TableCell className="py-2">
                            {serie ? (
                              <div className="flex flex-col">
                                <span className="text-xs font-medium text-slate-800">
                                  {serie.name}
                                </span>
                                {brand && (
                                  <span className="text-[10px] text-slate-400">
                                    {brand.name}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-300 italic text-xs">
                                Chưa phân dòng
                              </span>
                            )}
                          </TableCell>

                          {/* 4. Năm ra mắt */}
                          <TableCell className="py-2">
                            <Badge
                              variant="outline"
                              className={
                                "text-[11px] font-medium border bg-emerald-50 text-emerald-700 border-emerald-200"
                              }
                            >
                              {product.series.release_year}
                            </Badge>
                          </TableCell>

                          {/* 5. Biến thể */}
                          <TableCell className="py-2">
                            <div className="flex items-center gap-1.5 text-xs text-slate-600">
                              <Layers className="w-3.5 h-3.5 text-slate-400" />
                              <span className="font-medium">
                                {variantCount}{" "}
                                <span className="font-normal text-slate-500">
                                  biến thể
                                </span>
                              </span>
                            </div>
                          </TableCell>

                          {/* 6. Thông số */}
                          <TableCell className="py-2">
                            <div className="flex items-center gap-1.5 text-xs text-slate-600">
                              <Cpu className="w-3.5 h-3.5 text-slate-400" />
                              <span className="font-medium">
                                {hasSpecs}{" "}
                                <span className="font-normal text-slate-500">
                                  Thông số
                                </span>
                              </span>
                            </div>
                          </TableCell>

                          {/* 7. Mô tả */}
                          <TableCell className="py-2">
                            {product.description ? (
                              <p
                                className="text-xs text-slate-500 line-clamp-2 leading-relaxed"
                                title={product.description}
                              >
                                {product.description}
                              </p>
                            ) : (
                              <span className="text-slate-300 italic text-xs">
                                Chưa có mô tả
                              </span>
                            )}
                          </TableCell>

                          {/* 8. Thao tác */}
                          {/* 8. Thao tác */}
                          <TableCell className="text-right pr-4 py-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger
                                render={
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                                  >
                                    <MoreHorizontal className="w-4 h-4" />
                                    <span className="sr-only">
                                      Menu thao tác
                                    </span>
                                  </Button>
                                }
                              />

                              <DropdownMenuContent
                                align="end"
                                className="w-[160px] text-xs bg-slate-50"
                              >
                                {/* Bọc DropdownMenuGroup ở đây */}
                                <DropdownMenuGroup>
                                  <DropdownMenuLabel className="text-[11px] text-slate-400 font-normal">
                                    Thao tác
                                  </DropdownMenuLabel>
                                </DropdownMenuGroup>

                                <DropdownMenuSeparator />

                                <DropdownMenuItem
                                  render={
                                    <Link
                                      href={`/admin/phones/${product.id}`}
                                      className="cursor-pointer flex items-center"
                                    >
                                      <Eye className="w-3.5 h-3.5 mr-2 text-slate-500" />
                                      Xem chi tiết
                                    </Link>
                                  }
                                />

                                <DropdownMenuItem
                                  className="cursor-pointer flex items-center"
                                  onClick={() => setEditingProduct(product)}
                                >
                                  <Pencil className="w-3.5 h-3.5 mr-2 text-slate-500" />
                                  Chỉnh sửa
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />

                                <DropdownMenuItem
                                  className="cursor-pointer flex items-center text-red-600 focus:text-red-600 focus:bg-red-50"
                                  onClick={() => setDeletingProduct(product)}
                                >
                                  <Trash2 className="w-3.5 h-3.5 mr-2" /> Xóa
                                  sản phẩm
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}

                    {/* Hàng trống giữ chiều cao bảng */}
                    {Array.from({
                      length: Math.max(0, 6 - products.length),
                    }).map((_, i) => (
                      <TableRow
                        key={`empty-${i}`}
                        className="border-b border-transparent"
                        style={{ height: ROW_HEIGHT }}
                      >
                        <TableCell colSpan={8} className="px-4 py-2">
                          &nbsp;
                        </TableCell>
                      </TableRow>
                    ))}
                  </>
                )}
              </TableBody>
            </Table>
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
                <strong className="text-slate-600">{totalItems}</strong> sản
                phẩm
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ========================================== */}
      {/* CÁC DIALOG QUẢN LÝ ĐẶT NGOÀI CÙNG PAGE     */}
      {/* ========================================== */}

      {/* 1. Dialog Thêm Sản Phẩm */}
      <CreateProductDialog
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleSuccess}
      />

      {/* 2. Dialog Cập Nhật Sản Phẩm */}
      {editingProduct && (
        <UpdateProductDialog
          isOpen={!!editingProduct}
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSuccess={handleSuccess}
        />
      )}

      {/* 3. Dialog Xóa Sản Phẩm */}
      {deletingProduct && (
        <DeleteProductDialog
          productId={deletingProduct.id}
          productName={deletingProduct.name}
          open={!!deletingProduct}
          onOpenChange={(open) => {
            if (!open) setDeletingProduct(null);
          }}
          showTrigger={false}
          onDeleted={() => {
            setDeletingProduct(null);
            handleSuccess();
          }}
        />
      )}
    </div>
  );
}
