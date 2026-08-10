"use client";

import { Check, ChevronRight, Filter, Star, Zap } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

// Fake Data Danh Mục Brand
const BRANDS = [
  { name: "Apple (iPhone)", logo: "🍎" },
  { name: "Samsung", logo: "📱" },
  { name: "Xiaomi", logo: "🟠" },
  { name: "OPPO", logo: "🟢" },
  { name: "Vivo", logo: "🔵" },
  { name: "Realme", logo: "🟡" },
  { name: "ASUS ROG", logo: "🎮" },
];

// Fake Data Bộ Lọc
const FILTER_OPTIONS = {
  priceRanges: [
    { label: "Tất cả giá", value: "all" },
    { label: "Dưới 5 triệu", value: "under-5" },
    { label: "5 - 10 triệu", value: "5-10" },
    { label: "10 - 15 triệu", value: "10-15" },
    { label: "Trên 15 triệu", value: "over-15" },
  ],
  os: [
    { label: "Tất cả OS", value: "all" },
    { label: "iOS (iPhone)", value: "ios" },
    { label: "Android", value: "android" },
  ],
  ram: ["4GB", "6GB", "8GB", "12GB"],
  storage: ["64GB", "128GB", "256GB", "512GB", "1TB"],
};

// Fake Data Sản Phẩm Nổi Bật
const PRODUCTS = [
  {
    id: 1,
    name: "iPhone 15 Pro Max 256GB",
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
    name: "Samsung Galaxy S24 Ultra 5G",
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
    name: "OPPO Find N3 Flip",
    price: 19990000,
    oldPrice: 22990000,
    rating: 4.6,
    reviews: 31,
    badge: "Trả góp 0%",
    specs: { ram: "12GB", storage: "256GB", os: "android" },
    image:
      "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=500&q=80",
  },
];

