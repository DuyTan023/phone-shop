/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ProductWithSerie } from "@/lib/repositories/product/product.repository";
import type { ApiResponse } from "@/lib/types/public/types";
import {
  ArrowLeft,
  ExternalLink,
  Eye,
  FileText,
  Image as ImageIcon,
  Layers,
  Save,
  Sliders,
  Trash2,
  UploadCloud,
} from "lucide-react";
import Link from "next/link";

import TabProductVariantInfo from "@/lib/components/ui/product_manager/product_variants/TabProductVariantInfo";
import TabProductInfo from "@/lib/components/ui/product_manager/products/TabProductInfo";
import type { UpdateProductInput } from "@/lib/types/products/product.type";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

export default function PhoneDetailPage() {
  const params = useParams();
  const id = Number(params.id);

  //khai báo state lưu product
  const [product, setProduct] = useState<ProductWithSerie | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<UpdateProductInput>();

  // gọi API
  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        //gọi API
        const respone = await fetch(`/api/product_manager/products/${id}`);
        const result: ApiResponse<ProductWithSerie> = await respone.json();
        //kiểm tra success từ API
        if (!respone.ok || !result.success) {
          throw new Error(result.message || "Không thể lấy thông tin sản phẩm");
        }

        if (result.data) {
          setProduct(result.data);
        }
      } catch (err: any) {
        setError(err.message || "Đã có lỗi xảy ra");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (!product) return;

    form.reset({
      name: product.name,
      slug: product.slug,
      description: product.description ?? "",
      serie_id: product.serie_id,
    });
  }, [product]);

  if (loading) {
    return <div className="p-6">Đang tải thông tin sản phẩm...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">Lỗi: {error}</div>;
  }

  if (!product) {
    return <div className="p-6">Không tìm thấy sản phẩm.</div>;
  }

  return (
    <div className="w-full space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link
          href="/admin/phones"
          className="hover:text-blue-600 transition-colors"
        >
          Sản phẩm
        </Link>
        <span>/</span>
        <span className="font-medium text-slate-900">{product.name}</span>
      </div>

      {/* Header Info Bar */}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/phones">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 shrink-0 border-slate-200 hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4 text-slate-600" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-slate-900">
                {product.name}
              </h1>
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
                {product.series.release_year}
              </Badge>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              ID: {product.id} <span className="mx-1">•</span> Slug:{" "}
              {product.slug}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs text-slate-700 hover:bg-slate-50"
          >
            <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
            Xem trên Web
          </Button>
          <Button
            size="sm"
            className="gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-200"
          >
            <Save className="h-3.5 w-3.5" />
            Lưu thay đổi
          </Button>
        </div>
      </div>

      {/* TABS CONTAINER */}
      <Tabs
        defaultValue="skus"
        className="flex w-full flex-col space-y-5"
        style={{ display: "flex", flexDirection: "column" }}
      >
        {/* DÒNG 1: TABS HEADER VỚI BADGE & COLOR HIGHLIGHT */}
        <div className="w-full shrink-0 border-b border-slate-200 pb-3">
          <TabsList className="flex h-auto w-full justify-start gap-2 bg-transparent p-0 overflow-x-auto">
            <TabsTrigger
              value="general"
              className="flex items-center gap-2 rounded-lg border border-slate-200/80 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 shadow-sm transition-all hover:bg-slate-50 data-[state=active]:border-blue-600 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600"
            >
              <FileText className="h-4 w-4" />
              <span>Thông tin chung</span>
            </TabsTrigger>

            <TabsTrigger
              value="skus"
              className="flex items-center gap-2 rounded-lg border border-slate-200/80 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 shadow-sm transition-all hover:bg-slate-50 data-[state=active]:border-indigo-600 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600"
            >
              <Layers className="h-4 w-4" />
              <span>Biến thể (SKUs)</span>
              <span className="ml-1 rounded-full bg-indigo-100 px-1.5 py-0.5 text-[10px] text-indigo-700 font-bold">
                {(product as any)._count?.product_variants ?? 0}
              </span>
            </TabsTrigger>

            <TabsTrigger
              value="specs"
              className="flex items-center gap-2 rounded-lg border border-slate-200/80 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 shadow-sm transition-all hover:bg-slate-50 data-[state=active]:border-violet-600 data-[state=active]:bg-violet-50 data-[state=active]:text-violet-600"
            >
              <Sliders className="h-4 w-4" />
              <span>Thông số kỹ thuật</span>
            </TabsTrigger>

            <TabsTrigger
              value="gallery"
              className="flex items-center gap-2 rounded-lg border border-slate-200/80 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 shadow-sm transition-all hover:bg-slate-50 data-[state=active]:border-amber-600 data-[state=active]:bg-amber-50 data-[state=active]:text-amber-600"
            >
              <ImageIcon className="h-4 w-4" />
              <span>Thư viện ảnh</span>
              <span className="ml-1 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-700 font-bold">
                4
              </span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* DÒNG 2: NỘI DUNG TABS */}

        <div className="w-full shrink-0">
          {/* TAB 1: THÔNG TIN CHUNG */}
          <TabProductInfo
            product={product}
            onUpdateSuccess={(updatedProduct) => {
              // Cập nhật lại state của cha (bao gồm cả quan hệ series nếu API trả về)
              setProduct((prev) =>
                prev ? { ...prev, ...updatedProduct } : updatedProduct,
              );
            }}
          />

          {/* TAB 2: BIẾN THỂ SKUS */}
          <TabProductVariantInfo product_id={product.id} />

          {/* TAB 3: THÔNG SỐ KỸ THUẬT */}
          <TabsContent value="specs" className="m-0 focus-visible:outline-none">
            <div className="rounded-xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Thông số kỹ thuật chi tiết
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Thiết lập thông số cho trang so sánh và chi tiết sản phẩm.
                  </p>
                </div>
                <Button
                  size="sm"
                  className="gap-1.5 text-xs bg-violet-600 hover:bg-violet-700 text-white"
                >
                  <Save className="h-3.5 w-3.5" />
                  Lưu cấu hình
                </Button>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-700">
                    Màn hình
                  </Label>
                  <Input
                    defaultValue="6.7 inch, Super Retina XDR OLED, 120Hz"
                    className="border-slate-200"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-700">
                    Chip xử lý (CPU)
                  </Label>
                  <Input
                    defaultValue="Apple A17 Pro 6 nhân"
                    className="border-slate-200"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-700">
                    Camera sau
                  </Label>
                  <Input
                    defaultValue="Chính 48 MP & Phụ 12 MP, 12 MP"
                    className="border-slate-200"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-700">
                    Pin & Sạc
                  </Label>
                  <Input
                    defaultValue="4422 mAh, Sạc nhanh 20W"
                    className="border-slate-200"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* TAB 4: THƯ VIỆN ẢNH */}
          <TabsContent
            value="gallery"
            className="m-0 focus-visible:outline-none"
          >
            <div className="rounded-xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Bộ sưu tập ảnh sản phẩm
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Quản lý danh sách hình ảnh bổ sung cho sản phẩm.
                  </p>
                </div>
                <Button
                  size="sm"
                  className="gap-1.5 text-xs bg-amber-600 hover:bg-amber-700 text-white"
                >
                  <UploadCloud className="h-3.5 w-3.5" />
                  Tải ảnh lên
                </Button>
              </div>

              <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="group relative aspect-square rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center text-xs text-slate-400 font-medium overflow-hidden hover:border-amber-400 transition-all"
                  >
                    <span>Image {item}</span>
                    {/* Hover Actions */}
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-7 w-7 bg-white/90 hover:bg-white text-slate-700"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        className="h-7 w-7 bg-rose-600 hover:bg-rose-700"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
