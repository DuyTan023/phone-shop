/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TabsContent } from "@/components/ui/tabs";
import { CheckCircle2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import type { series } from "@/app/generated/prisma/client";
import { Textarea } from "@/components/ui/textarea";
import { DeleteProduct2Dialog } from "@/lib/components/ui/product_manager/products/DeleteProduct2Dialog";
import type { ProductWithSerie } from "@/lib/repositories/product/product.repository";
import type { UpdateProductInput } from "@/lib/types/products/product.type";
import type { ApiResponse, PaginationResult } from "@/lib/types/public/types";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

interface TabProductInfoProps {
  product: ProductWithSerie;
  onUpdateSuccess: (updatedProduct: ProductWithSerie) => void;
}

export default function TabProductInfo({
  product,
  onUpdateSuccess,
}: TabProductInfoProps) {
  const [series, setSeries] = useState<series[] | null>(null);
  const form = useForm<UpdateProductInput>();

  // Chỉ fetch danh sách Series (danh mục)
  useEffect(() => {
    const fetchSeries = async () => {
      try {
        const response = await fetch(`/api/catalogs/series`);
        const result: ApiResponse<PaginationResult<series>> =
          await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Không thể lấy danh sách series");
        }

        if (result.data?.data) {
          setSeries(result.data.data);
        }
      } catch (err: any) {
        console.log(err.message);
      }
    };

    fetchSeries();
  }, []);

  // Sync dữ liệu product từ props vào form
  useEffect(() => {
    if (!product) return;
    form.reset({
      name: product.name,
      slug: product.slug,
      description: product.description ?? "",
      serie_id: product.serie_id,
    });
  }, [product, form]);

  const selectedSerie = series?.find((s) => s.id === form.watch("serie_id"));

  const onSubmit = async (data: UpdateProductInput) => {
    try {
      const response = await fetch(
        `/api/product_manager/products/${product.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message);
      }

      toast.success(result.message || "Cập nhật thành công", {
        description: "Thông tin sản phẩm đã được lưu vào hệ thống.",
      });

      // Báo cho component Cha biết dữ liệu vừa thay đổi
      if (result.data) {
        onUpdateSuccess(result.data);
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error("Cập nhật thất bại", { description: error.message });
      } else {
        alert("Có lỗi xảy ra");
      }
    }
  };

  return (
    <TabsContent value="general" className="m-0 focus-visible:outline-none">
      <div className="w-full shrink-0">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="rounded-xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Thông tin cơ bản
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Cấu hình tiêu đề, đường dẫn hiển thị và danh mục.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <DeleteProduct2Dialog id={product.id} name={product.name} />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs gap-1"
                  onClick={() => {
                    form.reset({
                      name: product.name,
                      slug: product.slug,
                      description: product.description ?? "",
                      serie_id: product.serie_id,
                    });
                  }}
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Đặt lại
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="h-8 text-xs gap-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Cập nhật
                </Button>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label
                  htmlFor="name"
                  className="text-xs font-medium text-slate-700"
                >
                  Tên sản phẩm
                </Label>
                <Input
                  id="name"
                  {...form.register("name")}
                  className="border-slate-200 focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="slug"
                  className="text-xs font-medium text-slate-700"
                >
                  Slug đường dẫn
                </Label>
                <Input
                  id="slug"
                  {...form.register("slug")}
                  className="border-slate-200 focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-700">
                  Dòng sản phẩm (Serie)
                </Label>
                <Combobox
                  items={series ?? []}
                  value={selectedSerie}
                  itemToStringValue={(s) => s.name}
                  itemToStringLabel={(s) => s.name}
                  onValueChange={(s: any) => form.setValue("serie_id", s.id)}
                >
                  <ComboboxInput placeholder="Chọn dòng sản phẩm..." />
                  <ComboboxContent>
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

              <div className="space-y-1.5">
                <Label
                  htmlFor="description"
                  className="text-xs font-medium text-slate-700"
                >
                  Mô tả
                </Label>
                <Textarea
                  id="description"
                  {...form.register("description")}
                  placeholder="Nhập mô tả sản phẩm..."
                  className="min-h-32 resize-y border-slate-200 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    </TabsContent>
  );
}
