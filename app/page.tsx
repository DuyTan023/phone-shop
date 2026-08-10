"use client";

import {
  Check,
  ChevronDown,
  ChevronRight,
  Cpu,
  Filter,
  HardDrive,
  RotateCcw,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  Tag,
  Zap,
} from "lucide-react";
import Link from "next/link";
import React, { useMemo, useRef, useState } from "react";

// Fake Data Brands
const BRANDS = [
  { id: "all", name: "Tất cả thương hiệu", logo: "📱" },
  { id: "apple", name: "Apple (iPhone)", logo: "🍎" },
  { id: "samsung", name: "Samsung", logo: "🪐" },
  { id: "xiaomi", name: "Xiaomi", logo: "🟠" },
  { id: "oppo", name: "OPPO", logo: "🟢" },
  { id: "vivo", name: "Vivo", logo: "🔵" },
  { id: "realme", name: "Realme", logo: "🟡" },
  { id: "asus", name: "ASUS ROG", logo: "🎮" },
];

// Options cho Comboboxes
const FILTER_OPTIONS = {
  os: [
    { label: "Tất cả Hệ điều hành", value: "all" },
    { label: "iOS (iPhone)", value: "ios" },
    { label: "Android", value: "android" },
  ],
  priceRanges: [
    { label: "Tất cả mức giá", value: "all" },
    { label: "Dưới 10 triệu", value: "under-10" },
    { label: "10 - 20 triệu", value: "10-20" },
    { label: "20 - 30 triệu", value: "20-30" },
    { label: "Trên 30 triệu", value: "over-30" },
  ],
  ram: [
    { label: "Tất cả RAM", value: "all" },
    { label: "8GB", value: "8GB" },
    { label: "12GB", value: "12GB" },
    { label: "16GB", value: "16GB" },
  ],
  storage: [
    { label: "Tất cả Bộ nhớ", value: "all" },
    { label: "128GB", value: "128GB" },
    { label: "256GB", value: "256GB" },
    { label: "512GB", value: "512GB" },
    { label: "1TB", value: "1TB" },
  ],
};

// Fake Data Sản Phẩm mở rộng để test bộ lọc
const PRODUCTS = [
  {
    id: 1,
    name: "iPhone 15 Pro Max 256GB",
    brand: "Apple (iPhone)",
    price: 29590000,
    oldPrice: 34990000,
    rating: 4.9,
    reviews: 128,
    badge: "Giảm 15%",
    specs: { ram: "8GB", storage: "256GB", os: "ios" },
    image:
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&q=80",
  },
  {
    id: 2,
    name: "Samsung Galaxy S24 Ultra 5G 256GB",
    brand: "Samsung",
    price: 27990000,
    oldPrice: 33990000,
    rating: 4.8,
    reviews: 95,
    badge: "Tặng Voucher 1Tr",
    specs: { ram: "12GB", storage: "256GB", os: "android" },
    image:
      "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500&q=80",
  },
  {
    id: 3,
    name: "Xiaomi 14 Ultra 512GB",
    brand: "Xiaomi",
    price: 24990000,
    oldPrice: 29990000,
    rating: 4.7,
    reviews: 42,
    badge: "Hot Sale",
    specs: { ram: "16GB", storage: "512GB", os: "android" },
    image:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&q=80",
  },
  {
    id: 4,
    name: "OPPO Find N3 Flip 256GB",
    brand: "OPPO",
    price: 19990000,
    oldPrice: 22990000,
    rating: 4.6,
    reviews: 31,
    badge: "Trả góp 0%",
    specs: { ram: "12GB", storage: "256GB", os: "android" },
    image:
      "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=500&q=80",
  },
  {
    id: 5,
    name: "iPhone 15 128GB",
    brand: "Apple (iPhone)",
    price: 19490000,
    oldPrice: 22990000,
    rating: 4.9,
    reviews: 210,
    badge: "Bán chạy",
    specs: { ram: "8GB", storage: "128GB", os: "ios" },
    image:
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500&q=80",
  },
  {
    id: 6,
    name: "ASUS ROG Phone 8 512GB",
    brand: "ASUS ROG",
    price: 23990000,
    oldPrice: 25990000,
    rating: 4.9,
    reviews: 18,
    badge: "Gaming Phone",
    specs: { ram: "16GB", storage: "512GB", os: "android" },
    image:
      "https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=500&q=80",
  },
];

