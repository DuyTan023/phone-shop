/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import type { colors, rams, storages } from "@/app/generated/prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ComboboxContent } from "@/components/ui/combobox";
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
  Combobox,
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
import type { ApiResponse, PaginationResult } from "@/lib/types/public/types";
import { Eye, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import FormCreateProductVariantDialog from "./FormCreateProductVaritan";

export default function TabProductVariantInfo({
  product_id,
  name,
}: {
  product_id: number;
  name: string;
}) {
  const [product_variants, setProductVariant] = useState<
    ProductVariant[] | null
  >(null);

  const [sku, setSku] = useState<string | null>(null);
  const [colors, setColor] = useState<colors[] | null>(null);
  const [rams, setRam] = useState<rams[] | null>(null);
  const [storages, setStorages] = useState<storages[] | null>(null);
  const form = useForm<ProductVariantFilter>();
  //fetch danh sách product variant thep product_id
  useEffect(() => {
    const fetchProductVariant = async () => {
      try {
        const response = await fetch(
          `/api/product_manager/products/${product_id}/product_variants`,
        );

        const result: ApiResponse<ProductVariant[]> = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Không thể lấy danh sách series");
        }

        if (result.data) {
          setProductVariant(result.data);
        }
      } catch (err: any) {
        console.log(err.message);
      }
    };

    const fetchColor = async () => {
      try {
        const colors = await fetch(`/api/catalogs/colors`);
        const resultColors: ApiResponse<PaginationResult<colors>> =
          await colors.json();

        if (!colors.ok || !resultColors.success) {
          throw new Error(
            resultColors.message || "Không thể lấy danh sách màu",
          );
        }

        if (resultColors.data?.data) {
          setColor(resultColors.data.data);
        }
      } catch (err: any) {
        console.log(err.message);
      }
    };
    const fetchRam = async () => {
      try {
        const rams = await fetch(`/api/catalogs/rams`);
        const resultRam: ApiResponse<rams[]> = await rams.json();

        if (!rams.ok || !resultRam.success) {
          throw new Error(resultRam.message || "Không thể lấy danh sách ram");
        }

        if (resultRam.data) {
          setRam(resultRam.data);
        }
      } catch (err: any) {
        console.log(err.message);
      }
    };
    const fetchStorage = async () => {
      try {
        const storage = await fetch(`/api/catalogs/storages`);
        const resultStorage: ApiResponse<storages[]> = await storage.json();

        if (!storage.ok || !resultStorage.success) {
          throw new Error(
            resultStorage.message || "Không thể lấy danh sách strorage",
          );
        }

        if (resultStorage.data) {
          setStorages(resultStorage.data);
        }
      } catch (err: any) {
        console.log(err.message);
      }
    };

    fetchProductVariant();
    fetchColor();
    fetchRam();
    fetchStorage();
  }, [product_id]);
  const skuSearch = form.watch("sku") ?? "";
  const selectedColor =
    colors?.find((s) => s?.id === form.watch("color_id")) ?? null;
  const selectedRam = rams?.find((s) => s?.id === form.watch("ram_id")) ?? null;
  const selectedStorage =
    storages?.find((s) => s?.id === form.watch("storage_id")) ?? null;

  // 3. TỰ ĐỘNG LỌC DANH SÁCH THEO SKU + COLOR + RAM + STORAGE
  const filteredVariants = useMemo(() => {
    if (!product_variants) return [];

    return product_variants.filter((item) => {
      // Lọc theo SKU (Không phân biệt chữ hoa / chữ thường)
      const matchesSku = skuSearch
        ? item.sku.toLowerCase().includes(skuSearch.trim().toLowerCase())
        : true;

      // Lọc theo Color (Nếu có chọn)
      const matchesColor = selectedColor?.id
        ? item.colors?.id === selectedColor?.id
        : true;

      // Lọc theo RAM (Nếu có chọn)
      const matchesRam = selectedRam?.id
        ? item.rams?.id === selectedRam?.id
        : true;

      // Lọc theo Storage (Nếu có chọn)
      const matchesStorage = selectedStorage?.id
        ? item.storages?.id === selectedStorage?.id
        : true;

      return matchesSku && matchesColor && matchesRam && matchesStorage;
    });
  }, [
    product_variants,
    skuSearch,
    selectedColor?.id,
    selectedRam?.id,
    selectedStorage?.id,
  ]);

  const onSubmit = async () => {
    console.log(form);
  };

  return (
    <TabsContent value="skus" className="m-0 focus-visible:outline-none">
      <div className="flex flex-col xl:flex-row gap-6 items-start w-full">
        {/* Bảng danh sách SKU */}
        <div className="w-full xl:flex-1 min-w-0">
          <div className="rounded-xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
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
              />
            </div>

            <div>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="rounded-xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
                  {/* Header: Chứa tiêu đề & Nút đặt lại cân đối ở góc phải */}
                  <div className="p-4 px-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-800">
                        Bộ lọc sản phẩm
                      </h3>
                      <p className="text-xs text-slate-500">
                        Tìm kiếm biến thể theo các tiêu chí bên dưới
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-1.5 text-xs text-blue-800 hover:text-slate-900 border-slate-200 shrink-0"
                      onClick={() =>
                        form.reset({
                          sku: "",
                          color_id: undefined,
                          ram_id: undefined,
                          storage_id: undefined,
                        })
                      }
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Đặt lại bộ lọc
                    </Button>
                  </div>

                  {/* Form Grid Content */}
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Input SKU */}
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="sku"
                        className="text-xs font-medium text-slate-700"
                      >
                        Mã sản phẩm (SKU)
                      </Label>
                      <Input
                        id="sku"
                        {...form.register("sku")}
                        className="border border-slate-700 focus:border-black focus-visible:ring-black"
                        placeholder="Nhập mã SKU..."
                      />
                    </div>

                    {/* Combobox Color */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-slate-700">
                        Màu sản phẩm (Color)
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
                        <ComboboxInput placeholder="Chọn màu sắc..." />
                        <ComboboxContent className="bg-white">
                          <ComboboxEmpty>Không tìm thấy dữ liệu.</ComboboxEmpty>
                          <ComboboxList>
                            {(s) => (
                              <ComboboxItem key={s.id} value={s}>
                                {s.name}
                              </ComboboxItem>
                            )}
                          </ComboboxList>
                        </ComboboxContent>
                      </Combobox>
                    </div>

                    {/* Combobox RAM */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-slate-700">
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
                        <ComboboxInput placeholder="Chọn dung lượng RAM..." />
                        <ComboboxContent className="bg-white">
                          <ComboboxEmpty>Không tìm thấy dữ liệu.</ComboboxEmpty>
                          <ComboboxList>
                            {(s) => (
                              <ComboboxItem key={s.id} value={s}>
                                {s.value}
                              </ComboboxItem>
                            )}
                          </ComboboxList>
                        </ComboboxContent>
                      </Combobox>
                    </div>

                    {/* Combobox Storage */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-slate-700">
                        Bộ nhớ trong (Storage)
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
                        <ComboboxInput placeholder="Chọn dung lượng bộ nhớ..." />
                        <ComboboxContent className="bg-white">
                          <ComboboxEmpty>Không tìm thấy dữ liệu.</ComboboxEmpty>
                          <ComboboxList>
                            {(s) => (
                              <ComboboxItem key={s.id} value={s}>
                                {s.value}
                              </ComboboxItem>
                            )}
                          </ComboboxList>
                        </ComboboxContent>
                      </Combobox>
                    </div>
                  </div>
                </div>
              </form>
            </div>

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
                  {/* vòng lặp */}

                  {filteredVariants?.map((item) => {
                    // Format tiền tệ VNĐ
                    const formattedPrice =
                      new Intl.NumberFormat("vi-VN").format(
                        Number(item.price),
                      ) + " đ";
                    const formattedCostPrice = item.cost_price
                      ? new Intl.NumberFormat("vi-VN").format(
                          Number(item.cost_price),
                        ) + " đ"
                      : "—";

                    function formattedDate(
                      date: Date | string | null | undefined,
                    ): string {
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
                      <TableRow
                        key={item.id}
                        className="hover:bg-slate-50/60 transition-colors"
                      >
                        <TableCell className="font-mono text-xs font-semibold text-indigo-600">
                          <Checkbox id="terms-checkbox" name="terms-checkbox" />
                        </TableCell>
                        <TableCell className="font-mono text-xs font-semibold text-indigo-600">
                          {item.sku}
                        </TableCell>
                        <TableCell className="text-xs">
                          <span className="font-semibold text-slate-800">
                            {item.colors.name}
                          </span>
                          <br />
                          <span className="text-[11px] text-slate-500">
                            {item.rams.value} • {item.storages.value}
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
                        <TableCell className="text-xs font-bold text-emerald-600 text-right">
                          {formattedDate(item.create_at)}
                        </TableCell>
                        <TableCell className="text-xs font-bold text-emerald-600 text-right">
                          {formattedDate(item.update_at)}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-slate-500 hover:text-blue-600"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        {/* Ô xem ảnh bên phải */}
        {/* <div className="w-full xl:w-80 shrink-0">
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-900">
                Ảnh đại diện chính
              </h2>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-[11px] text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2"
              >
                Xóa ảnh
              </Button>
            </div>
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50/50 p-6 text-center hover:bg-slate-50 transition-colors">
              <div className="h-36 w-36 rounded-lg bg-slate-200/80 flex items-center justify-center text-slate-400 font-medium text-xs mb-3 shadow-inner">
                Main Preview
              </div>
              <p className="text-[11px] text-slate-500 mb-3">
                Định dạng PNG, JPG (Tối đa 2MB)
              </p>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              >
                <UploadCloud className="h-3.5 w-3.5 text-slate-500" />
                Thay ảnh mới
              </Button>
            </div>
          </div>
        </div> */}
      </div>
    </TabsContent>
  );
}
