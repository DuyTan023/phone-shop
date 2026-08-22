"use client";

import {
  Check,
  CheckCircle2,
  Eye,
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
import { UpdateProductImageDialog } from "./updateProductImageDialog";

export interface ColorOption {
  color_id: number;
  color_name: string;
  hex_code?: string;
  variant_id: number; // variant_id đại diện cho màu sắc này
}

interface ProductImagesTabProps {
  productId: number;
}

export default function ProductImagesTab({ productId }: ProductImagesTabProps) {
  // Quản lý State Dữ liệu
  const [generalImages, setGeneralImages] = useState<product_images[]>([]);
  const [featuredImages, setFeaturedImages] = useState<product_images | null>(
    null,
  );
  const [colorOptions, setColorOptions] = useState<ColorOption[]>([]);

  // State màu/variant đang được chọn trong Combobox
  const [selectedColorOption, setSelectedColorOption] =
    useState<ColorOption | null>(null);

  // State danh sách ảnh theo variant_id đã chọn
  const [colorImages, setColorImages] = useState<product_images[]>([]);
  const [loadingColorImages, setLoadingColorImages] = useState<boolean>(false);

  // State loading chung & action
  const [loading, setLoading] = useState<boolean>(Boolean(productId));
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  // State Modal Upload
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [uploadVariantId, setUploadVariantId] = useState<number | null>(null);
  const [uploadColorName, setUploadColorName] = useState<string | undefined>(
    undefined,
  );

  // -------------------------------------------------------------
  // Các hàm Fetch dữ liệu API
  // -------------------------------------------------------------

  // Tải danh sách ảnh chung (variant_id IS NULL hoặc type=general)
  const fetchGeneralImages = useCallback(async () => {
    try {
      const [generalRes, featuredRes] = await Promise.all([
        fetch(
          `/api/product_manager/product_images?product_id=${productId}&type=general`,
          {
            cache: "no-store",
          },
        ),
        fetch(
          `/api/product_manager/product_images?product_id=${productId}&type=featured`,
          {
            cache: "no-store",
          },
        ),
      ]);

      const generalJson = await generalRes.json();
      const featuredJson = await featuredRes.json();

      const general: product_images[] = generalJson.success
        ? generalJson.data || []
        : [];

      const featured: product_images | null = featuredJson.success
        ? featuredJson.data || null
        : null;

      setFeaturedImages(featured);

      // Gộp featured vào danh sách general
      setGeneralImages(
        featured
          ? [featured, ...general.filter((img) => img.id !== featured.id)]
          : general,
      );
    } catch (err) {
      console.error("Lỗi lấy danh sách ảnh:", err);
    }
  }, [productId]);

  // Tải danh sách màu sắc (kèm variant_id đại diện) cho Combobox
  const fetchColorOptions = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/product_manager/product_images/color-options?product_id=${productId}`,
      );
      const json = await res.json();
      if (json.success) setColorOptions(json.data || []);
    } catch (err) {
      console.error("Lỗi lấy danh sách màu sắc:", err);
    }
  }, [productId]);

  // Tải danh sách ảnh theo variant_id đại diện
  const fetchImagesByVariantId = useCallback(
    async (variantId: number) => {
      if (!variantId) {
        setColorImages([]);
        return;
      }
      try {
        setLoadingColorImages(true);
        const res = await fetch(
          `/api/product_manager/product_images?product_id=${productId}&variant_id=${variantId}`,
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
    [productId],
  );

  // Khởi tạo dữ liệu khi Component Mount / productId thay đổi
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

  // -------------------------------------------------------------
  // 3. Các hàm Xử lý Sự kiện (Event Handlers)
  // -------------------------------------------------------------

  // Chọn màu/variant từ Combobox
  const handleSelectColorOption = (option: ColorOption | null) => {
    setSelectedColorOption(option);
    if (option?.variant_id) {
      fetchImagesByVariantId(option.variant_id);
    } else {
      setColorImages([]);
    }
  };

  // Đặt làm ảnh đại diện (Đã được cập nhật tự động load không cần reload)
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
      if (json.success) {
        // Cập nhật Optimistic trên UI ngay lập tức
        setGeneralImages((prevImages) => {
          const updated = prevImages.map((img) => ({
            ...img,
            is_featured: img.id === imageId,
          }));

          // Sắp xếp đưa ảnh được chọn làm đại diện lên đầu danh sách
          const featuredItem = updated.find((img) => img.id === imageId);
          const remainingItems = updated.filter((img) => img.id !== imageId);

          return featuredItem ? [featuredItem, ...remainingItems] : updated;
        });

        // Gọi lại API fetchGeneralImages để đồng bộ chuẩn xác với cơ sở dữ liệu
        await fetchGeneralImages();

        // Nếu đang chọn danh sách ảnh theo màu, làm mới lại danh sách đó luôn
        if (selectedColorOption?.variant_id) {
          await fetchImagesByVariantId(selectedColorOption.variant_id);
        }
      }
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
        if (isColorImage && selectedColorOption?.variant_id) {
          await fetchImagesByVariantId(selectedColorOption.variant_id);
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

  // Mở modal upload ảnh
  const openUploadModal = (option: ColorOption | null = null) => {
    if (option) {
      setUploadVariantId(option.variant_id);
      setUploadColorName(option.color_name);
    } else {
      setUploadVariantId(null);
      setUploadColorName(undefined);
    }
    setIsUploadOpen(true);
  };

  const [editingImage, setEditingImage] = useState<product_images | null>(null);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);

  const openEditModal = (img: product_images) => {
    setEditingImage(img);
    setIsUpdateOpen(true);
  };

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
      {/* KHỐI 1: HÌNH ẢNH CHUNG SẢN PHẨM */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" /> Hình ảnh chung sản
              phẩm
            </CardTitle>
            <CardDescription className="mt-1">
              Ảnh dùng chung cho tất cả các phiên bản (Banner, ảnh đại diện sản
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
              className="text-center py-10 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/30 transition-colors"
            >
              <ImagePlus className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Chưa có hình ảnh chung nào. Nhấn vào đây để tải lên.
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
                          title="Đặt làm ảnh đại diện"
                        >
                          <Star className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="destructive"
                        className="h-8 w-8"
                        onClick={() => handleDeleteImage(img.id, false)}
                        title="Xóa hình ảnh"
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

      {/* KHỐI 2: HÌNH ẢNH THEO MÀU SẮC */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" /> Hình ảnh theo Màu
            sắc
          </CardTitle>
          <CardDescription>
            Chọn màu sắc từ Combobox bên dưới để hiển thị và quản lý hình ảnh
            tương ứng.
          </CardDescription>

          {/* COMBOBOX CHỌN MÀU SẮC */}
          <div className="mt-4 p-4 border rounded-lg bg-muted/30 flex flex-col sm:flex-row items-start sm:items-end gap-4">
            <div className="grid w-full sm:w-80 gap-1.5">
              <Label className="font-medium">Chọn màu sắc:</Label>

              <Combobox
                items={colorOptions}
                value={selectedColorOption}
                itemToStringValue={(item) => item?.color_name ?? ""}
                itemToStringLabel={(item) => item?.color_name ?? ""}
                onValueChange={(item) => handleSelectColorOption(item)}
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
                      const isSelected =
                        selectedColorOption?.variant_id === item.variant_id;

                      return (
                        <ComboboxItem
                          key={item.variant_id}
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

                          <span className="text-slate-800">
                            {item.color_name}
                          </span>
                        </ComboboxItem>
                      );
                    }}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </div>

            <Button
              disabled={!selectedColorOption}
              onClick={() => openUploadModal(selectedColorOption)}
              className="gap-2 w-full sm:w-auto"
            >
              <Upload className="h-4 w-4" /> Tải ảnh cho Màu này
            </Button>
          </div>
        </CardHeader>

        {/* DANH SÁCH ẢNH THEO MÀU ĐÃ CHỌN */}
        <CardContent>
          {!selectedColorOption && (
            <div className="text-center py-12 border border-dashed rounded-lg bg-muted/10">
              <Info className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Vui lòng chọn một màu sắc ở trên để xem danh sách hình ảnh tương
                ứng.
              </p>
            </div>
          )}

          {selectedColorOption && loadingColorImages && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary mb-2" />
              <p className="text-sm text-muted-foreground">
                Đang tải ảnh của màu {selectedColorOption.color_name}...
              </p>
            </div>
          )}

          {selectedColorOption && !loadingColorImages && (
            <div className="border rounded-lg p-4 bg-background shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  {selectedColorOption.hex_code && (
                    <span
                      className="w-4 h-4 rounded-full border border-slate-300 shrink-0 shadow-sm"
                      style={{
                        backgroundColor: selectedColorOption.hex_code,
                      }}
                    />
                  )}
                  <span className="font-semibold text-base">
                    Đang xem màu: {selectedColorOption.color_name}
                  </span>
                  <Badge variant="secondary">{colorImages.length} ảnh</Badge>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                  onClick={() => openUploadModal(selectedColorOption)}
                >
                  <ImagePlus className="h-4 w-4" /> Thêm ảnh
                </Button>
              </div>

              {colorImages.length === 0 ? (
                <div
                  onClick={() => openUploadModal(selectedColorOption)}
                  className="border-2 border-dashed rounded-md p-8 text-center cursor-pointer hover:bg-muted/30 transition-colors"
                >
                  <ImagePlus className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Màu <strong>{selectedColorOption.color_name}</strong> chưa
                    có ảnh. Nhấp vào đây để thêm.
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
                        alt={selectedColorOption.color_name}
                        className="w-full h-full object-cover"
                      />
                      {img.is_featured && (
                        <Badge className="absolute top-2 left-2 bg-yellow-500 text-white gap-1 text-[10px]">
                          <Star className="h-3 w-3 fill-current" /> Đại diện
                        </Badge>
                      )}
                      {actionLoadingId === img.id ? (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <Loader2 className="h-5 w-5 animate-spin text-white" />
                        </div>
                      ) : (
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition-all duration-200">
                          <button
                            type="button"
                            className="h-9 w-9 rounded-lg bg-red-500 text-white flex items-center justify-center shadow-md transition-all duration-200 hover:bg-red-600 hover:scale-110 hover:shadow-lg active:scale-95"
                            onClick={() => handleDeleteImage(img.id, true)}
                            title="Xóa ảnh"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            className="h-9 w-9 rounded-lg bg-blue-500 text-white flex items-center justify-center shadow-md transition-all duration-200 hover:bg-blue-600 hover:scale-110 hover:shadow-lg active:scale-95"
                            onClick={() => openEditModal(img)}
                            title="Xem / chỉnh sửa ảnh"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
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

      {/* DIALOG UPLOAD ẢNH */}
      <CreateProductImageDialog
        open={isUploadOpen}
        onOpenChange={setIsUploadOpen}
        productId={productId}
        variantId={uploadVariantId} // Truyền variant_id đại diện sang Dialog
        colorName={uploadColorName}
        onSuccess={() => {
          if (uploadVariantId) {
            fetchImagesByVariantId(uploadVariantId);
          } else {
            fetchGeneralImages();
          }
        }}
      />

      <UpdateProductImageDialog
        open={isUpdateOpen}
        onOpenChange={setIsUpdateOpen}
        image={editingImage}
        colorName={selectedColorOption?.color_name}
        onSuccess={async () => {
          // Luôn reload danh sách ảnh chung
          await fetchGeneralImages();

          // Nếu ảnh thuộc variant thì reload luôn danh sách ảnh theo màu
          if (editingImage?.variant_id) {
            await fetchImagesByVariantId(editingImage.variant_id);
          }

          // Có thể đóng modal sau khi cập nhật thành công
          setIsUpdateOpen(false);
        }}
      />
    </div>
  );
}
