/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { TabsContent } from "@/components/ui/tabs";
import type { ProductVariant } from "@/lib/repositories/product/products_variant.repository";
import type { ApiResponse } from "@/lib/types/public/types";
import { Eye, Plus, UploadCloud } from "lucide-react";
import { useEffect, useState } from "react";

export default function TabProductVariantInfo({
  product_id,
}: {
  product_id: number;
}) {
  const [product_variants, setProductVariant] = useState<
    ProductVariant[] | null
  >(null);
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

    fetchProductVariant();
  }, [product_id]);

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
              <Button
                size="sm"
                className="gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shrink-0"
              >
                <Plus className="h-3.5 w-3.5" />
                Thêm biến thể
              </Button>
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
                      Hành động
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* vòng lặp */}

                  {product_variants?.map((item) => {
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
        <div className="w-full xl:w-80 shrink-0">
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
        </div>
      </div>
    </TabsContent>
  );
}
