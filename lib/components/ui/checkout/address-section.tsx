// components/checkout/address-section.tsx

"use client";

import { Check, ChevronDown, ChevronUp, MapPin, Plus } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  AddAddressDialog,
  type AddressForm,
} from "@/lib/components/ui/checkout/add-address-dialog";

import type {
  communes,
  provinces,
  user_addresses,
} from "@/app/generated/prisma/client";

type AddressSectionProps = {
  addresses: user_addresses[];
  provincesList: provinces[];
  communesList: communes[];
  selectedAddressId: number | null;
  onSelectAddress: (id: number) => void;
  onAddAddress: (address: AddressForm) => void;
};

export function AddressSection({
  addresses,
  provincesList,
  communesList,
  selectedAddressId,
  onSelectAddress,
  onAddAddress,
}: AddressSectionProps) {
  const [isOpenList, setIsOpenList] = useState(false);

  const handleAddAddress = (newAddressData: AddressForm) => {
    onAddAddress(newAddressData);
  };

  const currentAddress =
    addresses.find((addr) => addr.id === selectedAddressId) ||
    addresses.find((addr) => addr.is_default) ||
    addresses[0];

  const currentProvince = currentAddress
    ? provincesList.find((p) => p.id === currentAddress.province_id)
    : null;
  const currentCommune = currentAddress
    ? communesList.find((c) => c.id === currentAddress.commune_id)
    : null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <CardTitle className="text-base">2. Địa chỉ nhận hàng</CardTitle>

          <AddAddressDialog onAddAddress={handleAddAddress}>
            <Button variant="outline" size="sm">
              <Plus className="size-4" />
              Thêm địa chỉ
            </Button>
          </AddAddressDialog>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {addresses.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Chưa có địa chỉ nào. Vui lòng thêm địa chỉ mới.
          </p>
        ) : (
          <>
            {/* CARD HIỂN THỊ ĐỊA CHỈ ĐANG CHỌN (CÓ VIỀN XANH, NỀN XANH NHẠT RẤT RÕ) */}
            {currentAddress && (
              <div
                onClick={() => setIsOpenList(!isOpenList)}
                className="w-full rounded-xl border-2 border-blue-500 bg-blue-50/60 p-4 text-left transition cursor-pointer shadow-sm hover:bg-blue-50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-3 min-w-0 flex-1">
                    <div className="pt-0.5">
                      <span className="flex size-5 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm">
                        <Check className="size-3 stroke-[3]" />
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-sm text-blue-900">
                          {currentAddress.recipient_name}
                        </span>
                        <span className="text-xs font-medium text-slate-600">
                          {currentAddress.phone}
                        </span>
                        {currentAddress.is_default && (
                          <Badge className="bg-blue-600 text-white text-[10px] px-1.5 py-0">
                            Mặc định
                          </Badge>
                        )}
                      </div>

                      <div className="mt-1.5 flex gap-1.5 text-xs text-slate-700">
                        <MapPin className="mt-0.5 size-3.5 shrink-0 text-blue-600" />
                        <span className="truncate font-medium">
                          {currentAddress.address_line}
                          {currentCommune ? `, ${currentCommune.name}` : ""}
                          {currentProvince ? `, ${currentProvince.name}` : ""}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-100/50 shrink-0"
                  >
                    {isOpenList ? (
                      <>
                        Thu gọn <ChevronUp className="ml-1 size-3.5" />
                      </>
                    ) : (
                      <>
                        Thay đổi <ChevronDown className="ml-1 size-3.5" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* DANH SÁCH ĐỊA CHỈ SỔ XUỐNG */}
            {isOpenList && (
              <div className="space-y-2.5 pt-3 border-t border-slate-200 animate-in fade-in-50 duration-200">
                <p className="text-xs font-semibold text-slate-500 mb-2">
                  Chọn địa chỉ giao hàng khác:
                </p>
                {addresses.map((address) => {
                  const isSelected = selectedAddressId === address.id;

                  const province = provincesList.find(
                    (p) => p.id === address.province_id,
                  );
                  const commune = communesList.find(
                    (c) => c.id === address.commune_id,
                  );

                  return (
                    <button
                      key={address.id}
                      type="button"
                      onClick={() => {
                        onSelectAddress(address.id);
                        setIsOpenList(false); // Tự động đóng lại sau khi chọn
                      }}
                      className={`w-full rounded-xl border p-3.5 text-left transition-all ${
                        isSelected
                          ? "border-2 border-blue-500 bg-blue-50/70 shadow-sm ring-1 ring-blue-500"
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/80"
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className="pt-0.5">
                          <span
                            className={`flex size-5 items-center justify-center rounded-full transition-all ${
                              isSelected
                                ? "bg-blue-600 text-white shadow-sm"
                                : "border-2 border-slate-300 bg-white"
                            }`}
                          >
                            {isSelected && (
                              <Check className="size-3 stroke-[3]" />
                            )}
                          </span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`text-sm ${
                                isSelected
                                  ? "font-bold text-blue-900"
                                  : "font-semibold text-slate-800"
                              }`}
                            >
                              {address.recipient_name}
                            </span>

                            <span className="text-xs font-medium text-slate-600">
                              {address.phone}
                            </span>

                            {address.is_default && (
                              <Badge
                                className={
                                  isSelected
                                    ? "bg-blue-600 text-white text-[10px] px-1.5 py-0"
                                    : "bg-slate-100 text-slate-700 text-[10px] px-1.5 py-0"
                                }
                              >
                                Mặc định
                              </Badge>
                            )}
                          </div>

                          <div className="mt-1.5 flex gap-1.5 text-xs text-slate-600">
                            <MapPin
                              className={`mt-0.5 size-3.5 shrink-0 ${
                                isSelected ? "text-blue-600" : "text-slate-400"
                              }`}
                            />
                            <span
                              className={
                                isSelected ? "font-medium text-slate-900" : ""
                              }
                            >
                              {address.address_line}
                              {commune ? `, ${commune.name}` : ""}
                              {province ? `, ${province.name}` : ""}
                            </span>
                          </div>

                          {address.note && (
                            <p className="mt-1.5 text-[11px] text-slate-500 italic">
                              Ghi chú: {address.note}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
