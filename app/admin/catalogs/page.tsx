"use client";

import { Button } from "@/components/ui/button";
import { BrandsSection } from "@/lib/components/ui/brands/brandsSelection";
import { ColorsSection } from "@/lib/components/ui/colors/colorsSelection";
import {
  RamSelection,
  StorageSelection,
} from "@/lib/components/ui/rom_ram/rom_ram_selection";
import { SeriesSection } from "@/lib/components/ui/series/SeriesSelection";
import SpecGroupsSection from "@/lib/components/ui/spec_groups/SpecGroupsSection";

import { SpecKeysSection } from "@/lib/components/ui/spec_keys/spec_keys_Selection";
import {
  Building2,
  ChevronRight,
  Cpu,
  HardDrive,
  LayoutGrid,
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
  | "series"
  | "colors"
  | "storages"
  | "spec_groups"
  | "spec_keys";

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
      { key: "series" as Section, label: "Phân loại sản phẩm", icon: Tag },
    ],
  },
  {
    label: "Thuộc tính thể sản phẩm",
    items: [
      { key: "colors" as Section, label: "Màu sắc", icon: Palette },
      {
        key: "storages" as Section,
        label: "Bộ nhớ ROM & RAM",
        icon: HardDrive,
      },
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

interface SearchBarProps {
  placeholder: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function SearchBar({ placeholder, value, onChange }: SearchBarProps) {
  return (
    <div className="relative mb-4">
      <Search
        size={14}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
      />
      <input
        type="text"
        value={value}
        onChange={onChange}
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
      key: "series" as Section,
      label: "Dòng sản phẩm",
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
    { key: "series", label: "Series" },
    { key: "colors", label: "Màu sắc" },
    { key: "storages", label: "ROM & RAM" },
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
      case "series":
        return <SeriesSection />;
      case "colors":
        return <ColorsSection />;
      case "storages":
        return (
          <div>
            <RamSelection />
            <StorageSelection />
          </div>
        );

      case "spec_groups":
        return <SpecGroupsSection />;
      case "spec_keys":
        return <SpecKeysSection />;
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
