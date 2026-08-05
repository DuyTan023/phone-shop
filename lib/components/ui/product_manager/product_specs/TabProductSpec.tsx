/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TabsContent } from "@/components/ui/tabs";
import { Layers, Plus, Ruler, Save, Tag, Trash2 } from "lucide-react";
import { useState } from "react";

// Mock Data ban đầu từ Database
const INITIAL_GROUPS = [
  { id: 1, name: "Màn hình" },
  { id: 2, name: "Cấu hình & Bộ nhớ" },
  { id: 3, name: "Camera" },
  { id: 4, name: "Pin & Sạc" },
];

const INITIAL_KEYS = [
  { id: 1, group_id: 1, name: "Kích thước màn hình" },
  { id: 2, group_id: 1, name: "Công nghệ màn hình" },
  { id: 3, group_id: 1, name: "Tần số quét" },
  { id: 4, group_id: 2, name: "Chip xử lý (CPU)" },
  { id: 5, group_id: 2, name: "Chip đồ họa (GPU)" },
  { id: 6, group_id: 3, name: "Camera sau" },
  { id: 7, group_id: 3, name: "Camera trước" },
  { id: 8, group_id: 4, name: "Dung lượng pin" },
  { id: 9, group_id: 4, name: "Công suất sạc" },
];

const INITIAL_UNITS = [
  { id: 1, name: "Inches", symbol: "inch" },
  { id: 2, name: "Hertz", symbol: "Hz" },
  { id: 3, name: "Milliampere-hour", symbol: "mAh" },
  { id: 4, name: "Watt", symbol: "W" },
  { id: 5, name: "Megapixel", symbol: "MP" },
  { id: 6, name: "Gigabyte", symbol: "GB" },
];

interface SpecItem {
  tempId: string;
  spec_key_id: number | null;
  spec_value: string;
  unit_id: number | null;
}

