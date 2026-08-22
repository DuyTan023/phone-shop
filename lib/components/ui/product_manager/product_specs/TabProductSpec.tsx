/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type { spec_groups } from "@/app/generated/prisma/client";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  Check,
  CheckCircle,
  ChevronsUpDown,
  FolderPlus,
  KeyRound,
  Layers,
  Loader2,
  Plus,
  Tag,
  Trash2,
} from "lucide-react";
import React, { useEffect, useState } from "react";

export interface SpecGroup {
  id: number;
  name: string;
}

export interface SpecKey {
  id: number;
  group_id: number;
  name: string;
  spec_groups?: {
    id: number;
    name: string;
  };
}

export interface Unit {
  id: number;
  name: string;
  symbol: string;
}

export interface SpecItem {
  id?: number;
  product_id?: number;
  spec_key_id: number;
  spec_value: string;
  unit_id: number | null;
}

interface SpecsTabProps {
  productId?: number | string;
  initialSpecs?: SpecItem[];
  onChange?: (specs: SpecItem[]) => void;
}

interface CreateSpecKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (newCreatedKeyId?: number) => void;
  preselectedGroupId?: number | null;
}

const fetchData = async <T,>(
  url: string,
  errorMessage: string,
): Promise<T[]> => {
  try {
    const res = await fetch(url);
    const result = await res.json();

    if (!res.ok) throw new Error(result?.message || errorMessage);

    if (Array.isArray(result)) return result as T[];

    if (result?.data?.data && Array.isArray(result.data.data)) {
      return result.data.data as T[];
    }

    if (result && typeof result === "object") {
      if (Array.isArray(result.data)) return result.data as T[];
      if (Array.isArray(result.result)) return result.result as T[];
      if (Array.isArray(result.items)) return result.items as T[];
    }

    return [];
  } catch (error) {
    console.error(`[Fetch Error] ${url}:`, error);
    return [];
  }
};

