/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type {
  colors as ColorType,
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
import type { CreateProductVariantInput } from "@/lib/types/products/product_variant.type";

import { useForm } from "react-hook-form";

interface FormCreateProductVariantDialogProps {
  product_id: number;
  name: string;
  colors?: ColorType[] | null;
  rams?: RamType[] | null;
  storages?: StorageType[] | null;
}

export default function FormCreateProductVariantDialog({
  product_id,
  name,
  colors = [],
  rams = [],
  storages = [],
}: FormCreateProductVariantDialogProps) {
  const colorList = colors ?? [];
  const ramList = rams ?? [];
  const storageList = storages ?? [];

  const form = useForm<CreateProductVariantInput>({
    defaultValues: {
      product_id: product_id,
      color_id: 0,
      storage_id: 0,
      ram_id: 0,
      price: 0,
      cost_price: 0,
      stock: 0,
      status: true,
      is_default: false,
    },
  });

  // Đồng bộ lại product_id vào form nếu props thay đổi
  const selectedColor =
    colorList?.find((s) => s?.id === form.watch("color_id")) ?? null;
  const selectedRam =
    ramList?.find((s) => s?.id === form.watch("ram_id")) ?? null;
  const selectedStorage =
    storageList?.find((s) => s?.id === form.watch("storage_id")) ?? null;

  const onSubmit = (data: CreateProductVariantInput) => {
    console.log("Dữ liệu form đã nhập:", data);
  };

  return (
    <Dialog modal={false}>
      <DialogTrigger asChild>
        <Button variant="outline">Tạo biến thể</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto bg-white">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <DialogHeader>
            <DialogTitle>Tạo biến thể sản phẩm: {name}</DialogTitle>
            <DialogDescription>
              Thêm biến thể mới cho sản phẩm
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-2">
            {/* Nhóm Combobox (Thuộc tính) */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Thuộc tính biến thể
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Combobox 1: Color */}
                <div className="space-y-2">
                  <Label htmlFor="color">Màu sắc (Color)</Label>
                  <Combobox
                    items={colorList ?? []}
                    value={selectedColor}
                    itemToStringValue={(s) => s.name}
                    itemToStringLabel={(s) => s.name}
                    onValueChange={(s) => {
                      form.setValue("color_id", s!.id);
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

                {/* Combobox 2: RAM */}
                <div className="space-y-2">
                  <Label htmlFor="ram">Dung lượng RAM</Label>
                  <Combobox
                    items={ramList ?? []}
                    value={selectedRam}
                    itemToStringValue={(s) => s.value}
                    itemToStringLabel={(s) => s.value}
                    onValueChange={(s: any) => form.setValue("ram_id", s?.id)}
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

                {/* Combobox 3: Storage */}
                <div className="space-y-2">
                  <Label htmlFor="storage">Dung lượng ROM</Label>
                  <Combobox
                    items={storageList ?? []}
                    value={selectedStorage}
                    itemToStringValue={(s) => s.value}
                    itemToStringLabel={(s) => s.value}
                    onValueChange={(s: any) =>
                      form.setValue("storage_id", s?.id)
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

            {/* Nhóm Input (Giá & Kho) */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Giá & Tồn kho
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Input 1: Cost Price */}
                <div className="space-y-2">
                  <Label htmlFor="cost_price">Giá nhập (Cost Price)</Label>
                  <Input
                    id="cost_price"
                    {...form.register("cost_price")}
                    className="border border-slate-700 focus:border-black focus-visible:ring-black"
                    placeholder="Nhập giá nhập..."
                  />
                </div>

                {/* Input 2: Price */}
                <div className="space-y-2">
                  <Label htmlFor="price">Giá bán (Price)</Label>
                  <Input
                    id="price"
                    {...form.register("price")}
                    className="border border-slate-700 focus:border-black focus-visible:ring-black"
                    placeholder="Nhập giá bán..."
                  />
                </div>
                {/* Input 3: Stock */}
                <div className="space-y-2">
                  <Label htmlFor="stock">Số lượng kho (Stock)</Label>
                  <Input
                    id="stock"
                    {...form.register("stock")}
                    className="border border-slate-700 focus:border-black focus-visible:ring-black"
                    placeholder="Nhập tồn kho..."
                  />
                </div>
              </div>

              {/* Switch */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Status */}
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <Label htmlFor="status">Trạng thái bán</Label>
                    <p className="text-xs text-muted-foreground">
                      Cho phép bán biến thể này
                    </p>
                  </div>

                  <Switch
                    id="status"
                    checked={form.watch("status")}
                    onCheckedChange={(checked) =>
                      form.setValue("status", checked)
                    }
                  />
                </div>

                {/* Default */}
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <Label htmlFor="is_default">Biến thể mặc định</Label>
                    <p className="text-xs text-muted-foreground">
                      Hiển thị mặc định khi mở sản phẩm
                    </p>
                  </div>

                  <Switch
                    id="is_default"
                    // checked={form.watch("is_default")}
                    // onCheckedChange={(checked) =>
                    //   form.setValue("is_default", checked)
                    // }
                  />
                </div>
              </div>
            </div>
          </div>

          <hr className="border-border" />

          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Hủy
              </Button>
            </DialogClose>
            <Button type="submit">Thêm mới</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
