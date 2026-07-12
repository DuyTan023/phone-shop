"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  ImageOff,
  Layers,
  MoreHorizontal,
  PackageCheck,
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
  Smartphone,
  Trash2,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

// ─── Mock data ────────────────────────────────────────────────────────────────
const PHONES = [
  {
    id: 1,
    name: "iPhone 15 Pro Max",
    brand: "Apple",
    category: "Cao cấp",
    image: null,
    slug: "iphone-15-pro-max",
    variants: 6,
    minPrice: 29_990_000,
    maxPrice: 39_990_000,
    totalStock: 124,
    status: "active",
    createdAt: "12/06/2025",
  },
  {
    id: 2,
    name: "Samsung Galaxy S24 Ultra",
    brand: "Samsung",
    category: "Gaming",
    image: null,
    slug: "samsung-galaxy-s24-ultra",
    variants: 4,
    minPrice: 26_990_000,
    maxPrice: 33_990_000,
    totalStock: 87,
    status: "active",
    createdAt: "10/06/2025",
  },
  {
    id: 3,
    name: "Xiaomi 14 Ultra",
    brand: "Xiaomi",
    category: "Chụp hình",
    image: null,
    slug: "xiaomi-14-ultra",
    variants: 3,
    minPrice: 19_990_000,
    maxPrice: 23_990_000,
    totalStock: 45,
    status: "active",
    createdAt: "08/06/2025",
  },
  {
    id: 4,
    name: "OPPO Find X7",
    brand: "OPPO",
    category: "Chụp hình",
    image: null,
    slug: "oppo-find-x7",
    variants: 2,
    minPrice: 18_500_000,
    maxPrice: 21_000_000,
    totalStock: 0,
    status: "out_of_stock",
    createdAt: "05/06/2025",
  },
  {
    id: 5,
    name: "Vivo X100 Pro",
    brand: "Vivo",
    category: "Phổ thông",
    image: null,
    slug: "vivo-x100-pro",
    variants: 2,
    minPrice: 15_990_000,
    maxPrice: 17_500_000,
    totalStock: 33,
    status: "active",
    createdAt: "01/06/2025",
  },
  {
    id: 6,
    name: "Realme GT 6",
    brand: "Realme",
    category: "Gaming",
    image: null,
    slug: "realme-gt-6",
    variants: 3,
    minPrice: 11_990_000,
    maxPrice: 14_990_000,
    totalStock: 12,
    status: "draft",
    createdAt: "28/05/2025",
  },
];

const STAT_CARDS = [
  {
    label: "Tổng sản phẩm",
    value: "128",
    icon: Smartphone,
    accent: "#3B82F6",
    bg: "#EFF6FF",
    sub: "+4 trong 7 ngày",
  },
  {
    label: "Biến thể",
    value: "374",
    icon: Layers,
    accent: "#F97316",
    bg: "#FFF7ED",
    sub: "Tổng SKU đang quản lý",
  },
  {
    label: "Còn hàng",
    value: "114",
    icon: PackageCheck,
    accent: "#22C55E",
    bg: "#F0FDF4",
    sub: "14 sắp hết hàng",
  },
  {
    label: "Danh mục",
    value: "8",
    icon: TrendingUp,
    accent: "#8B5CF6",
    bg: "#F5F3FF",
    sub: "2 hãng mới tháng này",
  },
];

