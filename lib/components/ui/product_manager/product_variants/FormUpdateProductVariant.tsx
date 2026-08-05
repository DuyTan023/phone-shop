/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type {
  colors as ColorType,
  product_variants,
  rams as RamType,
  storages as StorageType,
} from "@/app/generated/prisma/client";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { UpdateProductVariantInput } from "@/lib/types/products/product_variant.type";
import type { ApiResponse } from "@/lib/types/public/types";
import { Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

interface FormUpdateProductVariantDialogProps {
  product_variant: product_variants;
  colors?: ColorType[] | null;
  rams?: RamType[] | null;
  storages?: StorageType[] | null;
  onSuccess?: () => void;
}

export default function FormUpdateProductVariantDialog({
  product_variant,
  colors = [],
  rams = [],
  storages = [],
  onSuccess,
}: FormUpdateProductVariantDialogProps) {
  const [open, setOpen] = useState(false);

  const colorList = colors ?? [];
  const ramList = rams ?? [];
  const storageList = storages ?? [];

  const form = useForm<UpdateProductVariantInput>({
    defaultValues: {
      product_id: product_variant?.product_id,
      color_id: product_variant?.color_id ?? 0,
      storage_id: product_variant?.storage_id ?? 0,
      ram_id: product_variant?.ram_id ?? 0,
      price: product_variant?.price ?? 0,
      cost_price: product_variant?.cost_price ?? 0,
      stock: product_variant?.stock ?? 0,
      status: product_variant?.status ?? true,
      is_default: product_variant?.is_default ?? false,
    },
  });

  // Cập nhật lại form khi truyền vào product_variant mới
  useEffect(() => {
    if (product_variant) {
      form.reset({
        product_id: product_variant.product_id,
        color_id: product_variant.color_id ?? 0,
        storage_id: product_variant.storage_id ?? 0,
        ram_id: product_variant.ram_id ?? 0,
        price: product_variant.price ?? 0,
        cost_price: product_variant.cost_price ?? 0,
        stock: product_variant.stock ?? 0,
        status: product_variant.status ?? true,
        is_default: product_variant.is_default ?? false,
      });
    }
  }, [product_variant, form]);

  const selectedColor =
    colorList.find((s) => s?.id === form.watch("color_id")) ?? null;
  const selectedRam =
    ramList.find((s) => s?.id === form.watch("ram_id")) ?? null;
  const selectedStorage =
    storageList.find((s) => s?.id === form.watch("storage_id")) ?? null;

  const onSubmit = async (data: UpdateProductVariantInput) => {
    try {
      console.log(data);
      const response = await fetch(
        `/api/product_manager/product_variants/${product_variant.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...data,
            id: product_variant.id,
          }),
        },
      );

      const result: ApiResponse<product_variants> = await response.json();

      if (result.success) {
        toast.success(result.message || "Cập nhật biến thể thành công", {
          description: "Thông tin biến thể đã lưu vào hệ thống.",
        });
        setOpen(false);
        if (onSuccess) onSuccess();
      } else {
        toast.error(result.message || "Cập nhật biến thể thất bại");
      }
    } catch (error) {
      console.error("Lỗi khi kết nối đến API:", error);
      toast.error("Không thể kết nối đến máy chủ. Vui lòng thử lại sau!");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen} modal={false}>
      {/* Trigger button cây bút chì màu xanh */}
      <DialogTrigger
        render={
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 dark:hover:bg-blue-900/50"
            title="Chỉnh sửa biến thể"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        }
      />

      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto bg-white">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <DialogHeader>
            <DialogTitle>Cập nhật biến thể sản phẩm</DialogTitle>
            <DialogDescription>
              Chỉnh sửa thông tin chi tiết cho biến thể sản phẩm
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-2">
            {/* Nhóm Thuộc tính */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Thuộc tính biến thể
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Color */}
                <div className="space-y-2">
                  <Label htmlFor="color">Màu sắc (Color)</Label>
                  <Combobox
                    items={colorList}
                    value={selectedColor}
                    itemToStringValue={(s) => s.name}
                    itemToStringLabel={(s) => s.name}
                    onValueChange={(s) => {
                      form.setValue("color_id", s?.id ?? 0);
                    }}
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

                {/* RAM */}
                <div className="space-y-2">
                  <Label htmlFor="ram">Dung lượng RAM</Label>
                  <Combobox
                    items={ramList}
                    value={selectedRam}
                    itemToStringValue={(s) => s.value}
                    itemToStringLabel={(s) => s.value}
                    onValueChange={(s) => form.setValue("ram_id", s?.id ?? 0)}
                  >
                    <ComboboxInput placeholder="Chọn ram..." />
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

                {/* Storage */}
                <div className="space-y-2">
                  <Label htmlFor="storage">Dung lượng ROM</Label>
                  <Combobox
                    items={storageList}
                    value={selectedStorage}
                    itemToStringValue={(s) => s.value}
                    itemToStringLabel={(s) => s.value}
                    onValueChange={(s) =>
                      form.setValue("storage_id", s?.id ?? 0)
                    }
                  >
                    <ComboboxInput placeholder="Chọn rom..." />
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

            <hr className="border-border" />

            {/* Nhóm Giá & Kho */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Giá & Tồn kho
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cost_price">Giá nhập (Cost Price)</Label>
                  <Input
                    id="cost_price"
                    type="number"
                    {...form.register("cost_price", { valueAsNumber: true })}
                    className="border border-slate-700 focus:border-black focus-visible:ring-black"
                    placeholder="Nhập giá nhập..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Giá bán (Price)</Label>
                  <Input
                    id="price"
                    type="number"
                    {...form.register("price", { valueAsNumber: true })}
                    className="border border-slate-700 focus:border-black focus-visible:ring-black"
                    placeholder="Nhập giá bán..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stock">Số lượng kho (Stock)</Label>
                  <Input
                    id="stock"
                    type="number"
                    {...form.register("stock", { valueAsNumber: true })}
                    className="border border-slate-700 focus:border-black focus-visible:ring-black"
                    placeholder="Nhập tồn kho..."
                  />
                </div>
              </div>

              {/* Nhóm Switch */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Status Switch */}
                <Controller
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <Label htmlFor="status" className="cursor-pointer">
                          Trạng thái bán
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Cho phép bán biến thể này
                        </p>
                      </div>
                      <Switch
                        id="status"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="h-6 w-11 border-2 border-transparent data-[checked]:bg-slate-900 data-[unchecked]:bg-slate-300 [&>[data-slot=switch-thumb]]:h-5 [&>[data-slot=switch-thumb]]:w-5 [&>[data-slot=switch-thumb]]:bg-white [&>[data-slot=switch-thumb]]:shadow-md [&>[data-slot=switch-thumb]]:data-[checked]:translate-x-5"
                      />
                    </div>
                  )}
                />

                {/* Is Default Switch */}
                <Controller
                  control={form.control}
                  name="is_default"
                  render={({ field }) => (
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <Label htmlFor="is_default" className="cursor-pointer">
                          Biến thể mặc định
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Hiển thị mặc định khi mở sản phẩm
                        </p>
                      </div>
                      <Switch
                        id="is_default"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="h-6 w-11 border-2 border-transparent data-[checked]:bg-slate-900 data-[unchecked]:bg-slate-300 [&>[data-slot=switch-thumb]]:h-5 [&>[data-slot=switch-thumb]]:w-5 [&>[data-slot=switch-thumb]]:bg-white [&>[data-slot=switch-thumb]]:shadow-md [&>[data-slot=switch-thumb]]:data-[checked]:translate-x-5"
                      />
                    </div>
                  )}
                />
              </div>
            </div>
          </div>

          <hr className="border-border" />

          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose
              render={
                <Button type="button" variant="outline">
                  Hủy
                </Button>
              }
            />
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Cập nhật
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
