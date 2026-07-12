"use client";

import { Button } from "@/components/ui/button";
import { BrandsSection } from "@/lib/components/ui/brands/brandsSelection";
import {
  Building2,
  ChevronRight,
  Cpu,
  HardDrive,
  Layers,
  LayoutGrid,
  MemoryStick,
  MoreHorizontal,
  Palette,
  Pencil,
  Plus,
  Search,
  Settings2,
  Tag,
  Trash2,
} from "lucide-react";
import { useState } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

type Section =
  | "overview"
  | "brands"
  | "categories"
  | "colors"
  | "storages"
  | "rams"
  | "spec_groups"
  | "spec_keys"
  | "variants";

// ─── Sidebar nav items ────────────────────────────────────────────────────────

const navGroups = [
  {
    label: "Tổng quan",
    items: [
      { key: "overview" as Section, label: "Dashboard", icon: LayoutGrid },
    ],
  },
  {
    label: "Danh mục & Thương hiệu",
    items: [
      { key: "brands" as Section, label: "Thương hiệu", icon: Building2 },
      { key: "categories" as Section, label: "Phân loại sản phẩm", icon: Tag },
    ],
  },
  {
    label: "Biến thể sản phẩm",
    items: [
      { key: "colors" as Section, label: "Màu sắc", icon: Palette },
      { key: "storages" as Section, label: "Bộ nhớ ROM", icon: HardDrive },
      { key: "rams" as Section, label: "RAM", icon: MemoryStick },
      { key: "variants" as Section, label: "Biến thể sản phẩm", icon: Layers },
    ],
  },
  {
    label: "Thông số kỹ thuật",
    items: [
      {
        key: "spec_groups" as Section,
        label: "Nhóm thông số",
        icon: Settings2,
      },
      { key: "spec_keys" as Section, label: "Tên thông số", icon: Cpu },
    ],
  },
];

// ─── Mock data ────────────────────────────────────────────────────────────────

const mockBrands = [
  { id: 1, name: "Apple", slug: "apple", description: "Think Different" },
  { id: 2, name: "Samsung", slug: "samsung", description: "Do What You Can't" },
  {
    id: 3,
    name: "Xiaomi",
    slug: "xiaomi",
    description: "Innovation for Everyone",
  },
  { id: 4, name: "OPPO", slug: "oppo", description: "Smile to More" },
];

const mockCategories = [
  { id: 1, name: "Gaming", slug: "gaming" },
  { id: 2, name: "Phổ thông", slug: "pho-thong" },
  { id: 3, name: "Chụp hình", slug: "chup-hinh" },
  { id: 4, name: "Cao cấp", slug: "cao-cap" },
];

const mockColors = [
  { id: 1, name: "Titan Tự nhiên", hex_code: "#8E8E93" },
  { id: 2, name: "Titan Đen", hex_code: "#1C1C1E" },
  { id: 3, name: "Titan Trắng", hex_code: "#F2F2F7" },
  { id: 4, name: "Titan Sa mạc", hex_code: "#D4B896" },
  { id: 5, name: "Xanh Phantom", hex_code: "#3A4A6B" },
];

const mockStorages = [
  { id: 1, value: "64GB" },
  { id: 2, value: "128GB" },
  { id: 3, value: "256GB" },
  { id: 4, value: "512GB" },
  { id: 5, value: "1TB" },
];

const mockRams = [
  { id: 1, value: "4GB" },
  { id: 2, value: "6GB" },
  { id: 3, value: "8GB" },
  { id: 4, value: "12GB" },
  { id: 5, value: "16GB" },
];

const mockSpecGroups = [
  { id: 1, name: "Màn hình" },
  { id: 2, name: "Pin & Sạc" },
  { id: 3, name: "Cấu hình" },
  { id: 4, name: "Camera" },
  { id: 5, name: "Kết nối" },
];

const mockSpecKeys = [
  { id: 1, group: "Màn hình", name: "Kích thước màn hình" },
  { id: 2, group: "Màn hình", name: "Tần số quét" },
  { id: 3, group: "Màn hình", name: "Độ sáng tối đa" },
  { id: 4, group: "Pin & Sạc", name: "Dung lượng pin" },
  { id: 5, group: "Pin & Sạc", name: "Công suất sạc" },
  { id: 6, group: "Cấu hình", name: "Chip xử lý" },
  { id: 7, group: "Cấu hình", name: "GPU" },
  { id: 8, group: "Kết nối", name: "NFC" },
];

