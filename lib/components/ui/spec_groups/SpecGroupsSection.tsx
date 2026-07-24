"use client";

import type { spec_groups } from "@/app/generated/prisma/client";
import type { ApiResponse } from "@/lib/types/public/types";
import {
  AlertCircle,
  Edit2,
  Inbox,
  Loader2,
  Plus,
  Search,
  Settings2,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { SpecGroupFormModal } from "./SpecGroupFormModal";

const API_URL = "/api/catalogs/spec_groups";

export default function SpecGroupsSection() {
  const [groups, setGroups] = useState<spec_groups[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State quản lý Modal Form (Thêm / Sửa)
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<spec_groups | null>(null);

  // State quản lý Modal Xóa
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<spec_groups | null>(null);

  // Hàm reload dữ liệu dùng thủ công sau khi Thêm/Sửa/Xóa
  const reloadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_URL);
      const data: ApiResponse<spec_groups[]> = await res.json();

      if (data.success && data.data) {
        setGroups(data.data);
      } else {
        setError(data.message || "Không thể tải danh sách");
      }
    } catch {
      setError("Lỗi kết nối máy chủ");
    } finally {
      setLoading(false);
    }
  };

  // CÁCH 2: Tách logic khởi tạo vào hàm async nội bộ kèm cờ isMounted
  useEffect(() => {
    let isMounted = true;

    async function initData() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(API_URL);
        const data: ApiResponse<spec_groups[]> = await res.json();

        if (isMounted) {
          if (data.success && data.data) {
            setGroups(data.data);
          } else {
            setError(data.message || "Không thể tải danh sách");
          }
        }
      } catch {
        if (isMounted) {
          setError("Lỗi kết nối máy chủ");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    initData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Lọc danh sách theo từ khóa tìm kiếm
  const filteredGroups = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return groups;
    return groups.filter((g) => g.name.toLowerCase().includes(query));
  }, [groups, searchQuery]);

  // Handlers mở modal
  const handleOpenAdd = () => {
    setSelectedGroup(null);
    setFormModalOpen(true);
  };

  const handleOpenEdit = (group: spec_groups) => {
    setSelectedGroup(group);
    setFormModalOpen(true);
  };

  const handleOpenDelete = (group: spec_groups) => {
    setGroupToDelete(group);
    setDeleteModalOpen(true);
  };

  // Cập nhật lại danh sách sau khi thao tác modal thành công
  const handleFormSuccess = () => {
    reloadData();
  };

  const handleDeleteSuccess = () => {
    if (groupToDelete) {
      setGroups((prev) => prev.filter((g) => g.id !== groupToDelete.id));
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Button Thêm */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">
            Nhóm thông số kỹ thuật
          </h2>
          <p className="text-xs text-slate-500">
            Màn hình, Pin, Cấu hình, Camera, Kết nối...
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-blue-400 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
        >
          <Plus size={16} />
          Thêm nhóm
        </button>
      </div>

      {/* Input Tìm kiếm */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          placeholder="Tìm kiếm nhóm thông số..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
        />
      </div>

      {/* Hiển thị lỗi fetch dữ liệu */}
      {error && (
        <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Danh sách nhóm thông số */}
      {loading ? (
        <div className="flex items-center justify-center py-12 text-slate-400">
          <Loader2 size={24} className="animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredGroups.map((group) => (
            <div
              key={group.id}
              className="group flex items-center justify-between p-3.5 bg-white border border-slate-200 rounded-xl hover:border-slate-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-3 min-w-0 pr-2">
                <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
                  <Settings2 size={16} className="text-teal-600" />
                </div>
                <span className="font-medium text-slate-800 text-sm truncate">
                  {group.name}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleOpenEdit(group)}
                  className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-slate-100 rounded-md transition-colors"
                  title="Chỉnh sửa"
                >
                  <Edit2 size={15} />
                </button>
                <button
                  onClick={() => handleOpenDelete(group)}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  title="Xóa"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}

          {/* Card thêm nhanh */}
          <button
            onClick={handleOpenAdd}
            className="flex items-center justify-center gap-2 p-3.5 border border-dashed border-slate-300 rounded-xl text-slate-400 hover:text-teal-600 hover:border-teal-400 hover:bg-teal-50/30 transition-all text-sm font-medium min-h-[58px]"
          >
            <Plus size={16} />
            Thêm nhóm
          </button>
        </div>
      )}

      {/* Hiển thị khi tìm kiếm không ra kết quả */}
      {!loading && !error && filteredGroups.length === 0 && searchQuery && (
        <div className="flex flex-col items-center justify-center py-8 text-center text-slate-500">
          <Inbox size={32} className="text-slate-300 mb-2" />
          <p className="text-sm">Không tìm thấy nhóm thông số phù hợp</p>
        </div>
      )}

      {/* Dialog Form Thêm / Sửa */}
      <SpecGroupFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        initialData={selectedGroup}
        onSuccess={handleFormSuccess}
      />

      {/* Dialog Xác nhận Xóa */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        group={groupToDelete}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