// --- Custom Component: Custom Combobox / Select ---
interface ComboboxProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: { label: string; value: string }[];
  icon?: React.ReactNode;
}

function CustomCombobox({
  label,
  value,
  onChange,
  options,
  icon,
}: ComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close when clicking outside
  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative space-y-1.5" ref={containerRef}>
      <label className="text-[11px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
        {icon}
        {label}
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between text-xs font-semibold px-3.5 py-2.5 rounded-xl border transition-all duration-200 outline-none ${
            value !== "all"
              ? "bg-blue-50/80 border-blue-500 text-blue-900 shadow-sm"
              : "bg-slate-50 border-slate-300 text-slate-800 hover:border-slate-400 hover:bg-white"
          }`}
        >
          <span className="truncate">{selectedOption?.label}</span>
          <ChevronDown
            className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl py-1 max-h-56 overflow-auto text-xs animate-in fade-in zoom-in-95 duration-150">
            {options.map((opt) => {
              const active = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between hover:bg-slate-100 transition-colors ${
                    active
                      ? "bg-blue-50 font-bold text-blue-600"
                      : "text-slate-700"
                  }`}
                >
                  <span>{opt.label}</span>
                  {active && (
                    <Check className="w-4 h-4 text-blue-600 stroke-[2.5]" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function HomePage() {
  // States cho các bộ lọc
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [selectedOS, setSelectedOS] = useState("all");
  const [selectedPrice, setSelectedPrice] = useState("all");
  const [selectedRam, setSelectedRam] = useState("all");
  const [selectedStorage, setSelectedStorage] = useState("all");

  // Kiểm tra xem có bộ lọc nào đang bật không
  const isFiltering =
    selectedBrand !== "all" ||
    selectedOS !== "all" ||
    selectedPrice !== "all" ||
    selectedRam !== "all" ||
    selectedStorage !== "all";

  // Hàm Reset Filter
  const handleResetFilters = () => {
    setSelectedBrand("all");
    setSelectedOS("all");
    setSelectedPrice("all");
    setSelectedRam("all");
    setSelectedStorage("all");
  };

  // Logic Lọc Sản Phẩm Thực Tế
  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((product) => {
      // 1. Lọc theo Brand
      if (selectedBrand !== "all") {
        const brandObj = BRANDS.find((b) => b.id === selectedBrand);
        if (brandObj && product.brand !== brandObj.name) return false;
      }
      // 2. Lọc theo OS
      if (selectedOS !== "all" && product.specs.os !== selectedOS) {
        return false;
      }
      // 3. Lọc theo Price
      if (selectedPrice !== "all") {
        const price = product.price;
        if (selectedPrice === "under-10" && price >= 10000000) return false;
        if (selectedPrice === "10-20" && (price < 10000000 || price > 20000000))
          return false;
        if (selectedPrice === "20-30" && (price < 20000000 || price > 30000000))
          return false;
        if (selectedPrice === "over-30" && price <= 30000000) return false;
      }
      // 4. Lọc theo RAM
      if (selectedRam !== "all" && product.specs.ram !== selectedRam) {
        return false;
      }
      // 5. Lọc theo Storage
      if (
        selectedStorage !== "all" &&
        product.specs.storage !== selectedStorage
      ) {
        return false;
      }

      return true;
    });
  }, [selectedBrand, selectedOS, selectedPrice, selectedRam, selectedStorage]);

  return (
    <div className="bg-slate-50 min-h-screen py-8 text-slate-900 font-sans">
      <div className="container mx-auto px-4 max-w-7xl space-y-8">
        {/* ================= 1. HERO BANNERS ================= */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Hero Banner */}
          <div className="lg:col-span-2 relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-8 sm:p-10 border border-slate-800 flex flex-col justify-between min-h-[380px] shadow-2xl group">
            {/* Ambient Background Blur Effect */}
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-500/30 transition-all duration-700" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-lg z-10 space-y-4">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 text-white text-[11px] font-black px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg shadow-red-600/30">
                <Sparkles className="w-3.5 h-3.5" /> Siêu Sale Tháng 8
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight tracking-tight">
                iPhone 15 Pro Max <br />
                <span className="bg-gradient-to-r from-sky-300 via-sky-400 to-blue-400 bg-clip-text text-transparent">
                  Titan Tự Nhiên
                </span>
              </h1>
              <p className="text-sm text-slate-300 font-normal leading-relaxed">
                Giảm ngay tới{" "}
                <span className="text-amber-300 font-bold underline underline-offset-4 decoration-amber-400/50">
                  5.000.000đ
                </span>{" "}
                khi thu cũ đổi mới. Hỗ trợ trả góp 0% lãi suất, duyệt nhanh 5
                phút.
              </p>
            </div>

            <div className="z-10 pt-6 flex items-center gap-4">
              <button className="bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold px-7 py-3.5 rounded-2xl transition-all duration-200 flex items-center gap-2 shadow-xl shadow-blue-600/40 text-sm">
                Mua ngay ngay <ChevronRight className="w-4 h-4 stroke-[3]" />
              </button>
              <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Bảo hành chính hãng 12 tháng
              </div>
            </div>
          </div>

          {/* Sub Banners */}
          <div className="flex flex-col gap-5">
            {/* Sub Banner 1 */}
            <div className="flex-1 bg-slate-900 hover:bg-slate-900/90 rounded-3xl p-6 text-white flex flex-col justify-between border border-slate-800 shadow-lg relative overflow-hidden group transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all" />
              <div className="z-10">
                <span className="inline-block text-[10px] font-black text-sky-400 tracking-wider bg-sky-950/80 px-2.5 py-1 rounded-md border border-sky-800/60 uppercase mb-2">
                  MỚI RA MẮT
                </span>
                <h3 className="text-xl font-black text-white">
                  Galaxy S24 Series
                </h3>
                <p className="text-xs text-slate-400 mt-1 font-medium">
                  Quyền năng Galaxy AI trong tầm tay
                </p>
              </div>
              <button className="z-10 text-xs text-sky-400 font-bold flex items-center gap-1 hover:text-sky-300 w-max mt-4 group-hover:translate-x-1 transition-transform">
                Khám phá ngay <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Sub Banner 2 */}
            <div className="flex-1 bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 rounded-3xl p-6 text-white flex flex-col justify-between border border-indigo-700/40 shadow-lg relative overflow-hidden group transition-all duration-300">
              <div className="z-10">
                <span className="inline-block text-[10px] font-black text-amber-300 tracking-wider bg-amber-500/20 px-2.5 py-1 rounded-md border border-amber-400/30 uppercase mb-2">
                  ĐỘC QUYỀN
                </span>
                <h3 className="text-xl font-black text-white">
                  Thu Cũ Đổi Mới
                </h3>
                <p className="text-xs text-blue-100/80 mt-1 font-medium">
                  Trợ giá lên tới{" "}
                  <span className="font-bold text-amber-300">3.000.000đ</span>
                </p>
              </div>
              <button className="z-10 text-xs text-white font-bold flex items-center gap-1 hover:text-amber-200 w-max mt-4 group-hover:translate-x-1 transition-transform">
                Định giá máy cũ ngay <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* ================= 2. MENUS BRAND BAR ================= */}
        <section className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-black text-slate-900">
                Thương hiệu nổi bật
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">
              Chọn thương hiệu yêu thích
            </span>
          </div>

          <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
            {BRANDS.map((brand) => {
              const active = selectedBrand === brand.id;
              return (
                <button
                  key={brand.id}
                  onClick={() => setSelectedBrand(brand.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all whitespace-nowrap active:scale-95 ${
                    active
                      ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                  }`}
                >
                  <span className="text-sm">{brand.logo}</span>
                  <span>{brand.name}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* ================= 3. BỘ LỌC TÌM KIẾM (COMBOBOX) ================= */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                <Filter className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Bộ lọc cấu hình
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Lọc chính xác thông số bạn đang tìm kiếm
                </p>
              </div>
            </div>

            {isFiltering && (
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 font-bold bg-rose-50 px-3.5 py-2 rounded-xl border border-rose-200/60 transition-all active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Xóa tất cả bộ lọc
              </button>
            )}
          </div>

          {/* Grid chứa các Combobox Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Combobox Hệ Điều Hành */}
            <CustomCombobox
              label="Hệ điều hành"
              value={selectedOS}
              onChange={setSelectedOS}
              options={FILTER_OPTIONS.os}
              icon={<Smartphone className="w-3.5 h-3.5" />}
            />

            {/* Combobox Mức Giá */}
            <CustomCombobox
              label="Mức giá"
              value={selectedPrice}
              onChange={setSelectedPrice}
              options={FILTER_OPTIONS.priceRanges}
              icon={<Tag className="w-3.5 h-3.5" />}
            />

            {/* Combobox RAM */}
            <CustomCombobox
              label="Dung lượng RAM"
              value={selectedRam}
              onChange={setSelectedRam}
              options={FILTER_OPTIONS.ram}
              icon={<Cpu className="w-3.5 h-3.5" />}
            />

            {/* Combobox Bộ Nhớ (ROM) */}
            <CustomCombobox
              label="Bộ nhớ trong"
              value={selectedStorage}
              onChange={setSelectedStorage}
              options={FILTER_OPTIONS.storage}
              icon={<HardDrive className="w-3.5 h-3.5" />}
            />
          </div>
        </section>

        {/* ================= 4. DANH SÁCH SẢN PHẨM ================= */}
        <section className="space-y-6">
          <div className="flex items-center justify-between bg-white px-5 py-4 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                <Zap className="w-5 h-5 fill-amber-500" />
              </span>
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  Điện Thoại Nổi Bật
                </h2>
                <span className="text-xs text-slate-500 font-medium">
                  Hiển thị {filteredProducts.length} sản phẩm
                </span>
              </div>
            </div>

            <Link
              href="#"
              className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 bg-blue-50 px-3.5 py-2 rounded-xl border border-blue-200/60 transition-all hover:bg-blue-100/50"
            >
              Xem tất cả <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Empty State nếu lọc không ra kết quả */}
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <Filter className="w-8 h-8" />
              </div>
              <div className="max-w-sm mx-auto space-y-1">
                <h3 className="text-base font-bold text-slate-900">
                  Không tìm thấy sản phẩm
                </h3>
                <p className="text-xs text-slate-500">
                  Thử thay đổi bộ lọc hoặc xóa các tùy chọn đang chọn để xem
                  thêm sản phẩm.
                </p>
              </div>
              <button
                onClick={handleResetFilters}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md"
              >
                Xóa bộ lọc
              </button>
            </div>
          ) : (
            /* Grid Sản Phẩm */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group relative"
                >
                  <div>
                    {/* Ảnh Sản Phẩm */}
                    <div className="relative aspect-square w-full mb-4 bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center p-4 border border-slate-100">
                      <span className="absolute top-2.5 left-2.5 bg-gradient-to-r from-red-600 to-rose-600 text-white text-[10px] font-black px-2.5 py-1 rounded-lg shadow-md z-10 flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {product.badge}
                      </span>
                      <img
                        src={product.image}
                        alt={product.name}
                        className="object-contain max-h-44 group-hover:scale-110 transition-transform duration-500 ease-out"
                      />
                    </div>

                    {/* Tag Cấu Hình */}
                    <div className="flex gap-1.5 mb-2.5">
                      <span className="text-[10px] bg-slate-100 text-slate-700 font-extrabold px-2 py-0.5 rounded-md border border-slate-200">
                        {product.specs.ram}
                      </span>
                      <span className="text-[10px] bg-slate-100 text-slate-700 font-extrabold px-2 py-0.5 rounded-md border border-slate-200">
                        {product.specs.storage}
                      </span>
                    </div>

                    {/* Tên Sản Phẩm */}
                    <h3 className="font-bold text-slate-900 text-sm line-clamp-2 group-hover:text-blue-600 transition-colors mb-2 leading-snug">
                      {product.name}
                    </h3>
                  </div>

                  {/* Giá & Đánh Giá */}
                  <div className="space-y-3 mt-3 pt-3 border-t border-slate-100">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-lg font-black text-blue-600">
                        {product.price.toLocaleString("vi-VN")}đ
                      </span>
                      <span className="text-xs text-slate-400 line-through font-medium">
                        {product.oldPrice.toLocaleString("vi-VN")}đ
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <div className="flex items-center gap-1 text-amber-600 bg-amber-50/80 px-2 py-1 rounded-lg border border-amber-200/60 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{product.rating}</span>
                        <span className="text-slate-400 font-normal">
                          ({product.reviews})
                        </span>
                      </div>
                      <button className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition-all">
                        Mua ngay
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