// ─── Helper ───────────────────────────────────────────────────────────────────
function formatPrice(n: number) {
  return n.toLocaleString("vi-VN") + "₫";
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  active: {
    label: "Đang bán",
    className: "bg-green-50 text-green-700 border border-green-200 font-medium",
  },
  out_of_stock: {
    label: "Hết hàng",
    className: "bg-red-50 text-red-600 border border-red-200 font-medium",
  },
  draft: {
    label: "Nháp",
    className: "bg-gray-100 text-gray-500 border border-gray-200 font-medium",
  },
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function PhoneManagementPage() {
  return (
    <TooltipProvider>
      <div className="bg-[#F8FAFC] max-w-7xl mx-auto py-2 flex flex-col gap-6 ">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 p-5 text-white shadow-lg">
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-sm text-blue-200 mb-1">
              <span className="">Quản lý sản phẩm</span>
              <span>/</span>
              <span className="text-white font-medium">Điện thoại</span>
            </div>
            <h2 className="mt-0.5 text-xl font-bold">
              Quản lý tất cả các sản phẩm trong cửa hàng
            </h2>
            <p className="mt-1 text-sm text-blue-200">
              Có <strong className="text-white">12 đơn hàng</strong> mới và{" "}
              <strong className="text-white">3 sản phẩm</strong> sắp hết hàng
              cần xử lý.
            </p>
          </div>
          {/* Decorative circles */}
          <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-blue-500 opacity-30" />
          <div className="absolute -bottom-4 right-16 h-20 w-20 rounded-full bg-blue-400 opacity-20" />
          <Smartphone className="absolute right-6 bottom-4 h-12 w-12 text-blue-300 opacity-40" />
        </div>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {STAT_CARDS.map((s) => (
            <div
              key={s.label}
              className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex items-center gap-4"
            >
              <div
                className="rounded-lg p-2.5 shrink-0"
                style={{ backgroundColor: s.bg }}
              >
                <s.icon size={22} style={{ color: s.accent }} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">{s.label}</p>
                <p
                  className="text-2xl font-bold leading-tight"
                  style={{ color: s.accent }}
                >
                  {s.value}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">{s.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Filter bar ── */}
        <div className="bg-white rounded-xl border border-slate-00 shadow-sm px-5 py-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-xs ">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-black"
              />
              <Input
                placeholder="Tìm tên, SKU, slug..."
                className="pl-9 h-9 text-sm border-slate-500 text-slate-700 focus-visible:ring-blue-400"
              />
            </div>
            {/* Brand filter */}
            <NativeSelect>
              <NativeSelectOption value="">Select status</NativeSelectOption>
              <NativeSelectOption value="todo">Todo</NativeSelectOption>
              <NativeSelectOption value="in-progress">
                In Progress
              </NativeSelectOption>
              <NativeSelectOption value="done">Done</NativeSelectOption>
              <NativeSelectOption value="cancelled">
                Cancelled
              </NativeSelectOption>
            </NativeSelect>

            <div className="ml-auto flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-1.5 text-slate-600 border-slate-200"
              >
                <SlidersHorizontal size={14} />
                Lọc nâng cao
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                className="
                  rounded-full
                  bg-blue-600
                  text-white
                  shadow-lg
                  hover:bg-blue-500
                  hover:text-white
      "
              >
                <Plus className="mr-2 h-5 w-5" />
                Thêm mới
              </Button>
            </div>
          </div>
        </div>

        {/* ── Table ── */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Table meta row */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
            <span className="text-sm text-slate-500">
              Hiển thị <span className="font-semibold text-slate-700">6</span> /
              128 sản phẩm
            </span>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span>10 / trang</span>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/70 hover:bg-slate-50/70">
                <TableHead className="w-10 pl-5">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 accent-blue-500"
                  />
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Sản phẩm
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Hãng / Danh mục
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wide text-center">
                  Biến thể
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  <button className="flex items-center gap-1 hover:text-slate-700">
                    Giá bán <ArrowUpDown size={12} />
                  </button>
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wide text-center">
                  <button className="flex items-center gap-1 hover:text-slate-700 mx-auto">
                    Tồn kho <ArrowUpDown size={12} />
                  </button>
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Trạng thái
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Ngày tạo
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wide text-center pr-5">
                  Hành động
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {PHONES.map((phone) => {
                const statusCfg = STATUS_CONFIG[phone.status];
                const stockLow = phone.totalStock > 0 && phone.totalStock <= 15;
                return (
                  <TableRow
                    key={phone.id}
                    className="hover:bg-blue-50/30 transition-colors group"
                  >
                    {/* Checkbox */}
                    <TableCell className="pl-5">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300 accent-blue-500"
                      />
                    </TableCell>

                    {/* Product */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {/* Thumbnail */}
                        <div className="w-11 h-11 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                          {phone.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={phone.image}
                              alt={phone.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageOff size={16} className="text-slate-300" />
                          )}
                        </div>
                        {/* Name + slug */}
                        <div>
                          <p className="font-semibold text-[#0F172A] text-sm leading-tight">
                            {phone.name}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5 font-mono">
                            /{phone.slug}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Brand / Category */}
                    <TableCell>
                      <p className="text-sm font-medium text-slate-700">
                        {phone.brand}
                      </p>
                      <span className="text-xs text-slate-400">
                        {phone.category}
                      </span>
                    </TableCell>

                    {/* Variants */}
                    <TableCell className="text-center">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-50 text-blue-600 text-xs font-bold border border-blue-100">
                        {phone.variants}
                      </span>
                    </TableCell>

                    {/* Price */}
                    <TableCell>
                      <p className="text-sm font-semibold text-[#0F172A]">
                        {formatPrice(phone.minPrice)}
                      </p>
                      {phone.maxPrice !== phone.minPrice && (
                        <p className="text-xs text-slate-400">
                          → {formatPrice(phone.maxPrice)}
                        </p>
                      )}
                    </TableCell>

                    {/* Stock */}
                    <TableCell className="text-center">
                      {phone.totalStock === 0 ? (
                        <span className="text-xs font-semibold text-red-500">
                          0
                        </span>
                      ) : (
                        <span
                          className={`text-sm font-semibold ${
                            stockLow ? "text-orange-500" : "text-slate-700"
                          }`}
                        >
                          {phone.totalStock}
                        </span>
                      )}
                      {stockLow && (
                        <p className="text-[10px] text-orange-400 leading-tight">
                          sắp hết
                        </p>
                      )}
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Badge
                        className={`text-[11px] px-2 py-0.5 rounded-full ${statusCfg.className}`}
                      >
                        {statusCfg.label}
                      </Badge>
                    </TableCell>

                    {/* Created at */}
                    <TableCell className="text-sm text-slate-500 tabular-nums">
                      {phone.createdAt}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-center pr-5">
                      <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* View */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link href="/admin/phones/phone-detail">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="w-8 h-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                              >
                                <Eye size={15} />
                              </Button>
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent>Xem chi tiết</TooltipContent>
                        </Tooltip>

                        {/* Edit */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-8 h-8 text-slate-500 hover:text-[#F97316] hover:bg-orange-50"
                            >
                              <Pencil size={15} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Chỉnh sửa</TooltipContent>
                        </Tooltip>

                        {/* More */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-8 h-8 text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                            >
                              <MoreHorizontal size={15} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="text-sm">
                            <DropdownMenuItem className="gap-2 text-slate-600">
                              <Layers size={14} />
                              Quản lý biến thể
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 text-slate-600">
                              <Eye size={14} />
                              Xem trên trang bán
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="gap-2 text-red-500 focus:text-red-600 focus:bg-red-50">
                              <Trash2 size={14} />
                              Xóa sản phẩm
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {/* ── Pagination ── */}
          <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
            <span className="text-sm text-slate-500">
              Trang <span className="font-semibold text-slate-700">1</span> / 13
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="w-8 h-8 border-slate-200"
                disabled
              >
                <ChevronLeft size={15} />
              </Button>
              {[1, 2, 3].map((p) => (
                <Button
                  key={p}
                  variant={p === 1 ? "default" : "outline"}
                  size="icon"
                  className={`w-8 h-8 text-sm ${
                    p === 1
                      ? "bg-[#3B82F6] hover:bg-blue-600 text-white border-blue-500"
                      : "border-slate-200 text-slate-600"
                  }`}
                >
                  {p}
                </Button>
              ))}
              <span className="px-1 text-slate-400 text-sm">…</span>
              <Button
                variant="outline"
                size="icon"
                className="w-8 h-8 border-slate-200 text-slate-600"
              >
                13
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="w-8 h-8 border-slate-200"
              >
                <ChevronRight size={15} />
              </Button>
            </div>
          </div>
        </div>

        {/* ── Bulk action bar (shows when rows are selected — static preview) ── */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none opacity-0">
          {/* Shown via JS in real app when checkboxes selected */}
          <div className="bg-[#0F172A] text-white rounded-xl shadow-2xl px-5 py-3 flex items-center gap-4 pointer-events-auto">
            <span className="text-sm font-medium">3 sản phẩm đã chọn</span>
            <div className="w-px h-5 bg-white/20" />
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/10 gap-1.5 h-8"
            >
              <Pencil size={13} />
              Sửa hàng loạt
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-red-400 hover:bg-red-900/30 gap-1.5 h-8"
            >
              <Trash2 size={13} />
              Xóa đã chọn
            </Button>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