const mockVariants = [
  {
    id: 1,
    sku: "IP15PM-256GB-TITAN",
    product: "iPhone 15 Pro Max",
    color: "Titan Tự nhiên",
    storage: "256GB",
    ram: "8GB",
    price: 34990000,
    stock: 15,
  },
  {
    id: 2,
    sku: "IP15PM-512GB-BLACK",
    product: "iPhone 15 Pro Max",
    color: "Titan Đen",
    storage: "512GB",
    ram: "8GB",
    price: 39990000,
    stock: 8,
  },
  {
    id: 3,
    sku: "SS-S24U-256-VIOLET",
    product: "Samsung Galaxy S24 Ultra",
    color: "Xanh Phantom",
    storage: "256GB",
    ram: "12GB",
    price: 31990000,
    stock: 20,
  },
  {
    id: 4,
    sku: "XMI-14P-512-WHITE",
    product: "Xiaomi 14 Pro",
    color: "Titan Trắng",
    storage: "512GB",
    ram: "16GB",
    price: 22990000,
    stock: 5,
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatsBar() {
  const stats = [
    {
      label: "Thương hiệu",
      value: 4,
      icon: Building2,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Màu sắc",
      value: 5,
      icon: Palette,
      color: "bg-orange-100 text-orange-600",
    },
    {
      label: "Biến thể",
      value: 24,
      icon: Layers,
      color: "bg-green-100 text-green-600",
    },
    {
      label: "Thông số",
      value: 8,
      icon: Cpu,
      color: "bg-purple-100 text-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-all"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-slate-500">{item.label}</p>
                <h2 className="text-2xl font-bold mt-1">{item.value}</h2>
                <span className="text-xs text-green-600 mt-0.5 block">
                  +12% tháng này
                </span>
              </div>
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.color}`}
              >
                <Icon size={18} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function SectionHeader({
  title,
  description,
  onAdd,
  addLabel = "Thêm mới",
}: {
  title: string;
  description?: string;
  onAdd?: () => void;
  addLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        {description && (
          <p className="text-sm text-slate-400 mt-0.5">{description}</p>
        )}
      </div>
      {onAdd && (
        <Button
          onClick={onAdd}
          className="bg-blue-400 hover:bg-blue-600 text-white gap-1.5 h-9 px-4 text-sm shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          {addLabel}
        </Button>
      )}
    </div>
  );
}

export function SearchBar({ placeholder }: { placeholder: string }) {
  return (
    <div className="relative mb-4">
      <Search
        size={14}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
      />
      <input
        type="text"
        placeholder={placeholder}
        className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-colors"
      />
    </div>
  );
}

// Action buttons: opacity-0 by default, opacity-100 on parent hover
// Using group/group-hover pattern — parent row needs className="group"
export function ActionButtons() {
  return (
    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
      <button className="p-1.5 rounded-md text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-colors">
        <Pencil size={13} />
      </button>
      <button className="p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
        <Trash2 size={13} />
      </button>
    </div>
  );
}

// ─── Table shared styles ──────────────────────────────────────────────────────

const tableWrap = "bg-white border border-slate-200 rounded-xl overflow-hidden";
const thead = "bg-slate-50 border-b border-slate-200";
const th =
  "text-left text-[11px] font-medium text-slate-400 uppercase tracking-wider px-4 py-2.5";
const thRight =
  "text-right text-[11px] font-medium text-slate-400 uppercase tracking-wider px-4 py-2.5";
const tbody = "divide-y divide-slate-100";
const tr = "group hover:bg-slate-50 transition-colors";
const td = "px-4 py-3 text-sm";

// ─── Section: Overview ────────────────────────────────────────────────────────

function OverviewSection({ setSection }: { setSection: (s: Section) => void }) {
  const quickLinks = [
    {
      key: "brands" as Section,
      label: "Quản lý thương hiệu",
      icon: Building2,
      count: "4 hãng",
      color: "text-blue-500 bg-blue-50",
    },
    {
      key: "categories" as Section,
      label: "Phân loại sản phẩm",
      icon: Tag,
      count: "4 loại",
      color: "text-purple-500 bg-purple-50",
    },
    {
      key: "colors" as Section,
      label: "Màu sắc",
      icon: Palette,
      count: "5 màu",
      color: "text-pink-500 bg-pink-50",
    },
    {
      key: "storages" as Section,
      label: "Bộ nhớ ROM",
      icon: HardDrive,
      count: "5 tùy chọn",
      color: "text-orange-500 bg-orange-50",
    },
    {
      key: "rams" as Section,
      label: "RAM",
      icon: MemoryStick,
      count: "5 tùy chọn",
      color: "text-yellow-500 bg-yellow-50",
    },
    {
      key: "variants" as Section,
      label: "Biến thể sản phẩm",
      icon: Layers,
      count: "24 biến thể",
      color: "text-green-500 bg-green-50",
    },
    {
      key: "spec_groups" as Section,
      label: "Nhóm thông số",
      icon: Settings2,
      count: "5 nhóm",
      color: "text-teal-500 bg-teal-50",
    },
    {
      key: "spec_keys" as Section,
      label: "Tên thông số",
      icon: Cpu,
      count: "8 thông số",
      color: "text-cyan-500 bg-cyan-50",
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">
          Quản lý dữ liệu danh mục
        </h1>
        <p className="text-slate-400 mt-1 text-sm">
          Trung tâm quản lý thương hiệu, biến thể và thông số kỹ thuật sản phẩm
        </p>
      </div>

      <StatsBar />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {quickLinks.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              onClick={() => setSection(item.key)}
              className="bg-white border border-slate-200 rounded-xl p-4 text-left hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.color}`}
                >
                  <Icon size={18} />
                </div>
                <ChevronRight size={16} className="text-slate-300 mt-1" />
              </div>
              <h3 className="font-medium text-slate-800 text-sm">
                {item.label}
              </h3>
              <p className="text-slate-400 text-xs mt-1">{item.count}</p>
              <div className="mt-3 pt-3 border-t border-slate-100">
                <span className="text-blue-500 text-xs font-medium">
                  Truy cập →
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Section: Brands ──────────────────────────────────────────────────────────

// ─── Section: Categories ──────────────────────────────────────────────────────

function CategoriesSection() {
  return (
    <div>
      <SectionHeader
        title="Phân loại sản phẩm"
        description="Gaming, phổ thông, chụp hình,..."
        onAdd={() => {}}
        addLabel="Thêm phân loại"
      />
      <SearchBar placeholder="Tìm kiếm phân loại..." />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {mockCategories.map((cat) => (
          <div
            key={cat.id}
            className="group flex items-center justify-between p-3.5 bg-white border border-slate-200 rounded-xl hover:border-slate-300 hover:shadow-sm transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Tag size={14} className="text-blue-500" />
              </div>
              <div>
                <p className="font-medium text-slate-800 text-sm">{cat.name}</p>
                <code className="text-xs text-slate-400">{cat.slug}</code>
              </div>
            </div>
            <ActionButtons />
          </div>
        ))}
        <button className="flex items-center justify-center gap-2 p-3.5 border border-dashed border-slate-300 rounded-xl text-slate-400 hover:text-blue-500 hover:border-blue-300 transition-colors text-sm">
          <Plus size={14} />
          Thêm phân loại
        </button>
      </div>
    </div>
  );
}

// ─── Section: Colors ──────────────────────────────────────────────────────────

function ColorsSection() {
  return (
    <div>
      <SectionHeader
        title="Màu sắc"
        description="Các màu sắc biến thể sản phẩm"
        onAdd={() => {}}
        addLabel="Thêm màu"
      />
      <SearchBar placeholder="Tìm kiếm màu sắc..." />
      <div className={tableWrap}>
        <table className="w-full text-sm">
          <thead className={thead}>
            <tr>
              <th className={th} style={{ width: 56 }}>
                Màu
              </th>
              <th className={th}>Tên</th>
              <th className={th}>Mã hex</th>
              <th className={th}>Preview</th>
              <th className={thRight} style={{ width: 80 }}>
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className={tbody}>
            {mockColors.map((color) => (
              <tr key={color.id} className={tr}>
                <td className={td}>
                  <div
                    className="w-7 h-7 rounded-full border border-slate-200 shadow-sm"
                    style={{ backgroundColor: color.hex_code }}
                  />
                </td>
                <td className={`${td} font-medium text-slate-800`}>
                  {color.name}
                </td>
                <td className={td}>
                  <code className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-mono">
                    {color.hex_code}
                  </code>
                </td>
                <td className={td}>
                  <div
                    className="h-4 w-20 rounded-full border border-slate-200"
                    style={{ backgroundColor: color.hex_code }}
                  />
                </td>
                <td className={`${td} text-right`}>
                  <div className="flex items-center justify-end">
                    <ActionButtons />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Section: Storages & RAMs ─────────────────────────────────────────────────

function ChipListSection({
  title,
  description,
  data,
  unit,
}: {
  title: string;
  description: string;
  data: { id: number; value: string }[];
  unit?: string;
}) {
  return (
    <div>
      <SectionHeader
        title={title}
        description={description}
        onAdd={() => {}}
        addLabel={`Thêm ${unit ?? ""}`}
      />
      <div className="flex flex-wrap gap-2 mb-5">
        {data.map((item) => (
          <div
            key={item.id}
            className="group flex items-center gap-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-2 transition-colors"
          >
            <span className="font-medium text-slate-700 text-sm">
              {item.value}
            </span>
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 ml-1">
              <button className="p-1 rounded text-slate-400 hover:text-blue-500 transition-colors">
                <Pencil size={11} />
              </button>
              <button className="p-1 rounded text-slate-400 hover:text-red-500 transition-colors">
                <Trash2 size={11} />
              </button>
            </div>
          </div>
        ))}
        <button className="flex items-center gap-1.5 border border-dashed border-slate-300 rounded-lg px-3 py-2 text-slate-400 hover:text-blue-500 hover:border-blue-300 transition-colors text-sm">
          <Plus size={13} />
          Thêm tùy chọn
        </button>
      </div>

      <div className={tableWrap}>
        <table className="w-full text-sm">
          <thead className={thead}>
            <tr>
              <th className={th} style={{ width: 72 }}>
                ID
              </th>
              <th className={th}>Giá trị</th>
              <th className={thRight} style={{ width: 80 }}>
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className={tbody}>
            {data.map((item) => (
              <tr key={item.id} className={tr}>
                <td className={`${td} text-slate-400`}>#{item.id}</td>
                <td className={`${td} font-medium text-slate-800`}>
                  {item.value}
                </td>
                <td className={`${td} text-right`}>
                  <div className="flex items-center justify-end">
                    <ActionButtons />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Section: Spec Groups ─────────────────────────────────────────────────────

function SpecGroupsSection() {
  return (
    <div>
      <SectionHeader
        title="Nhóm thông số kỹ thuật"
        description="Màn hình, Pin, Cấu hình, Camera, Kết nối..."
        onAdd={() => {}}
        addLabel="Thêm nhóm"
      />
      <SearchBar placeholder="Tìm kiếm nhóm thông số..." />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {mockSpecGroups.map((group) => (
          <div
            key={group.id}
            className="group flex items-center justify-between p-3.5 bg-white border border-slate-200 rounded-xl hover:border-slate-300 hover:shadow-sm transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
                <Settings2 size={14} className="text-teal-500" />
              </div>
              <span className="font-medium text-slate-800 text-sm">
                {group.name}
              </span>
            </div>
            <ActionButtons />
          </div>
        ))}
        <button className="flex items-center justify-center gap-2 p-3.5 border border-dashed border-slate-300 rounded-xl text-slate-400 hover:text-teal-500 hover:border-teal-300 transition-colors text-sm">
          <Plus size={14} />
          Thêm nhóm
        </button>
      </div>
    </div>
  );
}

// ─── Section: Spec Keys ───────────────────────────────────────────────────────

function SpecKeysSection() {
  return (
    <div>
      <SectionHeader
        title="Tên thông số kỹ thuật"
        description="Tần số quét, Độ sáng, NFC, Chất liệu khung..."
        onAdd={() => {}}
        addLabel="Thêm thông số"
      />
      <SearchBar placeholder="Tìm kiếm thông số..." />
      <div className={tableWrap}>
        <table className="w-full text-sm">
          <thead className={thead}>
            <tr>
              <th className={th} style={{ width: 56 }}>
                ID
              </th>
              <th className={th} style={{ width: 140 }}>
                Nhóm
              </th>
              <th className={th}>Tên thông số</th>
              <th className={thRight} style={{ width: 80 }}>
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className={tbody}>
            {mockSpecKeys.map((key) => (
              <tr key={key.id} className={tr}>
                <td className={`${td} text-slate-400`}>#{key.id}</td>
                <td className={td}>
                  <span className="text-xs font-medium text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">
                    {key.group}
                  </span>
                </td>
                <td className={`${td} font-medium text-slate-800`}>
                  {key.name}
                </td>
                <td className={`${td} text-right`}>
                  <div className="flex items-center justify-end">
                    <ActionButtons />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Section: Product Variants ────────────────────────────────────────────────

function VariantsSection() {
  return (
    <div>
      <SectionHeader
        title="Biến thể sản phẩm"
        description="Quản lý SKU, giá, tồn kho theo màu sắc và bộ nhớ"
        onAdd={() => {}}
        addLabel="Thêm biến thể"
      />

      <div className="flex gap-2.5 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Tìm theo SKU, sản phẩm..."
            className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-400 transition-colors"
          />
        </div>
        <select className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 focus:outline-none focus:border-blue-400">
          <option value="">Tất cả sản phẩm</option>
          <option>iPhone 15 Pro Max</option>
          <option>Samsung Galaxy S24 Ultra</option>
        </select>
        <select className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 focus:outline-none focus:border-blue-400">
          <option value="">Tất cả màu</option>
          {mockColors.map((c) => (
            <option key={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className={tableWrap}>
        <table className="w-full text-sm">
          <thead className={thead}>
            <tr>
              <th className={th}>SKU</th>
              <th className={th}>Sản phẩm</th>
              <th className={th}>Màu</th>
              <th className={th}>ROM</th>
              <th className={th}>RAM</th>
              <th className={th}>Giá bán</th>
              <th className={th}>Tồn kho</th>
              <th className={thRight} style={{ width: 96 }}>
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className={tbody}>
            {mockVariants.map((v) => {
              const color = mockColors.find((c) => c.name === v.color);
              const isLowStock = v.stock <= 5;

              return (
                <tr key={v.id} className={tr}>
                  <td className={td}>
                    <code className="text-xs text-blue-500 bg-blue-50 px-2 py-0.5 rounded font-mono">
                      {v.sku}
                    </code>
                  </td>
                  <td
                    className={`${td} font-medium text-slate-800 max-w-[150px] truncate`}
                  >
                    {v.product}
                  </td>
                  <td className={td}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3.5 h-3.5 rounded-full border border-slate-200 shrink-0"
                        style={{ backgroundColor: color?.hex_code ?? "#888" }}
                      />
                      <span className="text-slate-500 text-xs">{v.color}</span>
                    </div>
                  </td>
                  <td className={`${td} text-slate-600`}>{v.storage}</td>
                  <td className={`${td} text-slate-600`}>{v.ram}</td>
                  <td className={td}>
                    <span className="font-semibold text-orange-500">
                      {v.price.toLocaleString("vi-VN")}đ
                    </span>
                  </td>
                  <td className={td}>
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                        isLowStock
                          ? "text-red-600 bg-red-50"
                          : "text-green-600 bg-green-50"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isLowStock ? "bg-red-500" : "bg-green-500"
                        }`}
                      />
                      {v.stock} máy
                    </span>
                  </td>
                  <td className={`${td} text-right`}>
                    <div className="flex items-center justify-end gap-0.5">
                      <ActionButtons />
                      <button className="p-1.5 rounded-md text-slate-300 hover:text-slate-500 hover:bg-slate-100 transition-colors opacity-0 group-hover:opacity-100">
                        <MoreHorizontal size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100">
          <span className="text-xs text-slate-400">
            Hiển thị 1–4 / 24 biến thể
          </span>
          <div className="flex gap-1">
            {[1, 2, 3].map((p) => (
              <button
                key={p}
                className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${
                  p === 1
                    ? "bg-blue-500 text-white"
                    : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

function CatalogTabs({
  activeSection,
  setActiveSection,
}: {
  activeSection: Section;
  setActiveSection: (s: Section) => void;
}) {
  const tabs = [
    { key: "overview", label: "Tổng quan" },
    { key: "brands", label: "Thương hiệu" },
    { key: "categories", label: "Phân loại" },
    { key: "colors", label: "Màu sắc" },
    { key: "storages", label: "ROM" },
    { key: "rams", label: "RAM" },
    { key: "variants", label: "Biến thể" },
    { key: "spec_groups", label: "Nhóm thông số" },
    { key: "spec_keys", label: "Tên thông số" },
  ];

  return (
    <div className="sticky top-0 z-20 backdrop-blur py-2 mb-3 overflow-x-auto">
      <div className="flex gap-1.5 min-w-max">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveSection(tab.key as Section)}
            className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
              activeSection === tab.key
                ? "bg-blue-500 text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CatalogDashboardPage() {
  const [activeSection, setActiveSection] = useState<Section>("overview");

  const renderSection = () => {
    switch (activeSection) {
      case "overview":
        return <OverviewSection setSection={setActiveSection} />;
      case "brands":
        // Quản lý danh mục brands
        return <BrandsSection />;
      case "categories":
        return <CategoriesSection />;
      case "colors":
        return <ColorsSection />;
      case "storages":
        return (
          <ChipListSection
            title="Bộ nhớ ROM"
            description="Các tùy chọn dung lượng lưu trữ"
            data={mockStorages}
            unit="ROM"
          />
        );
      case "rams":
        return (
          <ChipListSection
            title="RAM"
            description="Các tùy chọn dung lượng RAM"
            data={mockRams}
            unit="RAM"
          />
        );
      case "spec_groups":
        return <SpecGroupsSection />;
      case "spec_keys":
        return <SpecKeysSection />;
      case "variants":
        return <VariantsSection />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6">
      <CatalogTabs
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      <div className="">{renderSection()}</div>
    </div>
  );
}
