import type { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export class ProductImageRepository {
  // ==========================================
  // 1. CÁC HÀM TRUY VẤN (READ)
  // ==========================================

  /**
   * [ĐÃ SỬA] Lấy danh sách ảnh chung của Sản phẩm (variant_id = null)
   * Đã bỏ condition gán cứng is_featured: true
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
   * [BỔ SUNG MỚI] Lấy riêng 1 tấm Ảnh Đại Diện (Featured Image) của sản phẩm.
   * Ưu tiên ảnh có is_featured = true; nếu chưa có thì fallback lấy ảnh chung đầu tiên.
   */
  async getFeaturedImage(productId: number) {
    const featured = await prisma.product_images.findFirst({
      where: {
        product_id: productId,
        is_featured: true,
      },
    });

    if (featured) return featured;

    // Fallback nếu chưa có ảnh nào được đặt làm đại diện
    return await prisma.product_images.findFirst({
      where: {
        product_id: productId,
        variant_id: null,
      },
      orderBy: { id: "asc" },
    });
  }

  /**
   * Lấy danh sách ảnh phân nhóm theo MÀU SẮC DUY NHẤT của sản phẩm.
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
          orderBy: [{ is_featured: "desc" }, { id: "asc" }],
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
        const existingGroup = colorGroupMap.get(colorId)!;
        existingGroup.images.push(...variant.product_images);
      }
    }

    return Array.from(colorGroupMap.values());
  }

  /**
   * [BỔ SUNG CHO DROPDOWN UI] Lấy danh sách Nhóm Màu độc nhất của sản phẩm
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
        variant_id: number;
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
   * Lấy danh sách ảnh của 1 Biến thể cụ thể theo Cơ chế Truy vấn Liên vết.
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
      orderBy: [{ is_featured: "desc" }, { id: "asc" }],
    });
  }

  /**
   * Lấy toàn bộ ảnh của sản phẩm
   */
  async getAllImagesByProductId(productId: number) {
    return await prisma.product_images.findMany({
      where: { product_id: productId },
      orderBy: [{ is_featured: "desc" }, { id: "asc" }],
    });
  }

  // ==========================================
  // 2. CÁC HÀM THÊM MỚI (CREATE)
  // ==========================================

  /**
   * Thêm 1 ảnh mới (Nhiều logic kiểm tra nếu is_featured = true thì reset các ảnh khác)
   */
  async createImage(data: Prisma.product_imagesUncheckedCreateInput) {
    if (data.is_featured) {
      return await prisma.$transaction(async (tx) => {
        await tx.product_images.updateMany({
          where: { product_id: data.product_id },
          data: { is_featured: false },
        });

        return await tx.product_images.create({ data });
      });
    }

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
   * Đặt 1 ảnh làm ảnh đại diện chính (is_featured = true) qua Nút Star
   */
  async setFeaturedImage(productId: number, imageId: number) {
    return await prisma.$transaction([
      prisma.product_images.updateMany({
        where: { product_id: productId },
        data: { is_featured: false },
      }),
      prisma.product_images.update({
        where: { id: imageId },
        data: { is_featured: true },
      }),
    ]);
  }

  /**
   * [ĐÃ SỬA] Cập nhật thông tin/đường dẫn của 1 ảnh
   * Tự động hủy is_featured của toàn bộ các ảnh khác nếu ảnh này được tick is_featured = true
   */
  async updateImage(
    id: number,
    data: Prisma.product_imagesUncheckedUpdateInput,
  ) {
    if (data.is_featured === true) {
      const currentImg = await prisma.product_images.findUnique({
        where: { id },
        select: { product_id: true },
      });

      if (currentImg) {
        return await prisma.$transaction(async (tx) => {
          // Bỏ featured toàn bộ ảnh cùng sản phẩm
          await tx.product_images.updateMany({
            where: { product_id: currentImg.product_id },
            data: { is_featured: false },
          });

          // Cập nhật ảnh hiện tại thành featured = true
          return await tx.product_images.update({
            where: { id },
            data,
          });
        });
      }
    }

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

  async deleteImage(id: number) {
    return await prisma.product_images.delete({
      where: { id },
    });
  }

  async deleteManyImages(imageIds: number[]) {
    return await prisma.product_images.deleteMany({
      where: {
        id: { in: imageIds },
      },
    });
  }

  async deleteImagesByVariantId(variantId: number) {
    return await prisma.product_images.deleteMany({
      where: { variant_id: variantId },
    });
  }

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
