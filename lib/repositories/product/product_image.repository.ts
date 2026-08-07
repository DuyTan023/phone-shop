import type { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export class ProductImageRepository {
  // ==========================================
  // 1. CÁC HÀM TRUY VẤN (READ)
  // ==========================================

  /**
   * Lấy danh sách ảnh chung của Sản phẩm (variant_id = null)
   */
  async getGeneralImages(productId: number) {
    return await prisma.product_images.findMany({
      where: {
        product_id: productId,
        variant_id: null,
      },
      orderBy: [{ is_featured: "desc" }, { id: "asc" }],
    });
  }

  /**
   * Lấy danh sách ảnh phân nhóm theo MÀU SẮC DUY NHẤT của sản phẩm.
   * Dùng cho UI Admin (Tab Ảnh): Gom tất cả ảnh của các variant có CÙNG color_id.
   */
  async getImagesGroupedByColor(productId: number) {
    const variants = await prisma.product_variants.findMany({
      where: { product_id: productId },
      select: {
        id: true,
        color_id: true,
        colors: {
          select: {
            id: true,
            name: true,
            hex_code: true,
          },
        },
        product_images: {
          orderBy: { id: "asc" },
        },
      },
      orderBy: { id: "asc" },
    });

    const colorGroupMap = new Map<
      number,
      {
        color_id: number;
        color_name: string;
        hex_code: string | null;
        representative_variant_id: number;
        images: Array<{
          id: number;
          product_id: number;
          variant_id: number | null;
          image_url: string;
          is_featured: boolean | null;
        }>;
      }
    >();

    for (const variant of variants) {
      const colorId = variant.color_id;

      if (!colorGroupMap.has(colorId)) {
        colorGroupMap.set(colorId, {
          color_id: colorId,
          color_name: variant.colors.name,
          hex_code: variant.colors.hex_code ?? null,
          representative_variant_id: variant.id,
          images: [...variant.product_images],
        });
      } else {
        // [ĐÃ SỬA]: Gom toàn bộ ảnh từ tất cả variant có cùng color_id vào mảng chung
        const existingGroup = colorGroupMap.get(colorId)!;
        existingGroup.images.push(...variant.product_images);
      }
    }

    return Array.from(colorGroupMap.values());
  }

  /**
   * [BỔ SUNG CHO DROPDOWN UI] Lấy danh sách Nhóm Màu độc nhất của sản phẩm
   * Dùng để render danh sách lựa chọn trong Select Option trên UI Admin
   */
  async getColorOptionsByProductId(productId: number) {
    const variants = await prisma.product_variants.findMany({
      where: { product_id: productId },
      select: {
        id: true,
        color_id: true,
        colors: {
          select: {
            name: true,
            hex_code: true,
          },
        },
      },
      orderBy: { id: "asc" },
    });

    const uniqueColors = new Map<
      number,
      {
        variant_id: number; // Tương đương representative_variant_id dùng để Upload
        color_id: number;
        color_name: string;
        hex_code: string | null;
      }
    >();

    for (const v of variants) {
      if (!uniqueColors.has(v.color_id)) {
        uniqueColors.set(v.color_id, {
          variant_id: v.id,
          color_id: v.color_id,
          color_name: v.colors.name,
          hex_code: v.colors.hex_code ?? null,
        });
      }
    }

    return Array.from(uniqueColors.values());
  }

  /**
   * Lấy danh sách ảnh của 1 Biến thể cụ thể theo Cơ chế Truy vấn Liên vết (Relation Query).
   */
  async getImagesByVariantId(variantId: number) {
    const currentVariant = await prisma.product_variants.findUnique({
      where: { id: variantId },
      select: {
        product_id: true,
        color_id: true,
      },
    });

    if (!currentVariant) return [];

    return await prisma.product_images.findMany({
      where: {
        product_id: currentVariant.product_id,
        product_variants: {
          color_id: currentVariant.color_id,
        },
      },
      orderBy: { id: "asc" },
    });
  }

  /**
   * Lấy toàn bộ ảnh của sản phẩm
   */
  async getAllImagesByProductId(productId: number) {
    return await prisma.product_images.findMany({
      where: { product_id: productId },
      orderBy: { id: "asc" },
    });
  }

  // ==========================================
  // 2. CÁC HÀM THÊM MỚI (CREATE)
  // ==========================================

  /**
   * Thêm 1 ảnh mới
   */
  async createImage(data: Prisma.product_imagesUncheckedCreateInput) {
    return await prisma.product_images.create({
      data,
    });
  }

  /**
   * Thêm nhiều ảnh cùng lúc (Upload hàng loạt)
   */
  async createManyImages(data: Prisma.product_imagesUncheckedCreateInput[]) {
    return await prisma.product_images.createMany({
      data,
    });
  }

  // ==========================================
  // 3. CÁC HÀM CẬP NHẬT (UPDATE)
  // ==========================================

  /**
   * [BỔ SUNG CHO UI STAR BUTTON] Đặt 1 ảnh làm ảnh đại diện chính (is_featured = true)
   * Tự động hủy trạng thái is_featured của toàn bộ các ảnh khác thuộc sản phẩm đó.
   */
  async setFeaturedImage(productId: number, imageId: number) {
    return await prisma.$transaction([
      // Step 1: Bỏ featured tất cả ảnh của sản phẩm này
      prisma.product_images.updateMany({
        where: { product_id: productId },
        data: { is_featured: false },
      }),
      // Step 2: Bật featured cho ảnh được chọn
      prisma.product_images.update({
        where: { id: imageId },
        data: { is_featured: true },
      }),
    ]);
  }

  /**
   * Cập nhật thông tin/đường dẫn của 1 ảnh
   */
  async updateImage(
    id: number,
    data: Prisma.product_imagesUncheckedUpdateInput,
  ) {
    return await prisma.product_images.update({
      where: { id },
      data,
    });
  }

  /**
   * Chuyển quyền sở hữu ảnh từ Variant này sang Variant khác.
   */
  async reassignVariantImages(fromVariantId: number, toVariantId: number) {
    return await prisma.product_images.updateMany({
      where: { variant_id: fromVariantId },
      data: { variant_id: toVariantId },
    });
  }

  // ==========================================
  // 4. CÁC HÀM XÓA (DELETE)
  // ==========================================

  /**
   * Xóa 1 tấm ảnh theo ID
   */
  async deleteImage(id: number) {
    return await prisma.product_images.delete({
      where: { id },
    });
  }

  /**
   * Xóa nhiều ảnh được chọn cùng lúc
   */
  async deleteManyImages(imageIds: number[]) {
    return await prisma.product_images.deleteMany({
      where: {
        id: { in: imageIds },
      },
    });
  }

  /**
   * Xóa tất cả ảnh thuộc về một Biến thể
   */
  async deleteImagesByVariantId(variantId: number) {
    return await prisma.product_images.deleteMany({
      where: { variant_id: variantId },
    });
  }

  /**
   * Xóa toàn bộ ảnh chung của sản phẩm (variant_id = null)
   */
  async deleteGeneralImagesByProductId(productId: number) {
    return await prisma.product_images.deleteMany({
      where: {
        product_id: productId,
        variant_id: null,
      },
    });
  }
}

export const productImageRepository = new ProductImageRepository();