export default function HomePage() {
  const [selectedBrand, setSelectedBrand] = useState("Tất cả");
  const [selectedOS, setSelectedOS] = useState("all");
  const [selectedPrice, setSelectedPrice] = useState("all");
  const [selectedRam, setSelectedRam] = useState<string[]>([]);
  const [selectedStorage, setSelectedStorage] = useState<string[]>([]);

  const toggleRam = (item: string) => {
    setSelectedRam((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item],
    );
  };

  const toggleStorage = (item: string) => {
    setSelectedStorage((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item],
    );
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      {/* 1. BANNER SỰ KIỆN NỔI BẬT */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Banner chính lớn */}
        <div className="lg:col-span-2 relative rounded-2xl overflow-hidden shadow-md group bg-blue-900 min-h-[300px] lg:min-h-[380px] flex items-center justify-between p-8 text-white">
          <div className="max-w-md z-10 space-y-4">
            <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Siêu Sale Tháng 8
            </span>
            <h1 className="text-3xl lg:text-4xl font-extrabold leading-tight">
              iPhone 15 Pro Max <br />
              <span className="text-blue-400">Titan Tự Nhiên</span>
            </h1>
            <p className="text-sm text-slate-300">
              Giảm ngay tới 5.000.000đ khi thu cũ đổi mới. Hỗ trợ trả góp 0% lãi
              suất.
            </p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg transition flex items-center gap-2 shadow-lg">
              Mua ngay <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="hidden sm:block relative w-64 h-64">
            <div className="w-full h-full bg-gradient-to-tr from-blue-500/20 to-white/10 rounded-full flex items-center justify-center text-7xl">
              📱
            </div>
          </div>
        </div>

        {/* 2 Banner phụ bên phải */}
        <div className="flex flex-col gap-4">
          <div className="flex-1 bg-slate-900 rounded-2xl p-6 text-white flex flex-col justify-between relative overflow-hidden">
            <div>
              <span className="text-xs font-semibold text-blue-400">
                MỚI RA MẮT
              </span>
              <h3 className="text-xl font-bold mt-1">Galaxy S24 Series</h3>
              <p className="text-xs text-slate-400 mt-1">
                Quyền năng AI trong tay bạn
              </p>
            </div>
            <button className="text-xs text-blue-400 font-semibold flex items-center gap-1 mt-4 hover:underline">
              Khám phá ngay <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="flex-1 bg-gradient-to-r from-blue-700 to-blue-600 rounded-2xl p-6 text-white flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold text-yellow-300">
                ĐỘC QUYỀN
              </span>
              <h3 className="text-xl font-bold mt-1">Đổi Cũ Lấy Mới</h3>
              <p className="text-xs text-blue-100 mt-1">
                Trợ giá lên tới 3.000.000đ
              </p>
            </div>
            <button className="text-xs text-white font-semibold flex items-center gap-1 mt-4 hover:underline">
              Định giá máy cũ <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </section>

      {/* 2. MENU DANH SÁCH BRANDS */}
      <section className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <h2 className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
          Thương hiệu nổi bật
        </h2>
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedBrand("Tất cả")}
            className={`px-4 py-2 rounded-lg text-xs font-medium border whitespace-nowrap transition ${
              selectedBrand === "Tất cả"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-slate-50 text-slate-700 border-slate-200 hover:border-blue-400"
            }`}
          >
            Tất cả
          </button>
          {BRANDS.map((brand, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedBrand(brand.name)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium border whitespace-nowrap transition ${
                selectedBrand === brand.name
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-slate-700 border-slate-200 hover:border-blue-400"
              }`}
            >
              <span>{brand.logo}</span>
              <span>{brand.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 3. BỘ LỌC ĐƠN GIẢN */}
      <section className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 space-y-4">
        <div className="flex items-center gap-2 text-slate-800 font-bold text-sm border-b pb-3">
          <Filter className="w-4 h-4 text-blue-600" />
          <span>Bộ lọc tìm kiếm</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Hệ điều hành */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">
              Hệ điều hành
            </label>
            <div className="flex flex-wrap gap-1.5">
              {FILTER_OPTIONS.os.map((item) => (
                <button
                  key={item.value}
                  onClick={() => setSelectedOS(item.value)}
                  className={`text-xs px-3 py-1.5 rounded-md border transition ${
                    selectedOS === item.value
                      ? "bg-blue-50 border-blue-600 text-blue-600 font-semibold"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mức giá */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">
              Mức giá
            </label>
            <select
              value={selectedPrice}
              onChange={(e) => setSelectedPrice(e.target.value)}
              className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-blue-600"
            >
              {FILTER_OPTIONS.priceRanges.map((price) => (
                <option key={price.value} value={price.value}>
                  {price.label}
                </option>
              ))}
            </select>
          </div>

          {/* Dung lượng RAM */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">
              Dung lượng RAM
            </label>
            <div className="flex flex-wrap gap-1.5">
              {FILTER_OPTIONS.ram.map((ram) => {
                const active = selectedRam.includes(ram);
                return (
                  <button
                    key={ram}
                    onClick={() => toggleRam(ram)}
                    className={`text-xs px-2.5 py-1 rounded border flex items-center gap-1 transition ${
                      active
                        ? "bg-blue-600 text-white border-blue-600"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {active && <Check className="w-3 h-3" />}
                    {ram}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bộ nhớ trong */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">
              Bộ nhớ trong (ROM)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {FILTER_OPTIONS.storage.map((mem) => {
                const active = selectedStorage.includes(mem);
                return (
                  <button
                    key={mem}
                    onClick={() => toggleStorage(mem)}
                    className={`text-xs px-2.5 py-1 rounded border flex items-center gap-1 transition ${
                      active
                        ? "bg-blue-600 text-white border-blue-600"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {active && <Check className="w-3 h-3" />}
                    {mem}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 4. DANH SÁCH SẢN PHẨM NỔI BẬT */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            Điện Thoại Nổi Bật
          </h2>
          <Link
            href="#"
            className="text-xs text-blue-600 hover:underline font-semibold flex items-center"
          >
            Xem tất cả <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {PRODUCTS.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between group"
            >
              <div>
                {/* Ảnh sản phẩm + Badge */}
                <div className="relative aspect-square w-full mb-3 bg-slate-50 rounded-lg overflow-hidden flex items-center justify-center">
                  <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded z-10">
                    {product.badge}
                  </span>
                  <img
                    src={product.image}
                    alt={product.name}
                    className="object-contain max-h-48 group-hover:scale-105 transition duration-300"
                  />
                </div>

                {/* Thông số cấu hình nhanh */}
                <div className="flex gap-1 mb-2">
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                    {product.specs.ram}
                  </span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                    {product.specs.storage}
                  </span>
                </div>

                {/* Tên sản phẩm */}
                <h3 className="font-semibold text-slate-800 text-sm line-clamp-2 group-hover:text-blue-600 transition mb-2">
                  {product.name}
                </h3>
              </div>

              {/* Giá và Đánh giá */}
              <div className="space-y-2 mt-2 pt-2 border-t border-slate-50">
                <div className="flex items-baseline gap-2">
                  <span className="text-base font-bold text-blue-600">
                    {product.price.toLocaleString("vi-VN")}đ
                  </span>
                  <span className="text-xs text-slate-400 line-through">
                    {product.oldPrice.toLocaleString("vi-VN")}đ
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Star className="w-3.5 h-3.5 fill-yellow-400" />
                    <span className="font-medium text-slate-700">
                      {product.rating}
                    </span>
                    <span className="text-slate-400">({product.reviews})</span>
                  </div>
                  <button className="bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-2.5 py-1 rounded text-xs font-semibold transition">
                    Mua ngay
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
