// components/checkout/add-address-dialog.tsx

"use client";

import { useState } from "react";

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

import type { communes, provinces } from "@/app/generated/prisma/client";
import type { ApiResponse } from "@/lib/types/public/types";

export type AddressForm = {
  recipient_name: string;
  phone: string;
  province_id: number | null;
  commune_id: number | null;
  address_line: string;
  note: string;
  is_default: boolean;
};

type AddAddressDialogProps = {
  children: React.ReactElement;
  onAddAddress: (data: AddressForm) => void;
};

export function AddAddressDialog({
  children,
  onAddAddress,
}: AddAddressDialogProps) {
  const [open, setOpen] = useState(false);

  // States lưu danh sách từ API
  const [provincesList, setProvincesList] = useState<provinces[]>([]);
  const [communesList, setCommunesList] = useState<communes[]>([]);

  // States kiểm soát trạng thái loading
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingCommunes, setLoadingCommunes] = useState(false);

  const [form, setForm] = useState<AddressForm>({
    recipient_name: "",
    phone: "",
    province_id: null,
    commune_id: null,
    address_line: "",
    note: "",
    is_default: false,
  });

  // =========================
  // GET PROVINCES
  // =========================
  const fetchProvinces = async () => {
    try {
      setLoadingProvinces(true);
      const response = await fetch("/api/users/addresses/province");
      const result: ApiResponse<provinces[]> = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message);
      }

      setProvincesList(result.data ?? []);
    } catch (error) {
      console.error("Lỗi lấy danh sách tỉnh/thành:", error);
    } finally {
      setLoadingProvinces(false);
    }
  };

  // =========================
  // GET COMMUNES
  // =========================
  const fetchCommunes = async (provinceId: number) => {
    try {
      setLoadingCommunes(true);

      const response = await fetch(
        `/api/users/addresses/commune/province/${provinceId}`,
      );
      const result: ApiResponse<communes[]> = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message);
      }

      setCommunesList(result.data ?? []);
    } catch (error) {
      console.error("Lỗi lấy danh sách đơn vị cấp 2:", error);
      setCommunesList([]);
    } finally {
      setLoadingCommunes(false);
    }
  };

  // =========================
  // HANDLE DIALOG OPEN CHANGE
  // =========================
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && provincesList.length === 0) {
      fetchProvinces();
    }
  };

  // =========================
  // PROVINCE & COMMUNE CHANGE
  // =========================
  const handleProvinceChange = (province: provinces | null) => {
    setForm((current) => ({
      ...current,
      province_id: province?.id ?? null,
      commune_id: null,
    }));

    setCommunesList([]);

    if (province) {
      fetchCommunes(province.id);
    }
  };

  const handleCommuneChange = (commune: communes | null) => {
    setForm((current) => ({
      ...current,
      commune_id: commune?.id ?? null,
    }));
  };

  const updateField = (field: keyof AddressForm, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onAddAddress(form);

    setForm({
      recipient_name: "",
      phone: "",
      province_id: null,
      commune_id: null,
      address_line: "",
      note: "",
      is_default: false,
    });
    setCommunesList([]);
    setOpen(false);
  };

  const selectedProvince =
    provincesList.find((p) => p.id === form.province_id) ?? null;

  const selectedCommune =
    communesList.find((c) => c.id === form.commune_id) ?? null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={children} />

      <DialogContent className="sm:max-w-lg bg-background">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Thêm địa chỉ nhận hàng</DialogTitle>
            <DialogDescription>
              Nhập thông tin địa chỉ hoặc chọn từ danh sách có sẵn.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-5">
            <div className="space-y-2">
              <Label htmlFor="recipient_name">Người nhận</Label>
              <Input
                id="recipient_name"
                value={form.recipient_name}
                onChange={(event) =>
                  updateField("recipient_name", event.target.value)
                }
                placeholder="Nguyễn Văn A"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(event) => updateField("phone", event.target.value)}
                placeholder="0901234567"
                required
              />
            </div>

            {/* COMBOBOX TỈNH / THÀNH PHỐ */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 flex flex-col">
                <Label>Tỉnh / Thành phố</Label>
                <Combobox
                  items={provincesList}
                  value={selectedProvince}
                  itemToStringValue={(item) => item.name}
                  itemToStringLabel={(item) => item.name}
                  onValueChange={handleProvinceChange}
                >
                  <ComboboxInput
                    placeholder={
                      loadingProvinces
                        ? "Đang tải tỉnh/thành..."
                        : "Chọn tỉnh / thành phố..."
                    }
                  />
                  <ComboboxContent className="bg-white">
                    <ComboboxEmpty>Không tìm thấy tỉnh thành.</ComboboxEmpty>
                    <ComboboxList>
                      {(item) => (
                        <ComboboxItem key={item.id} value={item}>
                          {item.name}
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </div>

              {/* COMBOBOX PHƯỜNG / XÃ */}
              <div className="space-y-2 flex flex-col">
                <Label>Phường / Xã</Label>
                <Combobox
                  items={communesList}
                  value={selectedCommune}
                  itemToStringValue={(item) => item.name}
                  itemToStringLabel={(item) => item.name}
                  onValueChange={handleCommuneChange}
                  disabled={!form.province_id || loadingCommunes}
                >
                  <ComboboxInput
                    placeholder={
                      loadingCommunes ? "Đang tải..." : "Chọn phường / xã..."
                    }
                  />
                  <ComboboxContent className="bg-white">
                    <ComboboxEmpty>Không tìm thấy phường xã.</ComboboxEmpty>
                    <ComboboxList>
                      {(item) => (
                        <ComboboxItem key={item.id} value={item}>
                          {item.name}
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address_line">Địa chỉ cụ thể</Label>
              <Input
                id="address_line"
                value={form.address_line}
                onChange={(event) =>
                  updateField("address_line", event.target.value)
                }
                placeholder="Số nhà, tên đường..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address_note">Ghi chú</Label>
              <Input
                id="address_note"
                value={form.note}
                onChange={(event) => updateField("note", event.target.value)}
                placeholder="Ví dụ: Giao giờ hành chính"
              />
            </div>

            {/* CHECKBOX MẶC ĐỊNH */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="is_default"
                checked={form.is_default}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    is_default: event.target.checked,
                  }))
                }
                className="size-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <Label
                htmlFor="is_default"
                className="text-sm font-normal cursor-pointer"
              >
                Đặt làm địa chỉ mặc định
              </Label>
            </div>
          </div>

          <DialogFooter>
            <DialogClose
              render={
                <Button type="button" variant="outline">
                  Hủy
                </Button>
              }
            />
            <Button type="submit">Lưu địa chỉ</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
