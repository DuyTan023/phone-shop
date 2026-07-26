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
  ChevronsUpDown,
  KeyRound,
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";

interface CreateSpecKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateSpecKeyDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateSpecKeyDialogProps) {
  const [name, setName] = useState("");
  const [groupId, setGroupId] = useState<number | null>(null);
  const [groups, setGroups] = useState<spec_groups[] | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Quản lý trạng thái đóng/mở của Popover tìm kiếm
  const [openCombobox, setOpenCombobox] = useState(false);

  const isLoadingGroups = open && groups === null;

  useEffect(() => {
    if (!open) return;

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
  }, [open]);

  const resetForm = () => {
    setName("");
    setGroupId(null);
    setGroups(null);
    setOpenCombobox(false);
    setErrorMessage(null);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetForm();
    }
    onOpenChange(nextOpen);
  };

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

      if (res.ok && resData?.success) {
        resetForm();
        onOpenChange(false);
        onSuccess();
        return;
      }

      // Xử lý thông báo lỗi dựa theo response API
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
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-[440px] bg-white border border-slate-100 p-5 gap-4"
        onInteractOutside={(e) => isSubmitting && e.preventDefault()}
      >
        {/* Header Section với Icon Badge */}
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-slate-700">
              <KeyRound size={18} />
            </div>
            <div>
              <DialogTitle className="font-semibold text-slate-800 text-sm">
                Thêm thông số kỹ thuật
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Tạo tên thông số mới thuộc nhóm thông số tương ứng.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Khối hiển thị thông báo lỗi (Catch UI) */}
        {errorMessage && (
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs animate-in fade-in-50">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
            <div className="flex-1 font-medium">{errorMessage}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nhóm thông số */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-700">
              Nhóm thông số <span className="text-red-500">*</span>
            </Label>

            <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
              <PopoverTrigger asChild>
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
              </PopoverTrigger>

              <PopoverContent
                className="w-[var(--radix-popover-trigger-width)] p-0 bg-white border-slate-200 z-[60]"
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
                              groupId === group.id
                                ? "opacity-100"
                                : "opacity-0",
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

          {/* Tên thông số */}
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

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleOpenChange(false)}
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
      </DialogContent>
    </Dialog>
  );
}
