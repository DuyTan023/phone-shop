"use client";

import { Button } from "@/components/ui/button";
import { BrandsSection } from "@/lib/components/ui/brands/brandsSelection";
import { OverviewSection } from "@/lib/components/ui/catalog/OverviewSection";
import { ColorsSection } from "@/lib/components/ui/colors/colorsSelection";
import {
  RamSelection,
  StorageSelection,
} from "@/lib/components/ui/rom_ram/rom_ram_selection";
import { SeriesSection } from "@/lib/components/ui/series/SeriesSelection";
import SpecGroupsSection from "@/lib/components/ui/spec_groups/SpecGroupsSection";

import { SpecKeysSection } from "@/lib/components/ui/spec_keys/spec_keys_Selection";
import { UnitsSection } from "@/lib/components/ui/units/unitsSelection";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

type Section =
  | "overview"
  | "brands"
  | "series"
  | "colors"
  | "storages"
  | "spec_groups"
  | "spec_keys"
  | "units";

// ─── Sidebar nav items ────────────────────────────────────────────────────────

// ─── Sub-components ───────────────────────────────────────────────────────────

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
    { key: "units", label: "Đơn vị thông số" },
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
      case "units":
        return <UnitsSection />;
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
