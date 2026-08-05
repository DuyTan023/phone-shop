/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type { colors, rams, storages } from "@/app/generated/prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { TabsContent } from "@/components/ui/tabs";
import type {
  ProductVariant,
  ProductVariantFilter,
} from "@/lib/repositories/product/products_variant.repository";
import type { ApiResponse } from "@/lib/types/public/types";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  RotateCcw,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { DeleteProductVariantDialog } from "./DeleteProductVariantDialog";
import FormCreateProductVariantDialog from "./FormCreateProductVaritan";
import FormUpdateProductVariantDialog from "./FormUpdateProductVariant";

export default function TabProductVariantInfo({
  product_id,
  name,
}: {
  product_id: number;
  name: string;
}) {
  const [product_variants, setProductVariant] = useState<ProductVariant[]>([]);

  // State quản lý phân trang
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);

  const [colors, setColor] = useState<colors[] | null>(null);
  const [rams, setRam] = useState<rams[] | null>(null);
  const [storages, setStorages] = useState<storages[] | null>(null);

  const form = useForm<ProductVariantFilter>({
    defaultValues: {
      sku: "",
      color_id: undefined,
      ram_id: undefined,
      storage_id: undefined,
    },
  });

  const skuSearch = form.watch("sku");
  const colorId = form.watch("color_id");
  const ramId = form.watch("ram_id");
  const storageId = form.watch("storage_id");

  const selectedColor = colors?.find((s) => s?.id === colorId) ?? null;
  const selectedRam = rams?.find((s) => s?.id === ramId) ?? null;
  const selectedStorage = storages?.find((s) => s?.id === storageId) ?? null;

  // 1. Fetch danh sách biến thể có Phân trang & Filter
  const fetchProductVariant = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());

      if (skuSearch?.trim()) params.append("sku", skuSearch.trim());
      if (colorId) params.append("color_id", colorId.toString());
      if (ramId) params.append("ram_id", ramId.toString());
      if (storageId) params.append("storage_id", storageId.toString());

      const response = await fetch(
        `/api/product_manager/products/${product_id}/product_variants?${params.toString()}`,
      );

      const result: ApiResponse<{
        product_variants: ProductVariant[];
        total: number;
      }> = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Không thể lấy danh sách biến thể");
      }

      if (result.data) {
        const { product_variants, total } = result.data;
        setProductVariant(product_variants ?? []);
        const calculatedTotalPages = Math.ceil((total || 0) / limit);
        setTotalPages(calculatedTotalPages > 0 ? calculatedTotalPages : 1);
        setTotalItems(total || 0);
      }
    } catch (err: any) {
      console.error(err.message);
    }
  }, [product_id, page, limit, skuSearch, colorId, ramId, storageId]);

  // Reset về trang 1 khi lọc
  useEffect(() => {
    setPage(1);
  }, [skuSearch, colorId, ramId, storageId]);

  // Fetch danh sách biến thể
  useEffect(() => {
    fetchProductVariant();
  }, [fetchProductVariant]);

  // Fetch các danh mục Catalogs (Colors, Rams, Storages)
  useEffect(() => {
    const fetchCatalogs = async () => {
      try {
        const [resColors, resRams, resStorages] = await Promise.all([
          fetch(`/api/catalogs/colors`),
          fetch(`/api/catalogs/rams`),
          fetch(`/api/catalogs/storages`),
        ]);

        const [dataColors, dataRams, dataStorages] = await Promise.all([
          resColors.json(),
          resRams.json(),
          resStorages.json(),
        ]);

        if (dataColors.success && dataColors.data) {
          setColor(dataColors.data.data || dataColors.data);
        }
        if (dataRams.success && dataRams.data) {
          setRam(dataRams.data);
        }
        if (dataStorages.success && dataStorages.data) {
          setStorages(dataStorages.data);
        }
      } catch (err: any) {
        console.error("Lỗi khi tải catalogs:", err.message);
      }
    };

    fetchCatalogs();
  }, []);

  const handleResetFilter = (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
    form.reset({
      sku: "",
      color_id: undefined,
      ram_id: undefined,
      storage_id: undefined,
    });
    setPage(1);
  };

  function formattedDate(date: Date | string | null | undefined): string {
    if (!date) return "-";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <TabsContent value="skus" className="m-0 focus-visible:outline-none">
      <div className="flex flex-col xl:flex-row gap-6 items-start w-full">
        {/* Bảng danh sách SKU */}
        <div className="w-full xl:flex-1 min-w-0">
          <div className="rounded-xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
            {/* Header Table */}
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Danh sách Biến thể (SKUs)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Quản lý Mã SKU, Giá bán, Giá nhập và Số lượng tồn kho.
                </p>
              </div>
              <FormCreateProductVariantDialog
                product_id={product_id}
                name={name}
                colors={colors || []}
                rams={rams || []}
                storages={storages || []}
                onSuccess={fetchProductVariant}
              />
            </div>

            {/* Accordion Filter */}
            <div className="rounded-none border-b border-slate-200 bg-white overflow-hidden transition-all duration-200">
              <Accordion className="w-full">
                <AccordionItem value="filter-section" className="border-none">
                  <AccordionTrigger className="p-0 hover:no-underline [&[data-state=open]>div>.filter-icon-wrapper]:bg-blue-600 [&[data-state=open]>div>.filter-icon-wrapper]:text-white [&[data-state=open]>div>.filter-icon-wrapper]:rotate-180 [&[data-state=open]>div>.filter-icon-wrapper]:shadow-md">
                    <div className="w-full p-4 px-6 bg-gradient-to-r from-slate-50 via-slate-50/80 to-blue-50/30 flex items-center justify-between gap-4 select-none">
                      <div className="flex items-center gap-3.5">
                        <div className="filter-icon-wrapper flex items-center justify-center w-10 h-10 rounded-xl bg-blue-100/80 text-blue-600 transition-all duration-300 shrink-0">
                          <Filter className="h-5 w-5" />
                        </div>
                        <div className="text-left">
                          <h3 className="text-base font-bold text-slate-800 tracking-tight flex items-center gap-2">
                            Bộ lọc sản phẩm
                          </h3>
                          <p className="text-xs text-slate-500 font-normal mt-0.5">
                            Tìm kiếm biến thể theo các tiêu chí bên dưới
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          aria-hidden="true"
                          className="inline-flex items-center justify-center gap-1.5 h-8 px-3 text-xs font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200 border border-slate-200/80 rounded-lg shadow-2xs transition-all shrink-0 active:scale-95 cursor-pointer pointer-events-auto"
                          onClick={handleResetFilter}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              handleResetFilter(e);
                            }
                          }}
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          Đặt lại bộ lọc
                        </span>
                      </div>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent className="p-0">
                    <div className="p-6 bg-white grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                      {/* Input SKU */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="sku"
                          className="text-xs font-semibold text-slate-700 uppercase tracking-wider"
                        >
                          Mã SKU
                        </Label>
                        <Input
                          id="sku"
                          {...form.register("sku")}
                          className="h-10 border-slate-200 focus:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-100 rounded-lg text-sm"
                          placeholder="Nhập mã SKU..."
                        />
                      </div>

                      {/* Color */}
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                          Màu sắc
                        </Label>
                        <Combobox
                          items={colors ?? []}
                          value={selectedColor}
                          itemToStringValue={(s) => s.name}
                          itemToStringLabel={(s) => s.name}
                          onValueChange={(s: any) =>
                            form.setValue("color_id", s?.id)
                          }
                        >
                          <ComboboxInput
                            placeholder="Chọn màu sắc..."
                            className="h-10 border-slate-200 focus:border-blue-500 rounded-lg text-sm"
                          />
                          <ComboboxContent className="bg-white rounded-xl shadow-lg border border-slate-100">
                            <ComboboxEmpty className="py-3 text-xs text-slate-400 text-center">
                              Không tìm thấy dữ liệu.
                            </ComboboxEmpty>
                            <ComboboxList>
                              {(s) => (
                                <ComboboxItem
                                  key={s.id}
                                  value={s}
                                  className="text-sm py-2 px-3 rounded-md cursor-pointer hover:bg-slate-50"
                                >
                                  {s.name}
                                </ComboboxItem>
                              )}
                            </ComboboxList>
                          </ComboboxContent>
                        </Combobox>
                      </div>

                      {/* RAM */}
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                          Bộ nhớ RAM
                        </Label>
                        <Combobox
                          items={rams ?? []}
                          value={selectedRam}
                          itemToStringValue={(s) => s.value}
                          itemToStringLabel={(s) => s.value}
                          onValueChange={(s: any) =>
                            form.setValue("ram_id", s?.id)
                          }
                        >
                          <ComboboxInput
                            placeholder="Chọn RAM..."
                            className="h-10 border-slate-200 focus:border-blue-500 rounded-lg text-sm"
                          />
                          <ComboboxContent className="bg-white rounded-xl shadow-lg border border-slate-100">
                            <ComboboxEmpty className="py-3 text-xs text-slate-400 text-center">
                              Không tìm thấy dữ liệu.
                            </ComboboxEmpty>
                            <ComboboxList>
                              {(s) => (
                                <ComboboxItem
                                  key={s.id}
                                  value={s}
                                  className="text-sm py-2 px-3 rounded-md cursor-pointer hover:bg-slate-50"
                                >
                                  {s.value}
                                </ComboboxItem>
                              )}
                            </ComboboxList>
                          </ComboboxContent>
                        </Combobox>
                      </div>

                      {/* Storage */}
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                          Bộ nhớ trong
                        </Label>
                        <Combobox
                          items={storages ?? []}
                          value={selectedStorage}
                          itemToStringValue={(s) => s.value}
                          itemToStringLabel={(s) => s.value}
                          onValueChange={(s: any) =>
                            form.setValue("storage_id", s?.id)
                          }
                        >
                          <ComboboxInput
                            placeholder="Chọn Bộ nhớ..."
                            className="h-10 border-slate-200 focus:border-blue-500 rounded-lg text-sm"
                          />
                          <ComboboxContent className="bg-white rounded-xl shadow-lg border border-slate-100">
                            <ComboboxEmpty className="py-3 text-xs text-slate-400 text-center">
                              Không tìm thấy dữ liệu.
                            </ComboboxEmpty>
                            <ComboboxList>
                              {(s) => (
                                <ComboboxItem
                                  key={s.id}
                                  value={s}
                                  className="text-sm py-2 px-3 rounded-md cursor-pointer hover:bg-slate-50"
                                >
                                  {s.value}
                                </ComboboxItem>
                              )}
                            </ComboboxList>
                          </ComboboxContent>
                        </Combobox>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            {/* Table */}
            <div className="w-full overflow-x-auto">
              <Table className="w-full min-w-[650px]">
                <TableHeader className="bg-slate-50/80">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-xs font-semibold text-slate-700">
                      #
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-slate-700">
                      Mã SKU
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-slate-700">
                      Cấu hình
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-right text-slate-700">
                      Giá bán
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-right text-slate-700">
                      Giá nhập
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-center text-slate-700">
                      Tồn kho
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-center text-slate-700">
                      Trạng thái
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-center text-slate-700">
                      Mặc định
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-center text-slate-700">
                      Ngày tạo
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-center text-slate-700">
                      Cập nhật
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-center text-slate-700">
                      Hành động
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {product_variants.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={11}
                        className="text-center py-8 text-slate-400 text-sm"
                      >
                        Không tìm thấy biến thể nào.
                      </TableCell>
                    </TableRow>
                  ) : (
                    product_variants.map((item) => {
                      const formattedPrice =
                        new Intl.NumberFormat("vi-VN").format(
                          Number(item.price),
                        ) + " đ";
                      const formattedCostPrice = item.cost_price
                        ? new Intl.NumberFormat("vi-VN").format(
                            Number(item.cost_price),
                          ) + " đ"
                        : "—";

                      return (
                        <TableRow
                          key={item.id}
                          className="hover:bg-slate-50/60 transition-colors"
                        >
                          <TableCell className="font-mono text-xs font-semibold text-indigo-600">
                            <Checkbox id={`cb-${item.id}`} />
                          </TableCell>
                          <TableCell className="font-mono text-xs font-semibold text-indigo-600">
                            {item.sku}
                          </TableCell>
                          <TableCell className="text-xs">
                            <span className="font-semibold text-slate-800">
                              {item.colors?.name}
                            </span>
                            <br />
                            <span className="text-[11px] text-slate-500">
                              {item.rams?.value} • {item.storages?.value}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs font-bold text-emerald-600 text-right">
                            {formattedPrice}
                          </TableCell>
                          <TableCell className="text-xs text-slate-500 text-right">
                            {formattedCostPrice}
                          </TableCell>
                          <TableCell className="text-xs text-center font-medium">
                            <span className="rounded-md bg-slate-100 px-2 py-1 text-slate-700">
                              {item.stock}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant="outline"
                              className={`text-[10px] ${
                                item.status
                                  ? "border-green-500 text-green-600 bg-green-50"
                                  : "border-red-500 text-red-600 bg-red-50"
                              }`}
                            >
                              {item.status ? "Đang bán" : "Không bán"}
                            </Badge>
                          </TableCell>

                          <TableCell className="text-center">
                            <Badge
                              variant="outline"
                              className={`text-[10px] ${
                                item.is_default
                                  ? "border-green-500 text-green-600 bg-green-50"
                                  : "border-red-500 text-red-600 bg-red-50"
                              }`}
                            >
                              {item.is_default ? "Yes" : "No"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs font-medium text-slate-600 text-center">
                            {formattedDate(item.create_at)}
                          </TableCell>
                          <TableCell className="text-xs font-medium text-slate-600 text-center">
                            {formattedDate(item.update_at)}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <FormUpdateProductVariantDialog
                                product_variant={item}
                                colors={colors}
                                rams={rams}
                                storages={storages}
                                onSuccess={fetchProductVariant}
                              />
                              <DeleteProductVariantDialog
                                id={item.id}
                                variantName={`${item.products?.name || name} - ${item.colors?.name} - ${item.rams?.value} - ${item.storages?.value}`}
                                onDeleted={fetchProductVariant}
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Controls */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-500">
                Hiển thị{" "}
                <span className="font-semibold text-slate-800">
                  {product_variants.length}
                </span>{" "}
                /{" "}
                <span className="font-semibold text-slate-800">
                  {totalItems}
                </span>{" "}
                biến thể
              </div>

              <div className="flex items-center gap-2">
                {/* Chọn số dòng mỗi trang */}
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1);
                  }}
                  className="h-8 text-xs border border-slate-200 rounded-md bg-white px-2 focus:outline-none focus:border-blue-500"
                >
                  <option value={5}>5 / trang</option>
                  <option value={10}>10 / trang</option>
                  <option value={20}>20 / trang</option>
                  <option value={50}>50 / trang</option>
                </select>

                {/* Các nút chuyển trang */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setPage(1)}
                    disabled={page <= 1}
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    disabled={page <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <span className="text-xs font-medium px-2 text-slate-700">
                    Trang {page} / {totalPages}
                  </span>

                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() =>
                      setPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={page >= totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setPage(totalPages)}
                    disabled={page >= totalPages}
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TabsContent>
  );
}
