/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type { cart_items, products } from "@/app/generated/prisma/client";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import type { ProductVariant } from "@/lib/repositories/product/products_variant.repository";
import type { ApiResponse } from "@/lib/types/public/types";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Home,
  ShoppingCart,
  Star,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const formatPrice = (price: number | string) => {
  const numPrice = Number(price);
  if (isNaN(numPrice)) return "Liên hệ";
  return `${numPrice.toLocaleString("vi-VN")}đ`;
};

interface ProductDetailProps {
  product: products;
  variant_id: number;
}

export default function ProductDetail({
  product,
  variant_id,
}: ProductDetailProps) {
  const searchParams = useSearchParams();
  const variantParam = searchParams.get("variant");

  const [productVariants, setProductVariants] = useState<ProductVariant[]>([]);
  const [specifications, setSpecifications] = useState<any[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(true);

  // State quản lý số lượng sản phẩm gợi ý hiển thị (mặc định 6)
  const [visibleCount, setVisibleCount] = useState(6);

  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedRam, setSelectedRam] = useState<string>("");
  const [selectedRom, setSelectedRom] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState(0);

  // States quản lý hình ảnh: Ảnh chung + Ảnh theo màu
  const [generalImages, setGeneralImages] = useState<any[]>([]);
  const [colorImages, setColorImages] = useState<any[]>([]);
  const [loadingColorImages, setLoadingColorImages] = useState(false);

  /* =========================================================
      1. FETCH ẢNH CHUNG (TYPE = GENERAL)
  ========================================================= */
  const fetchGeneralImages = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/product_manager/product_images?product_id=${product.id}&type=general`,
        { cache: "no-store" },
      );
      const json = await res.json();
      if (json.success) {
        setGeneralImages(json.data || []);
      }
    } catch (err) {
      console.error("Lỗi lấy danh sách ảnh chung:", err);
    }
  }, [product.id]);

  /* =========================================================
      2. FETCH ẢNH THEO MÀU (VARIANT_ID)
  ========================================================= */
  const fetchImagesByVariantId = useCallback(
    async (variantId: number) => {
      if (!variantId) {
        setColorImages([]);
        return;
      }
      try {
        setLoadingColorImages(true);
        const res = await fetch(
          `/api/product_manager/product_images?product_id=${product.id}&variant_id=${variantId}`,
          { cache: "no-store" },
        );
        const json = await res.json();
        if (json.success) {
          setColorImages(json.data || []);
        } else {
          setColorImages([]);
        }
      } catch (err) {
        console.error("Lỗi lấy ảnh theo variant_id:", err);
        setColorImages([]);
      } finally {
        setLoadingColorImages(false);
      }
    },
    [product.id],
  );

  /* =========================================================
      3. FETCH SẢN PHẨM GỢI Ý CÙNG BRAND
  ========================================================= */
  const fetchRelatedProductsByBrand = useCallback(
    async (brand_id: number) => {
      try {
        const res = await fetch(
          `/api/catalogs/brands/id/${brand_id}/products`,
          {
            cache: "no-store",
          },
        );
        const json = await res.json();
        if (json.success || json.data) {
          const list = json.data.filter((p: any) => p.id !== product.id);
          setRelatedProducts(list);
        }
      } catch (err) {
        console.error("Lỗi lấy sản phẩm gợi ý cùng hãng:", err);
      }
    },
    [product.id],
  );

  /* =========================================================
      INITIAL DATA
  ========================================================= */
  useEffect(() => {
    async function fetchProductData() {
      try {
        setLoading(true);

        const productVariantData = await fetch(
          `/api/product_manager/products/${product.id}/product_variants`,
        );
        const variantData = await productVariantData.json();
        let currentBrandId = null;

        if (variantData.success || variantData.data) {
          const listVariants: ProductVariant[] =
            variantData.data?.product_variants || [];
          setProductVariants(listVariants);

          if (listVariants.length > 0) {
            const matchedVariant = variantParam
              ? listVariants.find((v) => v.id === Number(variantParam))
              : null;

            const targetVariant = matchedVariant || listVariants[0];

            setSelectedColor(targetVariant.colors.name);
            setSelectedRam(targetVariant.rams.value);
            setSelectedRom(targetVariant.storages.value);

            if (targetVariant.id) {
              fetchImagesByVariantId(targetVariant.id);
            }
            currentBrandId =
              listVariants[0]?.products?.series?.brands?.id ||
              listVariants[0]?.products?.series?.brand_id;
          }
        }

        const specRes = await fetch(
          `/api/product_manager/products/${product.id}/product_specs`,
        );
        const specData = await specRes.json();
        if (specData.success || specData.data) {
          setSpecifications(specData.data);
        }

        await fetchGeneralImages();

        if (currentBrandId) {
          await fetchRelatedProductsByBrand(currentBrandId);
        }
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu trang chi tiết sản phẩm:", err);
      } finally {
        setLoading(false);
      }
    }

    if (product.id) {
      fetchProductData();
    }
  }, [
    product,
    variantParam,
    fetchGeneralImages,
    fetchImagesByVariantId,
    fetchRelatedProductsByBrand,
  ]);

  /* =========================================================
      OPTIONS & GỘP ẢNH HIỂN THỊ
  ========================================================= */
  const colors = useMemo(() => {
    return Array.from(
      new Map(
        productVariants.map((variant) => [
          variant.colors.name,
          {
            name: variant.colors.name,
            colorCode: variant.colors.hex_code || "#000000",
          },
        ]),
      ).values(),
    );
  }, [productVariants]);

  const rams = useMemo(() => {
    return Array.from(
      new Set(productVariants.map((variant) => variant.rams.value)),
    );
  }, [productVariants]);

  const roms = useMemo(() => {
    return Array.from(
      new Set(
        productVariants
          .filter(
            (variant) =>
              variant.colors.name === selectedColor &&
              variant.rams.value === selectedRam,
          )
          .map((variant) => variant.storages.value),
      ),
    );
  }, [productVariants, selectedColor, selectedRam]);

  const selectedVariant = useMemo(() => {
    return productVariants.find(
      (variant) =>
        variant.colors.name === selectedColor &&
        variant.rams.value === selectedRam &&
        variant.storages.value === selectedRom,
    );
  }, [productVariants, selectedColor, selectedRam, selectedRom]);

  const images = useMemo(() => {
    const colorUrls = colorImages.map((img) => img.image_url);
    const generalUrls = generalImages.map((img) => img.image_url);

    if (colorUrls.length > 0) {
      const uniqueGeneral = generalUrls.filter(
        (url) => !colorUrls.includes(url),
      );
      return [...colorUrls, ...uniqueGeneral];
    }
    return generalUrls;
  }, [colorImages, generalImages]);

  /* =========================================================
      HANDLERS THAY ĐỔI
  ========================================================= */
  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    setSelectedImage(0);

    const availableVariant = productVariants.find(
      (variant) =>
        variant.colors.name === color && variant.rams.value === selectedRam,
    );

    const targetVariant =
      availableVariant || productVariants.find((v) => v.colors.name === color);

    if (targetVariant) {
      setSelectedRom(targetVariant.storages.value);
      if (targetVariant.id) {
        fetchImagesByVariantId(targetVariant.id);
      }
    }
  };

  const handleRamChange = (ram: string) => {
    setSelectedRam(ram);
    setSelectedImage(0);

    const availableVariant = productVariants.find(
      (variant) =>
        variant.colors.name === selectedColor && variant.rams.value === ram,
    );

    if (availableVariant) {
      setSelectedRom(availableVariant.storages.value);
      if (availableVariant.id) {
        fetchImagesByVariantId(availableVariant.id);
      }
    }
  };

  const handleRomChange = (rom: string) => {
    setSelectedRom(rom);
    setSelectedImage(0);

    const availableVariant = productVariants.find(
      (variant) =>
        variant.colors.name === selectedColor &&
        variant.rams.value === selectedRam &&
        variant.storages.value === rom,
    );

    if (availableVariant && availableVariant.id) {
      fetchImagesByVariantId(availableVariant.id);
    }
  };

  const handleAddCart = async (selectedVariant: ProductVariant) => {
    try {
      const response = await fetch("/api/users/cart/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          variant_id: selectedVariant.id,
          quantity: 1,
        }),
      });

      const result: ApiResponse<cart_items> = await response.json();

      if (result.success) {
        toast.success(result.message || "Thêm giỏ hàng thành công", {
          description: `${selectedVariant.products.name} đã thêm vào giỏ hàng`,
        });
      } else {
        toast.error(result.message || "Thêm giỏ hàng thất bại");
      }
    } catch (error) {
      console.error("Lỗi thêm vào giỏ hàng:", error);
      toast.error("Không thể kết nối đến máy chủ. Vui lòng thử lại sau!");
    }
  };

  const previousImage = () => {
    if (images.length === 0) return;
    setSelectedImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextImage = () => {
    if (images.length === 0) return;
    setSelectedImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-slate-500">
        Đang tải thông tin sản phẩm...
      </div>
    );
  }
  const productInfo = productVariants[0]?.products;
  const brandInfo = productInfo?.series?.brands;

  return (
    <div className="container mx-auto px-4 py-6 space-y-5">
      <div className="mb-6">
        <Breadcrumb>
          <BreadcrumbList className="flex items-center gap-1.5 sm:gap-2.5 text-sm font-medium">
            {/* Trang chủ kèm Icon Home */}
            <BreadcrumbItem>
              <BreadcrumbLink
                href="/"
                className="group flex items-center gap-1.5 text-slate-500 hover:text-blue-600 transition-colors bg-slate-100/70 hover:bg-blue-50 px-3 py-1.5 rounded-xl border border-slate-200/60"
              >
                <Home className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                <span>Trang chủ</span>
              </BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbSeparator>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </BreadcrumbSeparator>

            {/* Tên sản phẩm ở cuối */}
            <BreadcrumbItem>
              <BreadcrumbPage className="max-w-[200px] sm:max-w-xs md:max-w-md truncate font-bold text-blue-600 bg-blue-50/80 border border-blue-100 px-3 py-1.5 rounded-xl">
                {product.name}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      {/* PHẦN 1: ẢNH + THÔNG TIN MUA HÀNG */}
      <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT - IMAGE */}
          <div>
            <div className="relative aspect-square rounded-xl bg-slate-50 overflow-hidden flex items-center justify-center">
              {loadingColorImages && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-10 text-xs text-slate-500">
                  Đang tải ảnh theo màu...
                </div>
              )}

              {images.length > 0 ? (
                <Image
                  src={images[selectedImage]}
                  alt={productInfo?.name || "Ảnh sản phẩm"}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-contain p-8"
                />
              ) : (
                <span className="text-sm text-slate-400">
                  Không có hình ảnh
                </span>
              )}

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={previousImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow flex items-center justify-center hover:bg-slate-100 transition"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow flex items-center justify-center hover:bg-slate-100 transition"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail */}
            <div className="flex gap-3 mt-4 overflow-x-auto">
              {images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setSelectedImage(index)}
                  className={`relative w-20 h-20 shrink-0 rounded-lg border overflow-hidden bg-slate-50 ${
                    selectedImage === index
                      ? "border-blue-600 ring-2 ring-blue-100"
                      : "border-slate-200"
                  }`}
                >
                  <Image
                    src={image}
                    alt={`Ảnh ${index + 1}`}
                    fill
                    sizes="80px"
                    className="object-contain p-2"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT - INFORMATION */}
          <div className="flex flex-col">
            <div>
              <span className="text-xs font-medium text-blue-600">
                {brandInfo?.name || "Thương hiệu"}
              </span>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 mt-1">
                {productInfo?.name || "Tên sản phẩm"}
              </h1>
              <div className="flex items-center gap-2 mt-3">
                <div className="flex items-center gap-1 text-yellow-500">
                  <Star className="w-4 h-4 fill-yellow-400" />
                  <span className="font-semibold text-slate-800">4.8</span>
                </div>
                <span className="text-slate-300">|</span>
                <span className="text-sm text-slate-500">128 đánh giá</span>
              </div>
            </div>

            {/* Price */}
            <div className="mt-5 p-4 rounded-xl bg-slate-50">
              <span className="text-2xl font-bold text-blue-600">
                {selectedVariant
                  ? formatPrice(Number(selectedVariant.price))
                  : "Liên hệ"}
              </span>
            </div>

            {/* Status */}
            <div className="mt-4">
              {selectedVariant?.status === true ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-xs font-semibold">
                  <Check className="w-4 h-4" />
                  Đang kinh doanh (Kho: {selectedVariant.stock ?? 0})
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-semibold">
                  Ngừng kinh doanh
                </span>
              )}
            </div>

            {/* COLOR */}
            <div className="mt-6">
              <p className="text-sm font-semibold text-slate-800 mb-3">
                Màu sắc:
                <span className="font-normal text-slate-500 ml-1">
                  {selectedColor}
                </span>
              </p>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() => handleColorChange(color.name)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition ${
                      selectedColor === color.name
                        ? "border-blue-600 bg-blue-50 text-blue-600"
                        : "border-slate-200 hover:border-blue-400"
                    }`}
                  >
                    <span
                      className="w-4 h-4 rounded-full border border-slate-300"
                      style={{ backgroundColor: color.colorCode }}
                    />
                    {color.name}
                  </button>
                ))}
              </div>
            </div>

            {/* RAM */}
            <div className="mt-5">
              <p className="text-sm font-semibold text-slate-800 mb-3">RAM</p>
              <div className="flex flex-wrap gap-2">
                {rams.map((ram) => (
                  <button
                    key={ram}
                    type="button"
                    onClick={() => handleRamChange(ram)}
                    className={`px-4 py-2 rounded-lg border text-sm transition ${
                      selectedRam === ram
                        ? "border-blue-600 bg-blue-50 text-blue-600 font-semibold"
                        : "border-slate-200 hover:border-blue-400"
                    }`}
                  >
                    {ram}
                  </button>
                ))}
              </div>
            </div>

            {/* ROM */}
            <div className="mt-5">
              <p className="text-sm font-semibold text-slate-800 mb-3">
                Bộ nhớ trong
              </p>
              <div className="flex flex-wrap gap-2">
                {roms.map((rom) => (
                  <button
                    key={rom}
                    type="button"
                    onClick={() => handleRomChange(rom)}
                    className={`px-4 py-2 rounded-lg border text-sm transition ${
                      selectedRom === rom
                        ? "border-blue-600 bg-blue-50 text-blue-600 font-semibold"
                        : "border-slate-200 hover:border-blue-400"
                    }`}
                  >
                    {rom}
                  </button>
                ))}
              </div>
            </div>

            {/* BUTTONS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8">
              <button
                type="button"
                disabled={selectedVariant?.status !== true}
                onClick={() => handleAddCart(selectedVariant!)}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-blue-600 text-blue-600 font-semibold hover:bg-blue-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-5 h-5" />
                Thêm vào giỏ hàng
              </button>
              <button
                type="button"
                disabled={selectedVariant?.status !== true}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Zap className="w-5 h-5" />
                Mua ngay
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* PHẦN 2: CHIA 2 CỘT (CỘT TRÁI: SPECIFICATIONS | CỘT PHẢI: GỢI Ý SP CÙNG HÃNG) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* CỘT TRÁI: THÔNG SỐ KỸ THUẬT */}
        <section className="lg:col-span-7 bg-white rounded-2xl border border-slate-100 shadow-sm p-5 lg:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">
              Thông số kỹ thuật
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Thông tin chi tiết của sản phẩm
            </p>
          </div>

          <div className="space-y-6">
            {specifications.length === 0 ? (
              <p className="text-sm text-slate-400">
                Chưa có thông số kỹ thuật.
              </p>
            ) : (
              <div className="space-y-6">
                {specifications.map((group: any) => (
                  <div
                    key={group.groupId}
                    className="border border-slate-100 rounded-xl overflow-hidden"
                  >
                    <div className="bg-slate-100 px-4 py-2.5 font-semibold text-slate-800 text-sm border-b border-slate-200">
                      {group.groupName}
                    </div>
                    <div>
                      {group.specs?.map((spec: any, index: number) => (
                        <div
                          key={spec.specId || index}
                          className={`grid grid-cols-1 sm:grid-cols-3 text-sm border-b border-slate-100 last:border-b-0 ${
                            index % 2 === 0 ? "bg-white" : "bg-slate-50"
                          }`}
                        >
                          <div className="px-4 py-3 font-medium text-slate-600">
                            {spec.keyName}
                          </div>
                          <div className="px-4 py-3 sm:col-span-2 text-slate-800">
                            {spec.value} {spec.unit ? spec.unit : ""}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CỘT PHẢI: SẢN PHẨM GỢI Ý CÙNG HÃNG */}
        <section className="lg:col-span-5 bg-white rounded-2xl border border-slate-100 shadow-sm p-5 lg:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">
              Gợi ý cho bạn {brandInfo?.name ? `(${brandInfo.name})` : ""}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Các sản phẩm tương tự bạn có thể thích
            </p>
          </div>

          {relatedProducts.length === 0 ? (
            <p className="text-sm text-slate-400">
              Không có sản phẩm gợi ý nào.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {relatedProducts
                  .slice(0, visibleCount)
                  .map((variant: ProductVariant) => {
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

              {/* Nút Xem thêm */}
              {visibleCount < relatedProducts.length && (
                <div className="mt-6 text-center">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((prev) => prev + 6)}
                    className="px-6 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition"
                  >
                    Xem thêm
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
