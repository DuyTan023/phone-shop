"use client";

import { SectionHeader } from "@/app/admin/catalogs/page";
import type { ApiResponse } from "@/lib/types/public/types";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { ChipFormDialog } from "./ChipFormDialog";
import { DeleteDialog } from "./DeleteDialog";

export interface ChipItem {
  id: string | number;
  value: string;
}

interface ChipListSectionProps {
  apiUrl: string;
  title: string;
  description?: string;
  unit?: string;
}

export function ChipListSection({
  apiUrl,
  title,
  description,
  unit,
}: ChipListSectionProps) {
  const [data, setData] = useState<ChipItem[]>([]);
  const [loading, setLoading] = useState(true);

  // State điều khiển Dialog
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ChipItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ChipItem | null>(null);

  // Hàm reload dữ liệu dùng riêng cho callback
  const refetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error("Fetch failed");
      const json: ApiResponse<ChipItem[]> = await res.json();
      if (json.data) setData(json.data);
    } catch (err) {
      console.error("Fetch chip list failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isSubscribed = true;

    async function loadData() {
      try {
        const res = await fetch(apiUrl);
        if (!res.ok) throw new Error("Fetch failed");
        const json: ApiResponse<ChipItem[]> = await res.json();
        if (isSubscribed && json.data) {
          setData(json.data);
        }
      } catch (err) {
        console.error("Fetch chip list failed:", err);
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isSubscribed = false;
    };
  }, [apiUrl]);

  // Các hàm mở Modal
  function openAddDialog() {
    setEditingItem(null);
    setFormOpen(true);
  }

  function openEditDialog(item: ChipItem) {
    setEditingItem(item);
    setFormOpen(true);
  }

  function openDeleteDialog(item: ChipItem) {
    setDeleteTarget(item);
  }

  // Xử lý Xóa item
  async function handleDeleteConfirm() {
    if (!deleteTarget) return;

    const res = await fetch(`${apiUrl}/${deleteTarget.id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      throw new Error("Delete failed");
    }

    setData((prev) => prev.filter((d) => d.id !== deleteTarget.id));
    setDeleteTarget(null);
  }

  const existingValues = data.map((item) => item.value);

  return (
    <div className="space-y-4">
      <SectionHeader
        title={title}
        description={description}
        onAdd={openAddDialog}
        addLabel={`Thêm ${unit ?? ""}`}
      />

      <div className="flex flex-wrap gap-2 mb-5">
        {loading ? (
          <span className="text-sm text-slate-400">Đang tải...</span>
        ) : (
          data.map((item) => (
            <div
              key={item.id}
              className="group flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-lg px-3 py-2 transition-colors"
            >
              <span className="font-medium text-slate-700 dark:text-slate-200 text-sm">
                {item.value}
              </span>
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 ml-1">
                <button
                  type="button"
                  className="p-1 rounded text-slate-400 hover:text-blue-500 transition-colors"
                  onClick={() => openEditDialog(item)}
                  title="Chỉnh sửa"
                >
                  <Pencil size={11} />
                </button>
                <button
                  type="button"
                  className="p-1 rounded text-slate-400 hover:text-red-500 transition-colors"
                  onClick={() => openDeleteDialog(item)}
                  title="Xóa"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            </div>
          ))
        )}

        <button
          type="button"
          className="flex items-center gap-1.5 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-400 hover:text-blue-500 hover:border-blue-300 transition-colors text-sm"
          onClick={openAddDialog}
        >
          <Plus size={13} />
          Thêm tùy chọn
        </button>
      </div>

      {/* Dialog Thêm / Chỉnh sửa */}
      <ChipFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        apiUrl={apiUrl}
        editingItem={
          editingItem
            ? { id: String(editingItem.id), value: editingItem.value }
            : null
        }
        existingValues={existingValues}
        onSuccess={refetchData}
      />

      {/* Dialog Xác nhận Xóa */}
      <DeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        itemName={deleteTarget?.value ?? ""}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

export function RamSelection() {
  return (
    <ChipListSection
      apiUrl="/api/catalogs/rams"
      title="RAM"
      description="Danh sách tùy chọn dung lượng RAM"
      unit="RAM"
    />
  );
}

export function StorageSelection() {
  return (
    <ChipListSection
      apiUrl="/api/catalogs/storages"
      title="Bộ nhớ trong"
      description="Danh sách tùy chọn dung lượng lưu trữ"
      unit="Bộ nhớ"
    />
  );
}