function CreateSpecKeyForm({
  onClose,
  onSuccess,
  preselectedGroupId,
}: {
  onClose: () => void;
  onSuccess: (newCreatedKeyId?: number) => void;
  preselectedGroupId?: number | null;
}) {
  const [name, setName] = useState("");
  const [groupId, setGroupId] = useState<number | null>(
    preselectedGroupId ?? null,
  );
  const [groups, setGroups] = useState<spec_groups[] | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [openCombobox, setOpenCombobox] = useState(false);

  const isLoadingGroups = groups === null;

  useEffect(() => {
    let cancelled = false;

    fetch("/api/catalogs/spec_groups")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        const list = data.data?.data || data.data || data;
        setGroups(Array.isArray(list) ? list : []);
      })
      .catch((err) => {
        console.error("Lỗi fetch groups:", err);
        if (!cancelled) {
          setGroups([]);
          setErrorMessage("Không thể tải danh sách nhóm thông số");
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !groupId) return;

    setErrorMessage(null);

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/catalogs/spec_keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), group_id: groupId }),
      });

      const resData = await res.json().catch(() => null);

      if (res.ok && (resData?.success || resData?.data || resData?.id)) {
        const createdId =
          resData?.data?.id || resData?.id || resData?.data?.data?.id;
        onClose();
        onSuccess(createdId);
        return;
      }

      if (resData?.message) {
        setErrorMessage(resData.message);
      } else {
        switch (res.status) {
          case 409:
            setErrorMessage("Thông số đã tồn tại trong nhóm này.");
            break;
          case 400:
            setErrorMessage(
              "Dữ liệu đầu vào không hợp lệ. Vui lòng kiểm tra lại.",
            );
            break;
          case 404:
            setErrorMessage("Nhóm thông số chọn không tồn tại.");
            break;
          default:
            setErrorMessage(
              "Có lỗi xảy ra phía máy chủ (500). Vui lòng thử lại sau.",
            );
            break;
        }
      }
    } catch (error) {
      console.error("Lỗi tạo spec key:", error);
      setErrorMessage("Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const groupList = groups ?? [];
  const selectedGroup = groupList.find((g) => g.id === groupId);

  return (
    <>
      <DialogHeader className="space-y-1">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-slate-700">
            <KeyRound size={18} />
          </div>
          <div>
            <DialogTitle className="font-semibold text-slate-800 text-sm">
              Thêm thông số kỹ thuật
            </DialogTitle>
            <DialogDescription
              render={<div />}
              className="text-xs text-slate-500"
            >
              Tạo tên thông số mới thuộc nhóm thông số tương ứng.
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      {errorMessage && (
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs animate-in fade-in-50">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
          <div className="flex-1 font-medium">{errorMessage}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-slate-700">
            Nhóm thông số <span className="text-red-500">*</span>
          </Label>

          <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
            <PopoverTrigger
              render={
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openCombobox}
                  disabled={isLoadingGroups || isSubmitting}
                  className="w-full h-9 justify-between font-normal text-xs border-slate-200 focus:ring-slate-400 rounded-lg bg-white px-3"
                >
                  {isLoadingGroups ? (
                    <span className="text-slate-400 flex items-center gap-2">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Đang
                      tải...
                    </span>
                  ) : selectedGroup ? (
                    <span className="text-slate-800">{selectedGroup.name}</span>
                  ) : (
                    <span className="text-slate-400">
                      Chọn nhóm thông số...
                    </span>
                  )}
                  <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50 text-slate-500" />
                </Button>
              }
            />

            <PopoverContent
              className="w-full min-w-[300px] p-0 bg-white border-slate-200 z-[60] shadow-md rounded-lg"
              align="start"
            >
              <Command>
                <CommandInput
                  placeholder="Tìm nhóm thông số..."
                  className="h-9 text-xs"
                />
                <CommandList>
                  <CommandEmpty className="py-3 text-center text-xs text-slate-500">
                    Không tìm thấy nhóm nào.
                  </CommandEmpty>
                  <CommandGroup>
                    {groupList.map((group) => (
                      <CommandItem
                        key={group.id}
                        value={group.name}
                        onSelect={() => {
                          setGroupId(group.id);
                          setOpenCombobox(false);
                          if (errorMessage) setErrorMessage(null);
                        }}
                        className="text-xs py-2 cursor-pointer"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-3.5 w-3.5 text-slate-700",
                            groupId === group.id ? "opacity-100" : "opacity-0",
                          )}
                        />
                        {group.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="spec-name"
            className="text-xs font-medium text-slate-700"
          >
            Tên thông số <span className="text-red-500">*</span>
          </Label>
          <Input
            id="spec-name"
            placeholder="VD: Tần số quét, Độ sáng, Loại RAM..."
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errorMessage) setErrorMessage(null);
            }}
            disabled={isSubmitting}
            required
            className="h-9 text-xs border-slate-200 focus-visible:ring-slate-400 rounded-lg placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-3.5 py-1.5 h-auto text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Hủy
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !groupId || !name.trim()}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 h-auto text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg disabled:opacity-50 transition-colors shadow-sm"
          >
            {isSubmitting && <Loader2 size={14} className="animate-spin" />}
            Tạo mới
          </Button>
        </div>
      </form>
    </>
  );
}

