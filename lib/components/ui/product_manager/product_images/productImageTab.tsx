"use client";

import {
  Check,
  CheckCircle2,
  ImagePlus,
  Info,
  Layers,
  Loader2,
  Star,
  Trash2,
  Upload,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import type { product_images } from "@/app/generated/prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { CreateProductImageDialog } from "./CreateProductImageDialog";

interface ColorOption {
  id?: number | string;
  variant_id?: number;
  color_id: number;
  color_name: string;
  hex_code?: string;
}

interface ProductImagesTabProps {
  productId: number;
}

export default function ProductImagesTab({ productId }: ProductImagesTabProps) {
  // State dữ liệu chung
  const [generalImages, setGeneralImages] = useState<product_images[]>([]);
  const [colorOptions, setColorOptions] = useState<ColorOption[]>([]);

  // State quản lý việc chọn màu sắc
  const [selectedColorId, setSelectedColorId] = useState<number>();

  // State ảnh theo màu
  const [colorImages, setColorImages] = useState<product_images[]>([]);
  const [loadingColorImages, setLoadingColorImages] = useState<boolean>(false);

  // State loading tổng & action
  const [loading, setLoading] = useState<boolean>(Boolean(productId));
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  // Modal Upload
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [uploadColorId, setUploadColorId] = useState<number | null>(null);
  const [imageUrlInput, setImageUrlInput] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false);

  // 1. Tải danh sách ảnh chung
  const fetchGeneralImages = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/product_manager/product_images?product_id=${productId}&type=general`,
      );
      const json = await res.json();
      if (json.success) setGeneralImages(json.data || []);
    } catch (err) {
      console.error("Lỗi lấy danh sách ảnh chung:", err);
    }
  }, [productId]);

  // 2. Tải danh sách màu cho Combobox
  const fetchColorOptions = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/product_manager/product_images?product_id=${productId}&type=color_options`,
      );
      const json = await res.json();
      if (json.success) setColorOptions(json.data || []);
    } catch (err) {
      console.error("Lỗi lấy danh sách màu sắc:", err);
    }
  }, [productId]);

  // 3. Tải danh sách ảnh theo màu khi biến selectedVariantId thay đổi
  const fetchImagesByColorId = useCallback(
    async (color_id: number) => {
      if (!color_id) {
        setColorImages([]);
        return;
      }
      try {
        setLoadingColorImages(true);
        const res = await fetch(
          `/api/product_manager/product_images?product_id=${productId}&color_id=${color_id}`,
        );
        const json = await res.json();
        if (json.success) {
          setColorImages(json.data || []);
        } else {
          setColorImages([]);
        }
      } catch (err) {
        console.error("Lỗi lấy ảnh theo màu:", err);
        setColorImages([]);
      } finally {
        setLoadingColorImages(false);
      }
    },
    [productId],
  );

  // Khởi tạo dữ liệu ban đầu
  useEffect(() => {
    if (!productId) return;
    let isSubscribed = true;

    const initData = async () => {
      try {
        await Promise.all([fetchGeneralImages(), fetchColorOptions()]);
      } catch (err) {
        console.error("Lỗi khởi tạo dữ liệu:", err);
      } finally {
        if (isSubscribed) setLoading(false);
      }
    };

    initData();
    return () => {
      isSubscribed = false;
    };
  }, [productId, fetchGeneralImages, fetchColorOptions]);

  // Xử lý khi chọn màu từ Combobox
  const handleSelectColor = (color_id: number) => {
    const nextVal = color_id;
    setSelectedColorId(nextVal);
    fetchImagesByColorId(nextVal);
  };

  // Thiết lập ảnh đại diện
  const handleSetFeatured = async (imageId: number) => {
    try {
      setActionLoadingId(imageId);
      const res = await fetch(
        `/api/product_manager/product_images/${imageId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "set_featured",
            product_id: productId,
          }),
        },
      );
      const json = await res.json();
      if (json.success) await fetchGeneralImages();
    } catch (err) {
      console.error("Lỗi đặt ảnh đại diện:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Xóa ảnh
  const handleDeleteImage = async (imageId: number, isColorImage = false) => {
    if (!confirm("Bạn có chắc chắn muốn xóa hình ảnh này không?")) return;
    try {
      setActionLoadingId(imageId);
      const res = await fetch(
        `/api/product_manager/product_images/${imageId}`,
        { method: "DELETE" },
      );
      const json = await res.json();
      if (json.success) {
        if (isColorImage && selectedColorId) {
          await fetchImagesByColorId(selectedColorId);
        } else {
          await fetchGeneralImages();
        }
      }
    } catch (err) {
      console.error("Lỗi xóa ảnh:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Mở modal upload
  const openUploadModal = (color_id: number | null = null) => {
    setUploadColorId(color_id);
    setImageUrlInput("");
    setIsUploadOpen(true);
  };

  // Xử lý upload ảnh
  const handleUploadSubmit = async () => {
    if (!imageUrlInput.trim()) return;
    const urls = imageUrlInput
      .split(/[\n,]+/)
      .map((u) => u.trim())
      .filter((u) => u.length > 0);
    if (urls.length === 0) return;

    try {
      setUploading(true);
      const body =
        urls.length === 1
          ? {
              product_id: productId,
              variant_id: uploadVariantId,
              image_url: urls[0],
            }
          : {
              product_id: productId,
              variant_id: uploadVariantId,
              image_urls: urls,
            };

      const res = await fetch("/api/product_manager/product_images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (json.success) {
        setIsUploadOpen(false);
        setImageUrlInput("");
        if (uploadVariantId) {
          await fetchImagesByVariant(String(uploadVariantId));
        } else {
          await fetchGeneralImages();
        }
      }
    } catch (err) {
      console.error("Lỗi upload:", err);
    } finally {
      setUploading(false);
    }
  };

  // Tìm đối tượng màu đang chọn (sử dụng so sánh kiểu String an toàn)
  const selectedColor =
    colorOptions.find(
      (c) => String(c.variant_id ?? c.id) === selectedVariantId,
    ) ?? null;

  // Tìm thông tin màu sắc đang được upload trong modal
  const currentUploadColor = colorOptions.find((c) => {
    const id = c.variant_id ?? c.id;
    return String(id) === String(uploadVariantId);
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* KHỐI 1: HÌNH ẢNH CHUNG */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" /> Hình ảnh chung sản
              phẩm
            </CardTitle>
            <CardDescription className="mt-1">
              Ảnh dùng chung cho tất cả các bản (Banner, ảnh đại diện sản
              phẩm...)
            </CardDescription>
          </div>
          <Button
            size="sm"
            className="gap-2"
            onClick={() => openUploadModal(null)}
          >
            <Upload className="h-4 w-4" /> Tải ảnh chung
          </Button>
        </CardHeader>
        <CardContent>
          {generalImages.length === 0 ? (
            <div
              onClick={() => openUploadModal(null)}
              className="text-center py-10 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/30"
            >
              <ImagePlus className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Chưa có hình ảnh chung nào.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {generalImages.map((img) => (
                <div
                  key={img.id}
                  className="group relative rounded-lg border overflow-hidden aspect-square"
                >
                  <img
                    src={img.image_url}
                    alt="General"
                    className="w-full h-full object-cover"
                  />
                  {img.is_featured && (
                    <Badge className="absolute top-2 left-2 bg-yellow-500 text-white gap-1 text-[10px]">
                      <Star className="h-3 w-3 fill-current" /> Đại diện
                    </Badge>
                  )}
                  {actionLoadingId === img.id ? (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-white" />
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                      {!img.is_featured && (
                        <Button
                          size="icon"
                          variant="secondary"
                          className="h-8 w-8"
                          onClick={() => handleSetFeatured(img.id)}
                        >
                          <Star className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="destructive"
                        className="h-8 w-8"
                        onClick={() => handleDeleteImage(img.id, false)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* KHỐI 2: HÌNH ẢNH THEO BIẾN THỂ MÀU */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" /> Hình ảnh theo Biến
            thể Màu
          </CardTitle>
          <CardDescription>
            Chọn màu sắc từ Combobox bên dưới để hiển thị danh sách ảnh của màu
            đó.
          </CardDescription>

          {/* PART 1: COMBOBOX CHỌN MÀU SẮC */}
          <div className="mt-4 p-4 border rounded-lg bg-muted/30 flex flex-col sm:flex-row items-start sm:items-end gap-4">
            <div className="grid w-full sm:w-80 gap-1.5">
              <Label className="font-medium">Chọn màu sắc:</Label>

              <Combobox
                items={colorOptions}
                value={selectedColor}
                itemToStringValue={(item) => item?.color_name ?? ""}
                itemToStringLabel={(item) => item?.color_name ?? ""}
                onValueChange={(item) => {
                  const id = item ? (item.variant_id ?? item.id) : "";
                  handleSelectColor(String(id));
                }}
              >
                <div className="relative w-full">
                  <ComboboxInput
                    placeholder="-- Chọn màu sắc --"
                    className="w-full border-blue-500 focus:border-blue-600 focus:ring-blue-500/20 bg-white"
                  />
                </div>

                <ComboboxContent className="bg-white border border-slate-200 shadow-md rounded-md z-[9999]">
                  <ComboboxEmpty className="p-3 text-sm text-slate-500">
                    Không tìm thấy màu phù hợp.
                  </ComboboxEmpty>

                  <ComboboxList className="max-h-60 overflow-y-auto p-1">
                    {(item) => {
                      const itemId = String(item.variant_id ?? item.id);
                      const isSelected = selectedVariantId === itemId;

                      return (
                        <ComboboxItem
                          key={itemId}
                          value={item}
                          className={cn(
                            "flex items-center gap-2 px-3 py-2 text-sm rounded-md cursor-pointer transition-colors",
                            "hover:bg-slate-100 focus:bg-slate-100",
                            isSelected && "bg-slate-100 font-medium",
                          )}
                        >
                          <Check
                            className={cn(
                              "h-4 w-4 shrink-0 text-blue-600",
                              isSelected ? "opacity-100" : "opacity-0",
                            )}
                          />

                          {item.hex_code && (
                            <span
                              className="w-4 h-4 rounded-full border border-slate-300 shrink-0 shadow-sm"
                              style={{ backgroundColor: item.hex_code }}
                            />
                          )}

                          {/* Đã sửa: dùng item.color_name chuẩn xác */}
                          <span className="text-slate-800">{item.name}</span>
                        </ComboboxItem>
                      );
                    }}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </div>

            <Button
              disabled={!selectedVariantId}
              onClick={() => openUploadModal(Number(selectedVariantId))}
              className="gap-2 w-full sm:w-auto"
            >
              <Upload className="h-4 w-4" /> Tải ảnh cho Màu này
            </Button>
          </div>
        </CardHeader>

        {/* PART 2: HIỂN THỊ DANH SÁCH ẢNH THEO MÀU ĐÃ CHỌN */}
        <CardContent>
          {!selectedVariantId && (
            <div className="text-center py-12 border border-dashed rounded-lg bg-muted/10">
              <Info className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Vui lòng chọn một màu sắc ở trên để xem danh sách hình ảnh tương
                ứng.
              </p>
            </div>
          )}

          {selectedVariantId && loadingColorImages && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary mb-2" />
              <p className="text-sm text-muted-foreground">
                Đang tải ảnh của màu {selectedColor?.color_name || "đã chọn"}...
              </p>
            </div>
          )}

          {selectedVariantId && !loadingColorImages && (
            <div className="border rounded-lg p-4 bg-background shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  {selectedColor?.hex_code && (
                    <span
                      className="w-4 h-4 rounded-full border border-slate-300 shrink-0 shadow-sm"
                      style={{ backgroundColor: selectedColor.hex_code }}
                    />
                  )}
                  <span className="font-semibold text-base">
                    Đang xem màu: {selectedColor?.name || "Không xác định"}
                  </span>
                  <Badge variant="secondary">{colorImages.length} ảnh</Badge>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                  onClick={() => openUploadModal(Number(selectedVariantId))}
                >
                  <ImagePlus className="h-4 w-4" /> Thêm ảnh
                </Button>
              </div>

              {colorImages.length === 0 ? (
                <div
                  onClick={() => openUploadModal(Number(selectedVariantId))}
                  className="border-2 border-dashed rounded-md p-8 text-center cursor-pointer hover:bg-muted/30"
                >
                  <ImagePlus className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Màu <strong>{selectedColor?.color_name || "này"}</strong>{" "}
                    chưa có ảnh. Nhấp vào đây để thêm.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {colorImages.map((img) => (
                    <div
                      key={img.id}
                      className="group relative rounded-md border overflow-hidden aspect-square shadow-sm"
                    >
                      <img
                        src={img.image_url}
                        alt={selectedColor?.color_name || "Color image"}
                        className="w-full h-full object-cover"
                      />
                      {actionLoadingId === img.id ? (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <Loader2 className="h-5 w-5 animate-spin text-white" />
                        </div>
                      ) : (
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Button
                            size="icon"
                            variant="destructive"
                            className="h-7 w-7"
                            onClick={() => handleDeleteImage(img.id, true)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* MODAL UPLOAD ẢNH */}
      <CreateProductImageDialog
        open={isUploadOpen}
        onOpenChange={setIsUploadOpen}
        productId={productId}
        variantId={uploadVariantId}
        colorName={currentUploadColor?.color_name}
        onSuccess={() => {
          // Tự động load lại danh sách tương ứng sau khi đăng ảnh thành công
          if (uploadVariantId) {
            fetchImagesByVariant(String(uploadVariantId));
          } else {
            fetchGeneralImages();
          }
        }}
      />
    </div>
  );
}