export default function SpecsTabContent() {
  // Master Master Data States
  const [groups, setGroups] = useState(INITIAL_GROUPS);
  const [keys, setKeys] = useState(INITIAL_KEYS);
  const [units, setUnits] = useState(INITIAL_UNITS);

  // Form Value State
  const [specs, setSpecs] = useState<SpecItem[]>([
    { tempId: "1", spec_key_id: 1, spec_value: "6.7", unit_id: 1 },
    { tempId: "2", spec_key_id: 3, spec_value: "120", unit_id: 2 },
    { tempId: "3", spec_key_id: 4, spec_value: "Apple A17 Pro", unit_id: null },
    { tempId: "4", spec_key_id: 8, spec_value: "4422", unit_id: 3 },
    { tempId: "5", spec_key_id: 9, spec_value: "20", unit_id: 4 },
  ]);

  // Dialog States cho việc tạo mới Master Data
  const [isAddGroupOpen, setIsAddGroupOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

  const [isAddKeyOpen, setIsAddKeyOpen] = useState(false);
  const [selectedGroupIdForKey, setSelectedGroupIdForKey] = useState<
    number | null
  >(null);
  const [newKeyName, setNewKeyName] = useState("");

  const [isAddUnitOpen, setIsAddUnitOpen] = useState(false);
  const [newUnitName, setNewUnitName] = useState("");
  const [newUnitSymbol, setNewUnitSymbol] = useState("");

  // Handler: Thêm Nhóm Mới (spec_groups)
  const handleCreateGroup = () => {
    if (!newGroupName.trim()) return;
    const newGroup = {
      id: Date.now(),
      name: newGroupName.trim(),
    };
    setGroups((prev) => [...prev, newGroup]);
    setNewGroupName("");
    setIsAddGroupOpen(false);
  };

  // Handler: Thêm Thông Số Mới (spec_keys)
  const handleCreateKey = () => {
    if (!newKeyName.trim() || !selectedGroupIdForKey) return;
    const newKey = {
      id: Date.now(),
      group_id: selectedGroupIdForKey,
      name: newKeyName.trim(),
    };
    setKeys((prev) => [...prev, newKey]);

    // Tự động thêm một dòng spec chuẩn bị nhập cho key mới tạo này
    setSpecs((prev) => [
      ...prev,
      {
        tempId: Date.now().toString(),
        spec_key_id: newKey.id,
        spec_value: "",
        unit_id: null,
      },
    ]);

    setNewKeyName("");
    setIsAddKeyOpen(false);
  };

  // Handler: Thêm Đơn Vị Mới (units)
  const handleCreateUnit = () => {
    if (!newUnitName.trim() || !newUnitSymbol.trim()) return;
    const newUnit = {
      id: Date.now(),
      name: newUnitName.trim(),
      symbol: newUnitSymbol.trim(),
    };
    setUnits((prev) => [...prev, newUnit]);
    setNewUnitName("");
    setNewUnitSymbol("");
    setIsAddUnitOpen(false);
  };

  // Thao tác với danh sách Giá trị sản phẩm (product_specs)
  const handleAddSpecRow = (defaultKeyId?: number) => {
    setSpecs((prev) => [
      ...prev,
      {
        tempId: Date.now().toString(),
        spec_key_id: defaultKeyId || null,
        spec_value: "",
        unit_id: null,
      },
    ]);
  };

  const handleUpdateSpec = (
    tempId: string,
    field: keyof SpecItem,
    value: any,
  ) => {
    setSpecs((prev) =>
      prev.map((item) =>
        item.tempId === tempId ? { ...item, [field]: value } : item,
      ),
    );
  };

  const handleRemoveSpec = (tempId: string) => {
    setSpecs((prev) => prev.filter((item) => item.tempId !== tempId));
  };

  return (
    <TabsContent value="specs" className="m-0 focus-visible:outline-none">
      <div className="rounded-xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Thông số kỹ thuật chi tiết
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Thiết lập thông số theo danh mục nhóm, đơn vị & trường dữ liệu.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddUnitOpen(true)}
              className="gap-1.5 text-xs border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              <Ruler className="h-3.5 w-3.5" />
              Thêm Đơn Vị
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddGroupOpen(true)}
              className="gap-1.5 text-xs border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              <Plus className="h-3.5 w-3.5" />
              Tạo Nhóm Mới
            </Button>
            <Button
              type="button"
              size="sm"
              className="gap-1.5 text-xs bg-violet-600 hover:bg-violet-700 text-white"
            >
              <Save className="h-3.5 w-3.5" />
              Lưu cấu hình
            </Button>
          </div>
        </div>

        {/* Form Body - Render theo nhóm */}
        <div className="p-6 space-y-6">
          {groups.map((group) => {
            const groupKeys = keys.filter((k) => k.group_id === group.id);
            const groupKeyIds = groupKeys.map((k) => k.id);

            // Tìm các item spec người dùng đã chọn nằm trong nhóm này
            const groupSpecs = specs.filter(
              (s) => s.spec_key_id && groupKeyIds.includes(s.spec_key_id),
            );

            return (
              <div
                key={group.id}
                className="border border-slate-200/80 rounded-lg p-4 bg-slate-50/30 space-y-3"
              >
                {/* Group Header */}
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                  <div className="flex items-center gap-2 text-slate-800 font-semibold text-xs uppercase tracking-wider">
                    <Layers className="h-3.5 w-3.5 text-violet-600" />
                    {group.name}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedGroupIdForKey(group.id);
                        setIsAddKeyOpen(true);
                      }}
                      className="h-7 text-xs text-slate-600 hover:text-violet-600 hover:bg-violet-50 px-2"
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      Thêm thuộc tính
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const firstKeyInGroup = groupKeys[0];
                        handleAddSpecRow(firstKeyInGroup?.id);
                      }}
                      className="h-7 text-xs text-violet-600 hover:text-violet-700 hover:bg-violet-50 px-2"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Thêm dòng
                    </Button>
                  </div>
                </div>

                {/* Listing spec rows inside group */}
                {groupSpecs.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-1">thêm</p>
                ) : (
                  <div className="space-y-2.5">
                    {groupSpecs.map((item) => (
                      <div
                        key={item.tempId}
                        className="flex items-center gap-2 bg-white p-2 rounded-md border border-slate-200/80 shadow-2xs"
                      >
                        {/* 1. Chọn spec_key */}
                        <div className="w-1/3">
                          <Select
                            value={item.spec_key_id?.toString() || ""}
                            onValueChange={(val) =>
                              handleUpdateSpec(
                                item.tempId,
                                "spec_key_id",
                                Number(val),
                              )
                            }
                          >
                            <SelectTrigger className="h-8 text-xs border-slate-200">
                              <SelectValue placeholder="Chọn thuộc tính" />
                            </SelectTrigger>
                            <SelectContent>
                              {groupKeys.map((key) => (
                                <SelectItem
                                  key={key.id}
                                  value={key.id.toString()}
                                  className="text-xs"
                                >
                                  {key.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* 2. Nhập spec_value */}
                        <div className="flex-1">
                          <Input
                            placeholder="Nhập giá trị..."
                            value={item.spec_value}
                            onChange={(e) =>
                              handleUpdateSpec(
                                item.tempId,
                                "spec_value",
                                e.target.value,
                              )
                            }
                            className="h-8 text-xs border-slate-200"
                          />
                        </div>

                        {/* 3. Chọn unit (Đơn vị) */}
                        <div className="w-28">
                          <Select
                            value={item.unit_id?.toString() || "none"}
                            onValueChange={(val) =>
                              handleUpdateSpec(
                                item.tempId,
                                "unit_id",
                                val === "none" ? null : Number(val),
                              )
                            }
                          >
                            <SelectTrigger className="h-8 text-xs border-slate-200 text-slate-600">
                              <SelectValue placeholder="Đơn vị" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none" className="text-xs">
                                -- Không --
                              </SelectItem>
                              {units.map((unit) => (
                                <SelectItem
                                  key={unit.id}
                                  value={unit.id.toString()}
                                  className="text-xs"
                                >
                                  {unit.symbol} ({unit.name})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* 4. Nút Xóa */}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveSpec(item.tempId)}
                          className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* --- DIALOG 1: THÊM NHÓM MỚI (spec_groups) --- */}
      <Dialog open={isAddGroupOpen} onOpenChange={setIsAddGroupOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              Thêm Nhóm Thông Số Mới
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Tên Nhóm (spec_groups.name)</Label>
              <Input
                placeholder="VD: Khả năng kết nối, Thiết kế..."
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddGroupOpen(false)}
              className="text-xs"
            >
              Hủy
            </Button>
            <Button
              size="sm"
              onClick={handleCreateGroup}
              className="text-xs bg-violet-600 hover:bg-violet-700 text-white"
            >
              Tạo Nhóm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- DIALOG 2: THÊM THUỘC TÍNH MỚI VÀO NHÓM (spec_keys) --- */}
      <Dialog open={isAddKeyOpen} onOpenChange={setIsAddKeyOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              Thêm Thuộc Tính Mới
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Thuộc Nhóm</Label>
              <Select
                value={selectedGroupIdForKey?.toString() || ""}
                onValueChange={(val) => setSelectedGroupIdForKey(Number(val))}
              >
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Chọn nhóm" />
                </SelectTrigger>
                <SelectContent>
                  {groups.map((g) => (
                    <SelectItem
                      key={g.id}
                      value={g.id.toString()}
                      className="text-xs"
                    >
                      {g.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Tên Thuộc Tính (spec_keys.name)</Label>
              <Input
                placeholder="VD: NFC, Chống nước, Bluetooth..."
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddKeyOpen(false)}
              className="text-xs"
            >
              Hủy
            </Button>
            <Button
              size="sm"
              onClick={handleCreateKey}
              className="text-xs bg-violet-600 hover:bg-violet-700 text-white"
            >
              Thêm Thuộc Tính
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- DIALOG 3: THÊM ĐƠN VỊ MỚI (units) --- */}
      <Dialog open={isAddUnitOpen} onOpenChange={setIsAddUnitOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              Thêm Đơn Vị Đo Lường Mới
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Tên Đơn Vị (units.name)</Label>
              <Input
                placeholder="VD: Nit, Gram, Millimeter..."
                value={newUnitName}
                onChange={(e) => setNewUnitName(e.target.value)}
                className="text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Ký Hiệu Hiển Thị (units.symbol)</Label>
              <Input
                placeholder="VD: nits, g, mm..."
                value={newUnitSymbol}
                onChange={(e) => setNewUnitSymbol(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddUnitOpen(false)}
              className="text-xs"
            >
              Hủy
            </Button>
            <Button
              size="sm"
              onClick={handleCreateUnit}
              className="text-xs bg-violet-600 hover:bg-violet-700 text-white"
            >
              Thêm Đơn Vị
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TabsContent>
  );
}