export function CreateSpecKeyDialog({
  open,
  onOpenChange,
  onSuccess,
  preselectedGroupId,
}: CreateSpecKeyDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] bg-white border border-slate-100 p-5 gap-4 shadow-xl">
        {open && (
          <CreateSpecKeyForm
            onClose={() => onOpenChange(false)}
            onSuccess={onSuccess}
            preselectedGroupId={preselectedGroupId}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function ProductSpecsTab({
  productId,
  initialSpecs = [],
  onChange,
}: SpecsTabProps) {
  const [specGroups, setSpecGroups] = useState<SpecGroup[]>([]);
  const [specKeys, setSpecKeys] = useState<SpecKey[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);

  const [selectedSpecs, setSelectedSpecs] = useState<SpecItem[]>(initialSpecs);

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // State Dialog Tạo thuộc tính
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [targetGroupIdForCreate, setTargetGroupIdForCreate] = useState<
    number | null
  >(null);

  // State Xác nhận xóa
  const [deleteTarget, setDeleteTarget] = useState<SpecItem | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);

        const promises: Promise<any>[] = [
          fetchData<SpecGroup>(
            "/api/catalogs/spec_groups",
            "Không thể lấy nhóm thông số",
          ),
          fetchData<SpecKey>(
            "/api/catalogs/spec_keys?limit=1000",
            "Không thể lấy danh sách thuộc tính",
          ),
          fetchData<Unit>("/api/catalogs/units", "Không thể lấy đơn vị đo"),
        ];

        if (productId) {
          promises.push(
            fetchData<SpecItem>(
              `/api/product_manager/product_specs?product_id=${productId}&limit=1000`,
              "Không thể lấy thông số sản phẩm",
            ),
          );
        }

        const [groupsData, keysData, unitsData, productSpecsData] =
          await Promise.all(promises);

        if (isMounted) {
          setSpecGroups(groupsData);
          setSpecKeys(keysData);
          setUnits(unitsData);

          if (
            productSpecsData &&
            Array.isArray(productSpecsData) &&
            productSpecsData.length > 0
          ) {
            setSelectedSpecs(productSpecsData);
          } else if (initialSpecs && initialSpecs.length > 0) {
            setSelectedSpecs(initialSpecs);
          }

          setLoading(false);
        }
      } catch (err) {
        console.error("Lỗi tải dữ liệu thông số:", err);
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [productId]);

  const updateSpecsState = (newSpecs: SpecItem[]) => {
    setSelectedSpecs(newSpecs);
    if (onChange) onChange(newSpecs);
  };

  const getKeysForGroup = (groupId: number) => {
    if (!Array.isArray(specKeys)) return [];
    return specKeys.filter((k) => {
      const gId = k.group_id ?? k.spec_groups?.id;
      return Number(gId) === Number(groupId);
    });
  };

  const handleAddSpec = (groupId: number, specKeyId: number) => {
    if (!specKeyId) return;

    if (
      selectedSpecs.some((s) => Number(s.spec_key_id) === Number(specKeyId))
    ) {
      return;
    }

    const newSpec: SpecItem = {
      product_id: productId ? Number(productId) : undefined,
      spec_key_id: Number(specKeyId),
      spec_value: "",
      unit_id: null,
    };

    updateSpecsState([...selectedSpecs, newSpec]);
  };

  // Mở Dialog thêm thuộc tính cho nhóm cụ thể hoặc tạo chung
  const handleOpenCreateModal = (groupId?: number) => {
    setTargetGroupIdForCreate(groupId ?? null);
    setIsModalOpen(true);
  };

  // Xử lý sau khi Tạo mới Thuộc tính thành công
  const handleCreateSuccess = async (newCreatedKeyId?: number) => {
    try {
      // 1. Tải lại danh sách thuộc tính mới nhất từ máy chủ
      const updatedKeys = await fetchData<SpecKey>(
        "/api/catalogs/spec_keys?limit=1000",
        "Lỗi cập nhật danh sách thuộc tính",
      );
      setSpecKeys(updatedKeys);

      // 2. Nếu tìm thấy ID vừa tạo, tự động thêm ngay vào danh sách đã chọn
      let keyToAddId = newCreatedKeyId;
      if (!keyToAddId && updatedKeys.length > 0) {
        keyToAddId = updatedKeys[updatedKeys.length - 1].id;
      }

      if (keyToAddId) {
        const addedKeyObj = updatedKeys.find(
          (k) => Number(k.id) === Number(keyToAddId),
        );
        const targetGroup =
          addedKeyObj?.group_id ?? addedKeyObj?.spec_groups?.id;

        if (targetGroup) {
          handleAddSpec(targetGroup, Number(keyToAddId));
        }
      }

      setMessage({
        type: "success",
        text: "Thêm thuộc tính mới thành công và đã gán vào danh sách!",
      });
    } catch (error) {
      console.error("Lỗi cập nhật thuộc tính sau khi tạo:", error);
    }
  };

  const handleConfirmDeleteClick = (item: SpecItem) => {
    setDeleteTarget(item);
  };

  const handleExecuteDelete = async () => {
    if (!deleteTarget) return;

    if (deleteTarget.id) {
      setDeleting(true);
      try {
        const res = await fetch(
          `/api/product_manager/product_specs/${deleteTarget.id}`,
          { method: "DELETE" },
        );

        if (!res.ok) {
          const resData = await res.json().catch(() => ({}));
          throw new Error(resData.message || "Xóa thuộc tính thất bại");
        }

        const nextSpecs = selectedSpecs.filter(
          (s) => Number(s.spec_key_id) !== Number(deleteTarget.spec_key_id),
        );
        updateSpecsState(nextSpecs);

        setMessage({
          type: "success",
          text: "Đã xóa thông số khỏi cơ sở dữ liệu!",
        });
      } catch (err: any) {
        console.error("Lỗi xóa spec:", err);
        setMessage({
          type: "error",
          text: err.message || "Không thể xóa thuộc tính này",
        });
      } finally {
        setDeleting(false);
        setDeleteTarget(null);
      }
    } else {
      const nextSpecs = selectedSpecs.filter(
        (s) => Number(s.spec_key_id) !== Number(deleteTarget.spec_key_id),
      );
      updateSpecsState(nextSpecs);
      setDeleteTarget(null);
    }
  };

  const handleValueChange = (
    specKeyId: number,
    field: "spec_value" | "unit_id",
    val: any,
  ) => {
    const nextSpecs = selectedSpecs.map((item) => {
      if (Number(item.spec_key_id) === Number(specKeyId)) {
        return { ...item, [field]: val };
      }
      return item;
    });
    updateSpecsState(nextSpecs);
  };

  const handleSaveSpecs = async () => {
    if (!productId) {
      setMessage({ type: "error", text: "Chưa có ID sản phẩm để lưu" });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const promises = selectedSpecs.map((item) => {
        const payload = {
          product_id: Number(productId),
          spec_key_id: Number(item.spec_key_id),
          spec_value: item.spec_value,
          unit_id: item.unit_id ? Number(item.unit_id) : null,
        };

        if (item.id) {
          return fetch(`/api/product_manager/product_specs/${item.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }).then(async (res) => {
            const resData = await res.json();
            if (!res.ok)
              throw new Error(resData.message || "Lỗi cập nhật thông số");
            return resData;
          });
        } else {
          return fetch(`/api/product_manager/product_specs`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }).then(async (res) => {
            const resData = await res.json();
            if (!res.ok) throw new Error(resData.message || "Lỗi tạo thông số");
            return resData;
          });
        }
      });

      await Promise.all(promises);

      setMessage({
        type: "success",
        text: "Lưu tất cả thông số kỹ thuật thành công!",
      });
    } catch (err: any) {
      console.error("Save specs error:", err);
      setMessage({ type: "error", text: err.message || "Lỗi khi lưu dữ liệu" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500 font-medium">
        Đang tải danh mục thông số kỹ thuật...
      </div>
    );
  }

  const targetKeyName = deleteTarget
    ? specKeys.find((k) => Number(k.id) === Number(deleteTarget.spec_key_id))
        ?.name || `ID #${deleteTarget.spec_key_id}`
    : "";

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div>
          <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            Thông số kỹ thuật sản phẩm
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Chọn nhóm và điền chi tiết các thông số cho sản phẩm này.
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleOpenCreateModal()}
          className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-white text-slate-700 hover:bg-slate-100 text-xs font-medium rounded-lg border border-slate-300 shadow-sm transition"
        >
          <Tag className="w-4 h-4 text-slate-500" />
          Tạo thuộc tính mới
        </button>
      </div>

      {/* Alert */}
      {message && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-rose-50 text-rose-700 border border-rose-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          {message.text}
        </div>
      )}

      {/* Spec Groups List */}
      <div className="space-y-6">
        {specGroups.map((group) => {
          const availableKeys = getKeysForGroup(group.id);

          const unselectedKeys = availableKeys.filter(
            (k) =>
              !selectedSpecs.some(
                (s) => Number(s.spec_key_id) === Number(k.id),
              ),
          );

          const groupSelectedSpecs = selectedSpecs.filter((s) =>
            availableKeys.some((k) => Number(k.id) === Number(s.spec_key_id)),
          );

          return (
            <div
              key={group.id}
              className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm"
            >
              {/* Group Header */}
              <div className="bg-slate-100/80 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                <span className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                  <FolderPlus className="w-4 h-4 text-blue-600" />
                  {group.name}
                </span>

                {/* Nếu còn thuộc tính chưa chọn -> Hiển thị Dropdown */}
                {unselectedKeys.length > 0 ? (
                  <select
                    className="text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => {
                      if (e.target.value) {
                        handleAddSpec(group.id, Number(e.target.value));
                        e.target.value = "";
                      }
                    }}
                    defaultValue=""
                  >
                    <option value="" disabled>
                      + Thêm thuộc tính vào nhóm này
                    </option>
                    {unselectedKeys.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  /* Khi ĐÃ HẾT thuộc tính chưa dùng -> Hiển thị nút Nút Thêm Mới mở Dialog */
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleOpenCreateModal(group.id)}
                    className="h-8 text-xs font-medium bg-white text-slate-700 hover:bg-slate-50 border-dashed border-slate-300 hover:border-slate-400 gap-1.5 rounded-lg shadow-none"
                  >
                    <Plus className="w-3.5 h-3.5 text-slate-500" />
                    Thêm thuộc tính mới
                  </Button>
                )}
              </div>

              {/* Group Content */}
              <div className="p-4">
                {groupSelectedSpecs.length === 0 ? (
                  <div className="text-center py-6 border-2 border-dashed border-slate-100 rounded-lg">
                    <p className="text-xs text-slate-400">
                      Chưa chọn thuộc tính nào cho nhóm này
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {groupSelectedSpecs.map((item) => {
                      const specKeyObj = specKeys.find(
                        (k) => Number(k.id) === Number(item.spec_key_id),
                      );

                      return (
                        <div
                          key={item.spec_key_id}
                          className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-2.5 bg-slate-50/50 rounded-lg border border-slate-200/80 hover:border-slate-300 transition"
                        >
                          <div className="w-full sm:w-1/3 text-xs font-semibold text-slate-700 truncate">
                            {specKeyObj?.name ||
                              `Thuộc tính #${item.spec_key_id}`}
                          </div>

                          <div className="flex-1 w-full">
                            <input
                              type="text"
                              value={item.spec_value || ""}
                              onChange={(e) =>
                                handleValueChange(
                                  item.spec_key_id,
                                  "spec_value",
                                  e.target.value,
                                )
                              }
                              placeholder="Nhập giá trị (VD: 8GB, AMOLED...)"
                              className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          <div className="w-full sm:w-36">
                            <select
                              value={item.unit_id || ""}
                              onChange={(e) =>
                                handleValueChange(
                                  item.spec_key_id,
                                  "unit_id",
                                  e.target.value
                                    ? Number(e.target.value)
                                    : null,
                                )
                              }
                              className="w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">Không có ĐVT</option>
                              {units.map((u) => (
                                <option key={u.id} value={u.id}>
                                  {u.symbol
                                    ? `${u.symbol} (${u.name})`
                                    : u.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleConfirmDeleteClick(item)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Xóa thuộc tính"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Save Button */}
      {productId && (
        <div className="flex justify-end pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={handleSaveSpecs}
            disabled={saving}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-xl shadow-sm transition disabled:opacity-50"
          >
            {saving ? "Đang lưu..." : "Lưu thay đổi thông số"}
          </button>
        </div>
      )}

      {/* Create Spec Key Dialog */}
      <CreateSpecKeyDialog
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSuccess={handleCreateSuccess}
        preselectedGroupId={targetGroupIdForCreate}
      />

      {/* Confirm Delete Dialog */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-100 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="p-2 bg-rose-50 rounded-full">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-slate-800">
                Xác nhận xóa
              </h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              Bạn có chắc chắn muốn xóa thuộc tính{" "}
              <strong className="text-slate-900 font-semibold">
                `{targetKeyName}`
              </strong>{" "}
              {deleteTarget.id
                ? "khỏi CSDL của sản phẩm này không? Hành động này không thể hoàn tác."
                : "khỏi danh sách hiển thị không?"}
            </p>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition disabled:opacity-50"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleExecuteDelete}
                disabled={deleting}
                className="px-4 py-2 text-xs font-medium bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-sm transition disabled:opacity-50 flex items-center gap-1.5"
              >
                {deleting ? "Đang xóa..." : "Xác nhận xóa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
