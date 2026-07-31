import {
  Building2,
  ChevronRight,
  Cpu,
  HardDrive,
  Loader2,
  Palette,
  Settings2,
  Tag,
} from "lucide-react";
import { useEffect, useState } from "react";

export type Section =
  | "brands"
  | "series"
  | "colors"
  | "storages_ram"
  | "spec_groups"
  | "spec_keys"
  | "units";

export interface OverviewSectionProps {
  setSection: (section: Section) => void;
}

export function OverviewSection({ setSection }: OverviewSectionProps) {
  const [counts, setCounts] = useState<Record<Section, number | null>>({
    brands: null,
    series: null,
    colors: null,
    storages_ram: null,
    spec_groups: null,
    spec_keys: null,
    units: null,
  });

  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAllTotals = async () => {
      setLoading(true);

      // Hàm hỗ trợ lấy độ dài mảng cho các API chỉ trả về danh sách
      const fetchListLength = async (url: string): Promise<number> => {
        try {
          const res = await fetch(url, { cache: "no-store" });
          if (!res.ok) return 0;
          const json = await res.json();

          // Lấy mảng từ json, json.data, hoặc json.data.data
          const list = Array.isArray(json)
            ? json
            : Array.isArray(json?.data)
              ? json.data
              : Array.isArray(json?.data?.data)
                ? json.data.data
                : [];

          return list.length;
        } catch {
          return 0;
        }
      };

      // Hàm xử lý API có phân trang chuẩn (brands, series, colors, spec_keys)
      const fetchTotalCount = async (url: string): Promise<number> => {
        try {
          const res = await fetch(url, { cache: "no-store" });
          if (!res.ok) return 0;
          const json = await res.json();

          if (json?.data?.total !== undefined) return json.data.total;
          if (json?.total !== undefined) return json.total;
          if (Array.isArray(json?.data?.data)) return json.data.data.length;
          if (Array.isArray(json?.data)) return json.data.length;
          return 0;
        } catch {
          return 0;
        }
      };

      try {
        // Tải dữ liệu từ tất cả các nguồn cùng lúc
        const [
          brandsCount,
          seriesCount,
          colorsCount,
          storagesCount,
          ramsCount,
          specGroupsCount,
          specKeysCount,
          unitsCount,
        ] = await Promise.all([
          fetchTotalCount("/api/catalogs/brands"),
          fetchTotalCount("/api/catalogs/series"),
          fetchTotalCount("/api/catalogs/colors"),
          fetchListLength("/api/catalogs/storages"), // API ROM
          fetchListLength("/api/catalogs/rams"), // API RAM (Cập nhật đường dẫn nếu backend khác)
          fetchListLength("/api/catalogs/spec_groups"), // API Spec Groups
          fetchTotalCount("/api/catalogs/spec_keys"),
          fetchTotalCount("/api/catalogs/units"),
        ]);

        setCounts({
          brands: brandsCount,
          series: seriesCount,
          colors: colorsCount,
          storages_ram: storagesCount + ramsCount, // Cộng gộp tổng ROM + RAM
          spec_groups: specGroupsCount,
          spec_keys: specKeysCount,
          units: unitsCount,
        });
      } catch (error) {
        console.error("Lỗi khi tải tổng số lượng danh mục:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllTotals();
  }, []);

  const quickLinks = [
    {
      key: "brands" as Section,
      label: "Quản lý thương hiệu",
      icon: Building2,
      unit: "hãng",
      color: "text-blue-500 bg-blue-50",
    },
    {
      key: "series" as Section,
      label: "Dòng sản phẩm",
      icon: Tag,
      unit: "loại",
      color: "text-purple-500 bg-purple-50",
    },
    {
      key: "colors" as Section,
      label: "Màu sắc",
      icon: Palette,
      unit: "màu",
      color: "text-pink-500 bg-pink-50",
    },
    {
      key: "storages_ram" as Section,
      label: "Bộ nhớ ROM & RAM",
      icon: HardDrive,
      unit: "tùy chọn",
      color: "text-orange-500 bg-orange-50",
    },
    {
      key: "spec_groups" as Section,
      label: "Nhóm thông số",
      icon: Settings2,
      unit: "nhóm",
      color: "text-teal-500 bg-teal-50",
    },
    {
      key: "spec_keys" as Section,
      label: "Tên thông số",
      icon: Cpu,
      unit: "thông số",
      color: "text-cyan-500 bg-cyan-50",
    },
    {
      key: "units" as Section,
      label: "Đơn vị thông số ",
      icon: Cpu,
      unit: "Đơn vị",
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

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {quickLinks.map((item) => {
          const Icon = item.icon;
          const totalValue = counts[item.key];

          return (
            <button
              key={item.key}
              onClick={() => setSection(item.key)}
              className="bg-white border border-slate-200 rounded-xl p-4 text-left hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.color}`}
                  >
                    <Icon size={18} />
                  </div>
                  <ChevronRight
                    size={16}
                    className="text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all mt-1"
                  />
                </div>

                <h3 className="font-medium text-slate-800 text-sm">
                  {item.label}
                </h3>

                <div className="text-slate-400 text-xs mt-1 flex items-center h-5">
                  {loading || totalValue === null ? (
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <Loader2 size={12} className="animate-spin" /> Đang tải...
                    </span>
                  ) : (
                    <span>
                      {totalValue} {item.unit}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 w-full">
                <span className="text-blue-500 text-xs font-medium group-hover:underline">
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
