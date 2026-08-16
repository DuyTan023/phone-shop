"use client";

import type { brands, rams, storages } from "@/app/generated/prisma/client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { ProductVariant } from "@/lib/repositories/product/products_variant.repository";
import type { ApiResponse, PaginationResult } from "@/lib/types/public/types";
import { ChevronRight, Filter, Star, Zap } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { SerieWithBrand } from "../../series/SeriesSelection";

export default function HomePage() {
  const [selectedBrand, setSelectedBrand] = useState<brands | null>(null);
  const [brandsList, setBrandsList] = useState<brands[]>([]);
  const [seriesList, setSeriesList] = useState<SerieWithBrand[]>([]);
  const [selectedSeries, setSelectedSeries] = useState<SerieWithBrand | null>(
    null,
  );
  const [productVariantList, setProductVariantList] = useState<
    ProductVariant[]
  >([]);

  const [ramList, setRamList] = useState<rams[]>([]);
  const [storageList, setStorageList] = useState<storages[]>([]);

  const [selectedRam, setSelectedRam] = useState<number | null>(null);

  const [selectedStorage, setSelectedStorage] = useState<number | null>(null);

  const [selectedPrice, setSelectedPrice] = useState<{
    min: number;
    max?: number;
  } | null>(null);

  const fetchProductVariant = async () => {
    try {
      const response = await fetch(
        "/api/product_manager/product_variants/default",
      );

      const result: ApiResponse<ProductVariant[]> = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message);
      }

      const data = result.data ?? [];

      setProductVariantList(data);
    } catch (error) {
      console.error("Lỗi lấy danh sách biến thể mặc định:", error);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await fetch("/api/catalogs/brands");

      const result: ApiResponse<PaginationResult<brands>> =
        await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message);
      }

      setBrandsList(result.data?.data ?? []);
    } catch (error) {
      console.error("Lỗi lấy danh sách brand:", error);
    }
  };

  const fetchSeries = async (brand: brands) => {
    try {
      const response = await fetch(`/api/catalogs/brands/${brand.slug}/series`);

      const result: ApiResponse<SerieWithBrand[]> = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message);
      }

      setSeriesList(result.data ?? []);
    } catch (error) {
      console.error("Lỗi lấy danh sách series:", error);
      setSeriesList([]);
    }
  };

  const fetchProductVariantBySerie = async (serie: SerieWithBrand) => {
    try {
      const product_variant = await fetch(
        `/api/catalogs/brands/${serie.slug}/series/${serie.id}`,
      );

      const result: ApiResponse<ProductVariant[]> =
        await product_variant.json();

      if (!product_variant.ok || !result.success) {
        throw new Error(result.message);
      }

      const data = result.data ?? [];

      setProductVariantList(data);
    } catch (error) {
      console.error("Lỗi lấy danh sách sản phẩm:", error);
      setProductVariantList([]);
    }
  };

  const fetchProductVariantByBrandSlug = async (brand: brands) => {
    try {
      const response = await fetch(
        `/api/catalogs/brands/${brand.slug}/products`,
      );

      const result: ApiResponse<ProductVariant[]> = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message);
      }

      const data = result.data ?? [];

      setProductVariantList(data);
    } catch (error) {
      console.error("Lỗi lấy danh sách sản phẩm:", error);
      setProductVariantList([]);
    }
  };

  const fetchRams = async () => {
    try {
      const response = await fetch(`/api/catalogs/rams`);

      const result: ApiResponse<rams[]> = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message);
      }

      setRamList(result.data ?? []);
    } catch (error) {
      console.error("Lỗi lấy danh sách ram:", error);
      setRamList([]);
    }
  };

  const fetchStorage = async () => {
    try {
      const response = await fetch(`/api/catalogs/storages`);

      const result: ApiResponse<storages[]> = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message);
      }

      setStorageList(result.data ?? []);
    } catch (error) {
      console.error("Lỗi lấy danh sách rom:", error);
      setStorageList([]);
    }
  };

  // Xử lý khi click chọn Brand
  const handleSelectBrand = (brand: brands | null) => {
    setSelectedBrand(brand);
    setSelectedSeries(null); // Reset series khi đổi brand khác

    setSelectedRam(null);
    setSelectedStorage(null);
    setSelectedPrice(null);

    if (brand) {
      fetchSeries(brand);
      fetchProductVariantByBrandSlug(brand);
    } else {
      setSeriesList([]);
      fetchProductVariant(); // Hoặc tải lại danh sách mặc định ban đầu nếu chọn "Tất cả"
    }
  };

  // Xử lý khi click chọn series
  const handleSelectSerie = (serie: SerieWithBrand | null) => {
    setSelectedSeries(serie);

    setSelectedRam(null);
    setSelectedStorage(null);
    setSelectedPrice(null);

    if (serie) {
      fetchProductVariantBySerie(serie);
    } else if (selectedBrand) {
      fetchProductVariantByBrandSlug(selectedBrand);
    } else {
      fetchProductVariant();
    }
  };
  // Khi chọn ram
  const handleSelectRam = (ramId: number) => {
    setSelectedRam((prev) => (prev === ramId ? null : ramId));
  };

  //Khi chọn rom
  const handleSelectStorage = (storageId: number) => {
    setSelectedStorage((prev) => (prev === storageId ? null : storageId));
  };

  //Khi chọn giá
  const handleSelectPrice = (min: number, max?: number) => {
    setSelectedPrice((prev) => {
      if (prev?.min === min && prev?.max === max) {
        return null;
      }

      return { min, max };
    });
  };

  const handleResetFilter = () => {
    setSelectedRam(null);
    setSelectedStorage(null);
    setSelectedPrice(null);
  };

  const filteredProductVariantList = useMemo(() => {
    let result = [...productVariantList];

    if (selectedRam !== null) {
      result = result.filter((variant) => variant.ram_id === selectedRam);
    }

    if (selectedStorage !== null) {
      result = result.filter(
        (variant) => variant.storage_id === selectedStorage,
      );
    }

    if (selectedPrice !== null) {
      result = result.filter((variant) => {
        const price = Number(variant.price);

        if (selectedPrice.max === undefined) {
          return price >= selectedPrice.min;
        }

        return price >= selectedPrice.min && price <= selectedPrice.max;
      });
    }

    return result;
  }, [productVariantList, selectedRam, selectedStorage, selectedPrice]);

  useEffect(() => {
    let isMounted = true;

    async function loadProductVariant() {
      if (isMounted) {
        await fetchProductVariant();
      }
    }

    async function loadBrands() {
      if (isMounted) {
        await fetchBrands();
      }
    }
    async function loadRams() {
      if (isMounted) {
        await fetchRams();
      }
    }

    async function loadStorages() {
      if (isMounted) {
        await fetchStorage();
      }
    }
    loadProductVariant();
    loadBrands();
    loadRams();
    loadStorages();

    return () => {
      isMounted = false;
    };
  }, []);

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

      {/* 2. MENU DANH SÁCH BRANDS & SERIES SELECTION */}
      <section className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
            Thương hiệu nổi bật
          </h2>
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => handleSelectBrand(null)}
              className={`px-4 py-2 rounded-lg text-xs font-medium border whitespace-nowrap transition ${
                selectedBrand === null
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:border-blue-400"
              }`}
            >
              Tất cả
            </button>
            {brandsList.map((brand) => (
              <button
                key={brand.id}
                onClick={() => handleSelectBrand(brand)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium border whitespace-nowrap transition ${
                  selectedBrand?.id === brand.id
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-slate-700 border-slate-200 hover:border-blue-400"
                }`}
              >
                {brand.logo && (
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className="w-4 h-4 object-contain"
                  />
                )}
                <span>{brand.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Danh sách Series Selection hiển thị ngay bên dưới khi đã chọn Brand */}
        {selectedBrand && seriesList.length > 0 && (
          <div className="pt-3 border-t border-slate-100">
            <h3 className="text-xs font-semibold text-slate-500 mb-2">
              Dòng sản phẩm ({selectedBrand.name})
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleSelectSerie(null)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium border transition ${
                  selectedSeries === null
                    ? "bg-slate-800 text-white border-slate-800"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                Tất cả dòng
              </button>
              {seriesList.map((serie) => (
                <button
                  key={serie.id}
                  onClick={() => handleSelectSerie(serie)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium border transition ${
                    selectedSeries?.id === serie.id
                      ? "bg-slate-800 text-white border-slate-800"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {serie.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 3. BỘ LỌC ĐƠN GIẢN */}

      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <Accordion>
          <AccordionItem value="filter" className="border-none">
            {/* Header */}
            <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-slate-50/75 transition-colors">
              <div className="flex items-center justify-between w-full pr-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-blue-50">
                    <Filter className="w-4 h-4 text-blue-600" />
                  </div>

                  <div className="text-left">
                    <h3 className="text-sm font-bold text-slate-800">
                      Bộ lọc tìm kiếm
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Lọc sản phẩm theo mức giá, RAM và bộ nhớ
                    </p>
                  </div>
                </div>

                {/* Dùng span thay vì Button/button để tránh lỗi lồng thẻ button */}
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation(); // Ngăn sự kiện mở/đóng accordion khi bấm đặt lại
                    handleResetFilter();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.stopPropagation();
                      handleResetFilter();
                    }
                  }}
                  className="text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
                >
                  Đặt lại
                </span>
              </div>
            </AccordionTrigger>

            {/* Toàn bộ nội dung filter */}
            <AccordionContent className="px-5 pb-5">
              <div className="border-t border-slate-100 pt-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* 1. MỨC GIÁ */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1 h-4 rounded-full bg-blue-500" />
                      <h4 className="text-xs font-bold text-slate-700">
                        Mức giá
                      </h4>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: "4 - 7 triệu", min: 4000000, max: 7000000 },
                        { label: "7 - 13 triệu", min: 7000000, max: 13000000 },
                        {
                          label: "13 - 20 triệu",
                          min: 13000000,
                          max: 20000000,
                        },
                        { label: "Trên 20 triệu", min: 20000000 },
                      ].map((item) => {
                        const isSelected =
                          selectedPrice?.min === item.min &&
                          selectedPrice?.max === item.max;

                        return (
                          <button
                            key={item.label}
                            type="button"
                            onClick={() =>
                              handleSelectPrice(item.min, item.max)
                            }
                            className={`px-3.5 py-2 rounded-lg border text-xs font-medium transition-all ${
                              isSelected
                                ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                                : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600"
                            }`}
                          >
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. RAM */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1 h-4 rounded-full bg-blue-500" />
                      <h4 className="text-xs font-bold text-slate-700">
                        Dung lượng RAM
                      </h4>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {ramList.map((ram) => {
                        const isSelected = selectedRam === ram.id;

                        return (
                          <button
                            key={ram.id}
                            type="button"
                            onClick={() => handleSelectRam(ram.id)}
                            className={`min-w-[58px] px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                              isSelected
                                ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                                : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600"
                            }`}
                          >
                            {ram.value}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3. ROM (BỘ NHỚ TRONG) */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1 h-4 rounded-full bg-blue-500" />
                      <h4 className="text-xs font-bold text-slate-700">
                        Bộ nhớ trong (ROM)
                      </h4>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {storageList.map((storage) => {
                        const isSelected = selectedStorage === storage.id;

                        return (
                          <button
                            key={storage.id}
                            type="button"
                            onClick={() => handleSelectStorage(storage.id)}
                            className={`min-w-[62px] px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                              isSelected
                                ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                                : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600"
                            }`}
                          >
                            {storage.value}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      {/* 4. DANH SÁCH SẢN PHẨM THEO SERIES (ĐÃ THAY THẾ) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            {selectedSeries && selectedBrand
              ? `Sản phẩm thuộc ${selectedBrand.name} / ${selectedSeries.name}`
              : selectedBrand
                ? `Sản phẩm thuộc ${selectedBrand.name}`
                : "Tất cả sản phẩm nổi bật"}
          </h2>
          <Link
            href="#"
            className="text-xs text-blue-600 hover:underline font-semibold flex items-center"
          >
            Xem tất cả <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {filteredProductVariantList.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProductVariantList.map((variant, index) => {
              const formattedPrice = Number(variant.price).toLocaleString(
                "vi-VN",
              );
              const formattedCostPrice = variant.cost_price
                ? Number(variant.cost_price).toLocaleString("vi-VN")
                : null;

              return (
                <div
                  key={variant.id}
                  className="
    group relative flex flex-col justify-between
    overflow-hidden rounded-2xl
    border border-slate-200/80
    bg-white p-4
    shadow-[0_2px_8px_rgba(15,23,42,0.06)]
    transition-all duration-300 ease-out
    hover:-translate-y-1.5
    hover:border-blue-200
    hover:shadow-[0_12px_30px_rgba(37,99,235,0.15)]
  "
                >
                  <div>
                    {/* IMAGE */}
                    <div
                      className="
        relative mb-4 aspect-square w-full
        overflow-hidden rounded-xl
        bg-gradient-to-br from-slate-50 to-slate-100
        ring-1 ring-slate-200/60
        transition-all duration-300
        group-hover:ring-blue-200
        group-hover:shadow-inner
      "
                    >
                      <span
                        className="
          absolute left-2.5 top-2.5 z-10
          rounded-full
          bg-red-500 px-2.5 py-1
          text-[10px] font-bold text-white
          shadow-md shadow-red-500/20
        "
                      >
                        {variant.colors?.name || "Chính hãng"}
                      </span>

                      <div
                        className="
          flex h-full w-full items-center justify-center
          transition-transform duration-500
          group-hover:scale-105
        "
                      >
                        <img
                          src={
                            variant.product_images[0]?.image_url ??
                            "/placeholder.png"
                          }
                          alt={variant.products.name}
                          className="h-full w-full object-contain p-3"
                        />
                      </div>

                      {/* lớp sáng nhẹ khi hover */}
                      <div
                        className="
          pointer-events-none absolute inset-0
          bg-gradient-to-tr from-blue-500/0 via-white/0 to-white/40
          opacity-0 transition-opacity duration-300
          group-hover:opacity-100
        "
                      />
                    </div>

                    {/* RAM / STORAGE */}
                    <div className="mb-2.5 flex gap-1.5">
                      {variant.rams?.value && (
                        <span
                          className="
            rounded-md bg-slate-100 px-2 py-1
            text-[10px] font-semibold text-slate-600
            transition-colors
            group-hover:bg-blue-50 group-hover:text-blue-600
          "
                        >
                          RAM: {variant.rams.value}
                        </span>
                      )}

                      {variant.storages?.value && (
                        <span
                          className="
            rounded-md bg-slate-100 px-2 py-1
            text-[10px] font-semibold text-slate-600
            transition-colors
            group-hover:bg-blue-50 group-hover:text-blue-600
          "
                        >
                          {variant.storages.value}
                        </span>
                      )}
                    </div>

                    {/* PRODUCT NAME */}
                    <h3
                      className="
        mb-2 line-clamp-2
        text-sm font-semibold leading-5 text-slate-800
        transition-colors duration-200
        group-hover:text-blue-600
      "
                    >
                      {variant.products?.name} - {variant.colors?.name} (
                      {variant.storages?.value})
                    </h3>
                  </div>

                  {/* FOOTER */}
                  <div
                    className="
      mt-2 space-y-2.5
      border-t border-slate-100
      pt-3
    "
                  >
                    {/* PRICE */}
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-extrabold tracking-tight text-blue-600">
                        {formattedPrice}đ
                      </span>

                      {formattedCostPrice && (
                        <span className="text-xs text-slate-400 line-through">
                          {formattedCostPrice}đ
                        </span>
                      )}
                    </div>

                    {/* RATING + BUTTON */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="h-3.5 w-3.5 fill-yellow-400" />

                        <span className="text-xs font-bold text-slate-700">
                          4.9
                        </span>

                        <span className="text-xs text-slate-400">
                          ({variant.stock})
                        </span>
                      </div>

                      <Link
                        href={`/products/${variant.products.slug}?variant=${variant.id}`}
                      >
                        <button
                          className="
          rounded-lg
          bg-blue-50 px-3 py-1.5
          text-xs font-bold text-blue-600
          shadow-sm
          transition-all duration-200
          hover:-translate-y-0.5
          hover:bg-blue-600
          hover:text-white
          hover:shadow-md hover:shadow-blue-600/25
          active:translate-y-0
        "
                        >
                          Chi tiết
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-100 p-12 text-center text-slate-400">
            <p className="text-sm">
              Vui lòng chọn một dòng sản phẩm (Series) để hiển thị danh sách
              biến thể.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
