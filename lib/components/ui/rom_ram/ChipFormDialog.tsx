"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Dialog,
  DialogContent,
  DialogFooter,
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
        className="sm:max-w-md bg-white border border-slate-200 shadow-lg p-6 rounded-lg"
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <DialogHeader className="text-left space-y-1">
        <DialogTitle className="text-lg font-semibold text-slate-900">
          {isEdit ? "Cập nhật dung lượng" : "Thêm dung lượng mới"}
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-3 items-end">
          <div className="col-span-2 space-y-1.5">
            <Label
              htmlFor="chip-amount"
              className="text-xs font-medium text-slate-700"
            >
              Giá trị
            </Label>
            <Input
              id="chip-amount"
              type="number"
              min="0"
              step="any"
              placeholder="VD: 8, 16, 1.5"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                if (error) setError("");
              }}
              disabled={loading}
              autoFocus
              className="h-10 border-slate-300 focus-visible:ring-1 focus-visible:ring-slate-950"
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
              <SelectTrigger className="h-10 border-slate-300 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200">
                <SelectItem value="GB">GB</SelectItem>
                <SelectItem value="TB">TB</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {error && (
          <p className="text-xs font-medium text-red-600 bg-red-50 p-2.5 rounded-md border border-red-200">
            {error}
          </p>
        )}
      </div>

      <DialogFooter className="flex sm:flex-row flex-col-reverse sm:justify-end gap-2 pt-2 border-t border-slate-100">
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={loading}
          className="h-9 px-4 text-slate-700 border-slate-300 hover:bg-slate-50"
        >
          Hủy
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="h-9 px-4 bg-slate-900 text-white hover:bg-slate-800"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEdit ? "Lưu thay đổi" : "Thêm mới"}
        </Button>
      </DialogFooter>
    </form>
  );
}
