"use client";

import { useEffect, useState } from "react";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type {
  communes,
  provinces,
  user_addresses,
} from "@/app/generated/prisma/client";
import type { ApiResponse } from "@/lib/types/public/types";

type AddressForm = {
  recipient_name: string;
  phone: string;
  province_id: number | null;
  commune_id: number | null;
  address_line: string;
  note: string;
  is_default: boolean;
};

const initialForm: AddressForm = {
  recipient_name: "",
  phone: "",
  province_id: null,
  commune_id: null,
  address_line: "",
  note: "",
  is_default: false,
};

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<user_addresses[]>([]);
  const [provincesList, setProvincesList] = useState<provinces[]>([]);
  const [communesList, setCommunesList] = useState<communes[]>([]);

  const [form, setForm] = useState<AddressForm>(initialForm);

  const [editingId, setEditingId] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadingCommunes, setLoadingCommunes] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [showForm, setShowForm] = useState(false);

  // =========================
  // GET ADDRESSES
  // =========================

  const fetchAddresses = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/users/addresses/user-addresses");

      const result: ApiResponse<user_addresses[]> = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message);
      }

      setAddresses(result.data ?? []);
    } catch (error) {
      console.error("Lỗi lấy danh sách địa chỉ:", error);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // GET PROVINCES
  // =========================

  const fetchProvinces = async () => {
    try {
      const response = await fetch("/api/users/addresses/province");

      const result: ApiResponse<provinces[]> = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message);
      }

      setProvincesList(result.data ?? []);
    } catch (error) {
      console.error("Lỗi lấy danh sách tỉnh/thành:", error);
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
  // INITIAL LOAD
  // =========================

  useEffect(() => {
    let isMounted = true;

    async function loadInitialData() {
      try {
        setLoading(true);
        // Gọi song song 2 API ban đầu
        await Promise.all([fetchAddresses(), fetchProvinces()]);
      } catch (error) {
        console.error("Lỗi tải dữ liệu ban đầu:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, []);

  // =========================
  // PROVINCE CHANGE
  // =========================

  const handleProvinceChange = (province: provinces | null) => {
    setForm((prev) => ({
      ...prev,
      province_id: province?.id ?? null,
      commune_id: null,
    }));

    setCommunesList([]);

    if (province) {
      fetchCommunes(province.id);
    }
  };

  // =========================
  // OPEN CREATE
  // =========================

  const handleCreate = () => {
    setEditingId(null);
    setForm(initialForm);
    setCommunesList([]);
    setShowForm(true);
  };

  // =========================
  // OPEN EDIT
  // =========================

  const handleEdit = async (address: user_addresses) => {
    setEditingId(address.id);

    setForm({
      recipient_name: address.recipient_name,
      phone: address.phone,
      province_id: address.province_id,
      commune_id: address.commune_id,
      address_line: address.address_line,
      note: address.note ?? "",
      is_default: address.is_default,
    });

    setShowForm(true);

    await fetchCommunes(address.province_id);
  };

  // =========================
  // SUBMIT
  // =========================

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.province_id || !form.commune_id) {
      alert("Vui lòng chọn tỉnh/thành và đơn vị cấp 2");
      return;
    }

    try {
      setSubmitting(true);

      const body = {
        recipient_name: form.recipient_name,
        phone: form.phone,
        province_id: form.province_id,
        commune_id: form.commune_id,
        address_line: form.address_line,
        note: form.note || undefined,
        is_default: form.is_default,
      };

      const url = editingId
        ? `/api/users/addresses/user-addresses/${editingId}`
        : "/api/users/addresses/user-addresses";

      const method = editingId ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const result: ApiResponse<user_addresses> = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message);
      }

      await fetchAddresses();

      setForm(initialForm);
      setCommunesList([]);
      setEditingId(null);
      setShowForm(false);
    } catch (error) {
      console.error("Lỗi lưu địa chỉ:", error);
      alert(error instanceof Error ? error.message : "Không thể lưu địa chỉ");
    } finally {
      setSubmitting(false);
    }
  };

  // =========================
  // DELETE
  // =========================

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm("Bạn có chắc muốn xóa địa chỉ này không?");

    if (!confirmed) return;

    try {
      const response = await fetch(
        `/api/users/addresses/user-addresses/${id}`,
        {
          method: "DELETE",
        },
      );

      const result: ApiResponse<null> = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message);
      }

      await fetchAddresses();
    } catch (error) {
      console.error("Lỗi xóa địa chỉ:", error);

      alert(error instanceof Error ? error.message : "Không thể xóa địa chỉ");
    }
  };

  // =========================
  // SELECTED OBJECTS
  // =========================

  const selectedProvince =
    provincesList.find((province) => province.id === form.province_id) ?? null;

  const selectedCommune =
    communesList.find((commune) => commune.id === form.commune_id) ?? null;

  // =========================
  // RENDER
  // =========================

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      {/* Header */}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Địa chỉ của tôi</h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Quản lý địa chỉ nhận hàng của bạn
          </p>
        </div>

        <Button onClick={handleCreate}>+ Thêm địa chỉ</Button>
      </div>

      {/* Form */}

      {showForm && (
        <div className="rounded-lg border bg-background p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-semibold">
              {editingId ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới"}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Người nhận */}

            <div className="grid gap-2">
              <Label htmlFor="recipient_name">Tên người nhận</Label>

              <Input
                id="recipient_name"
                value={form.recipient_name}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    recipient_name: event.target.value,
                  }))
                }
                placeholder="Nhập tên người nhận"
                required
              />
            </div>

            {/* Số điện thoại */}

            <div className="grid gap-2">
              <Label htmlFor="phone">Số điện thoại</Label>

              <Input
                id="phone"
                value={form.phone}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    phone: event.target.value,
                  }))
                }
                placeholder="Nhập số điện thoại"
                required
              />
            </div>

            {/* Tỉnh thành */}

            <div className="grid gap-2 bg-white">
              <Label>Tỉnh / Thành phố</Label>

              <Combobox
                items={provincesList}
                value={selectedProvince}
                itemToStringValue={(item) => item.name}
                itemToStringLabel={(item) => item.name}
                onValueChange={handleProvinceChange}
                // itemToStringValue={(item) => item.name}
              >
                <ComboboxInput placeholder="Chọn tỉnh / thành phố" />

                <ComboboxContent className="bg-white">
                  <ComboboxEmpty>
                    Không tìm thấy tỉnh / thành phố.
                  </ComboboxEmpty>

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

            {/* Commune */}

            <div className="grid gap-2">
              <Label>Phường / Xã / Đặc khu</Label>

              <Combobox
                items={communesList}
                value={selectedCommune}
                onValueChange={(commune) =>
                  setForm((prev) => ({
                    ...prev,
                    commune_id: commune?.id ?? null,
                  }))
                }
                disabled={!form.province_id || loadingCommunes}
                itemToStringValue={(item) => item.name}
                itemToStringLabel={(item) => item.name}
              >
                <ComboboxInput
                  placeholder={
                    loadingCommunes
                      ? "Đang tải..."
                      : "Chọn phường / xã / đặc khu"
                  }
                />

                <ComboboxContent className="bg-white">
                  <ComboboxEmpty>Không tìm thấy đơn vị cấp 2.</ComboboxEmpty>

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

            {/* Địa chỉ */}

            <div className="grid gap-2">
              <Label htmlFor="address_line">Địa chỉ cụ thể</Label>

              <Input
                id="address_line"
                value={form.address_line}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    address_line: event.target.value,
                  }))
                }
                placeholder="Số nhà, tên đường..."
                required
              />
            </div>

            {/* Ghi chú */}

            <div className="grid gap-2">
              <Label htmlFor="note">Ghi chú</Label>

              <Input
                id="note"
                value={form.note}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    note: event.target.value,
                  }))
                }
                placeholder="Ghi chú thêm (không bắt buộc)"
              />
            </div>

            {/* Default */}

            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={form.is_default}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    is_default: event.target.checked,
                  }))
                }
              />

              <span className="text-sm">Đặt làm địa chỉ mặc định</span>
            </label>

            {/* Actions */}

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setForm(initialForm);
                  setCommunesList([]);
                }}
              >
                Hủy
              </Button>

              <Button type="submit" disabled={submitting}>
                {submitting
                  ? "Đang lưu..."
                  : editingId
                    ? "Cập nhật"
                    : "Thêm địa chỉ"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Address List */}

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Danh sách địa chỉ</h2>

        {loading ? (
          <div className="rounded-lg border p-6 text-center text-sm text-muted-foreground">
            Đang tải danh sách địa chỉ...
          </div>
        ) : addresses.length === 0 ? (
          <div className="rounded-lg border p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Bạn chưa có địa chỉ nhận hàng nào.
            </p>

            <Button className="mt-4" onClick={handleCreate}>
              + Thêm địa chỉ
            </Button>
          </div>
        ) : (
          addresses.map((address) => {
            const province = provincesList.find(
              (item) => item.id === address.province_id,
            );

            const commune = communesList.find(
              (item) => item.id === address.commune_id,
            );

            return (
              <div
                key={address.id}
                className={`rounded-lg border p-5 ${
                  address.is_default ? "border-primary" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">
                        {address.recipient_name}
                      </h3>

                      {address.is_default && (
                        <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary bg-yellow-200">
                          Mặc định
                        </span>
                      )}
                    </div>

                    <p className="text-sm">{address.phone}</p>

                    <p className="text-sm text-muted-foreground">
                      {address.address_line}
                      {commune ? `, ${commune.name}` : ""}
                      {province ? `, ${province.name}` : ""}
                    </p>

                    {address.note && (
                      <p className="text-sm text-muted-foreground">
                        Ghi chú: {address.note}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(address)}
                    >
                      Sửa
                    </Button>

                    <Button
                      variant="destructive"
                      className="hover:bg-blue-400 bg-blue-500"
                      size="sm"
                      onClick={() => handleDelete(address.id)}
                    >
                      Xóa
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
