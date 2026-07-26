"use client";

import { HardDrive, Loader2, Pencil } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type Unit = "GB" | "TB";

export type ChipItem = {
  id: string;
  value: string;
};

export type ChipFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apiUrl: string;
  editingItem?: ChipItem | null;
  existingValues?: string[];
  onSuccess: () => void;
};

function parseValue(value?: string) {
  if (!value) return { amount: "", unit: "GB" as Unit };
  const match = value.trim().match(/^(\d+(\.\d+)?)\s*(GB|TB)$/i);
  if (!match) return { amount: "", unit: "GB" as Unit };
  return {
    amount: match[1],
    unit: match[3].toUpperCase() as Unit,
  };
}

export function ChipFormDialog({
  open,
  onOpenChange,
  apiUrl,
  editingItem,
  existingValues = [],
  onSuccess,
}: ChipFormDialogProps) {
  const [loading, setLoading] = useState(false);

  function handleOpenChange(newOpen: boolean) {
    if (loading) return;
    onOpenChange(newOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-[440px] bg-white border border-slate-100 p-5 gap-4"
        onEscapeKeyDown={(e) => loading && e.preventDefault()}
        onPointerDownOutside={(e) => loading && e.preventDefault()}
      >
        {open && (
          <ChipForm
            key={editingItem?.id ?? "new"}
            apiUrl={apiUrl}
            editingItem={editingItem}
            existingValues={existingValues}
            onSuccess={onSuccess}
            onOpenChange={onOpenChange}
            loading={loading}
            setLoading={setLoading}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

interface ChipFormProps extends Omit<ChipFormDialogProps, "open"> {
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

function ChipForm({
  apiUrl,
  editingItem,
  existingValues = [],
  onSuccess,
  onOpenChange,
  loading,
  setLoading,
}: ChipFormProps) {
  const isEdit = !!editingItem;
  const parsed = parseValue(editingItem?.value);

  const [amount, setAmount] = useState(parsed.amount);
  const [unit, setUnit] = useState<Unit>(parsed.unit);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const trimmedAmount = amount.trim();
    if (
      !trimmedAmount ||
      Number(trimmedAmount) <= 0 ||
      isNaN(Number(trimmedAmount))
    ) {
      setError("Vui lòng nhập giá trị hợp lệ lớn hơn 0");
      return;
    }

    const newValue = `${trimmedAmount}${unit}`;

    const isDuplicate = existingValues.some((v) => {
      if (
        isEdit &&
        v.trim().toUpperCase() === editingItem.value.trim().toUpperCase()
      ) {
        return false;
      }
      return v.trim().toUpperCase() === newValue.toUpperCase();
    });

    if (isDuplicate) {
      setError("Dung lượng này đã tồn tại trong danh sách");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(isEdit ? `${apiUrl}/${editingItem.id}` : apiUrl, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: newValue }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || "Lưu thông tin thất bại");
      }

      onSuccess();
      onOpenChange(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Có lỗi xảy ra, vui lòng thử lại",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader className="space-y-1">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-slate-700">
            {isEdit ? <Pencil size={18} /> : <HardDrive size={18} />}
          </div>
          <div>
            <DialogTitle className="font-semibold text-slate-800 text-sm">
              {isEdit ? "Cập nhật dung lượng" : "Thêm dung lượng mới"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              {isEdit
                ? "Chỉnh sửa thông số dung lượng lưu trữ hiện tại."
                : "Nhập thông số dung lượng lưu trữ mới cho danh mục."}
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-2.5 items-end">
          <div className="col-span-2 space-y-1.5">
            <Label
              htmlFor="chip-amount"
              className="text-xs font-medium text-slate-700"
            >
              Giá trị <span className="text-red-500">*</span>
            </Label>
            <Input
              id="chip-amount"
              type="number"
              min="0"
              step="any"
              placeholder="VD: 8, 16, 128"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                if (error) setError("");
              }}
              disabled={loading}
              autoFocus
              className="h-9 text-xs border-slate-200 focus-visible:ring-slate-400 rounded-lg placeholder:text-slate-400"
            />
          </div>

          <div className="col-span-1 space-y-1.5">
            <Label className="text-xs font-medium text-slate-700">Đơn vị</Label>
            <Select
              value={unit}
              onValueChange={(v) => {
                setUnit(v as Unit);
                if (error) setError("");
              }}
              disabled={loading}
            >
              <SelectTrigger className="h-9 text-xs border-slate-200 focus:ring-slate-400 rounded-lg bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200 text-xs">
                <SelectItem value="GB" className="text-xs cursor-pointer">
                  GB
                </SelectItem>
                <SelectItem value="TB" className="text-xs cursor-pointer">
                  TB
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {error && (
          <div className="p-2.5 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg">
            {error}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={() => onOpenChange(false)}
          disabled={loading}
          className="px-3.5 py-1.5 h-auto text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          Hủy
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 h-auto text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg disabled:opacity-50 transition-colors shadow-sm"
        >
          {loading && <Loader2 size={14} className="animate-spin" />}
          {isEdit ? "Lưu thay đổi" : "Thêm mới"}
        </Button>
      </div>
    </form>
  );
}
