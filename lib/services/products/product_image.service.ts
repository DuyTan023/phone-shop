import type { product_images } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { productImageRepository } from "@/lib/repositories/product/product_image.repository";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";

export interface CreateProductImageInput {
  product_id: number;
  variant_id?: number | null;
  color_id?: number | null; // Dùng khi Client upload chọn theo Màu
  image_url: string;
  is_featured?: boolean;
}

export interface CreateManyProductImagesInput {
  product_id: number;
  variant_id?: number | null;
  color_id?: number | null;
  image_urls: string[];
}

export interface UpdateProductImageInput {
  image_url?: string;
  is_featured?: boolean;
  variant_id?: number | null;
  color_id?: number | null;
}

export const productImageService = {
  /**
   * Helper riêng của Service: Tìm variant_id đại diện dựa vào color_id & product_id
   */
  async resolveVariantIdFromColor(
    productId: number,
    colorId: number,
  ): Promise<number> {
    const representativeVariant = await prisma.product_variants.findFirst({
      where: {
        product_id: productId,
        color_id: colorId,
      },
      select: { id: true },
      orderBy: [{ is_default: "desc" }, { id: "asc" }],
    });

    if (!representativeVariant) {
      throw new Error("VARIANT_NOT_FOUND");
    }

    return representativeVariant.id;
  },

  /**
   * 1. Lấy danh sách ảnh chung của sản phẩm (variant_id = null)
   */
  getGeneralImages: async (productId: number): Promise<product_images[]> => {
    try {
      return await productImageRepository.getGeneralImages(productId);
    } catch (err) {
      throw new Error("SERVER_ERROR");
    }
  },

  /**
   * 1b. [BỔ SUNG MỚI] Lấy riêng 1 tấm ảnh đại diện (Featured Image) của sản phẩm
   */
  getFeaturedImage: async (
    productId: number,
  ): Promise<product_images | null> => {
    try {
      return await productImageRepository.getFeaturedImage(productId);
    } catch (err) {
      throw new Error("SERVER_ERROR");
    }
  },

  /**
   * 2. Lấy danh sách ảnh phân nhóm theo MÀU SẮC (UI Admin)
   */
  getImagesGroupedByColor: async (productId: number) => {
    try {
      return await productImageRepository.getImagesGroupedByColor(productId);
    } catch (err) {
      throw new Error("SERVER_ERROR");
    }
  },

  /**
   * 3. Lấy danh sách nhóm màu cho Dropdown Select (UI Admin)
   */
  getColorOptionsByProductId: async (productId: number) => {
    try {
      return await productImageRepository.getColorOptionsByProductId(productId);
    } catch (err) {
      throw new Error("SERVER_ERROR");
    }
  },

  /**
   * 4. Lấy danh sách ảnh của 1 biến thể/màu cụ thể (Storefront Client)
   */
  getImagesByVariantId: async (
    variantId: number,
  ): Promise<product_images[]> => {
    try {
      const result =
        await productImageRepository.getImagesByVariantId(variantId);
      return result;
    } catch (err) {
      throw new Error("SERVER_ERROR");
    }
  },

  /**
   * 5. Thêm 1 ảnh mới (Xử lý chuẩn hóa variant_id từ color_id)
   */
  createProductImage: async (input: CreateProductImageInput) => {
    try {
      let targetVariantId: number | null = null;

      // Ưu tiên 1: Nếu client truyền color_id -> Tìm đại diện màu
      if (input.color_id) {
        targetVariantId = await productImageService.resolveVariantIdFromColor(
          input.product_id,
          input.color_id,
        );
      }
      // Ưu tiên 2: Nếu client chỉ truyền trực tiếp variant_id
      else if (input.variant_id) {
        targetVariantId = input.variant_id;
      }

      return await productImageRepository.createImage({
        product_id: input.product_id,
        variant_id: targetVariantId,
        image_url: input.image_url,
        is_featured: input.is_featured ?? false,
      });
    } catch (err) {
      if (err instanceof Error && err.message === "VARIANT_NOT_FOUND") {
        throw err;
      }
      if (
        err instanceof PrismaClientKnownRequestError &&
        err.code === "P2003"
      ) {
        throw new Error("RELATED_ENTITY_NOT_FOUND");
      }
      throw new Error("SERVER_ERROR");
    }
  },

  /**
   * 6. Thêm nhiều ảnh cùng lúc (Upload hàng loạt)
   */
  createManyProductImages: async (
    input: CreateManyProductImagesInput,
  ): Promise<{ count: number }> => {
    try {
      if (!input.image_urls || input.image_urls.length === 0) {
        throw new Error("EMPTY_IMAGE_LIST");
      }

      let targetVariantId: number | null = null;

      if (input.color_id) {
        targetVariantId = await productImageService.resolveVariantIdFromColor(
          input.product_id,
          input.color_id,
        );
      } else if (input.variant_id) {
        targetVariantId = input.variant_id;
      }

      const recordsData = input.image_urls.map((url) => ({
        product_id: input.product_id,
        variant_id: targetVariantId,
        image_url: url,
        is_featured: false,
      }));

      return await productImageRepository.createManyImages(recordsData);
    } catch (err) {
      if (
        err instanceof Error &&
        (err.message === "VARIANT_NOT_FOUND" ||
          err.message === "EMPTY_IMAGE_LIST")
      ) {
        throw err;
      }
      if (
        err instanceof PrismaClientKnownRequestError &&
        err.code === "P2003"
      ) {
        throw new Error("RELATED_ENTITY_NOT_FOUND");
      }
      throw new Error("SERVER_ERROR");
    }
  },

  /**
   * 7. Đặt ảnh đại diện chính (is_featured = true)
   */
  setFeaturedImage: async (productId: number, imageId: number) => {
    try {
      return await productImageRepository.setFeaturedImage(productId, imageId);
    } catch (err) {
      if (
        err instanceof PrismaClientKnownRequestError &&
        err.code === "P2025"
      ) {
        throw new Error("NOT_FOUND");
      }
      throw new Error("SERVER_ERROR");
    }
  },

  /**
   * 8. Cập nhật thông tin/đổi màu cho tấm ảnh
   */
  updateProductImage: async (
    id: number,
    input: UpdateProductImageInput,
  ): Promise<product_images> => {
    try {
      let targetVariantId = input.variant_id;

      // Nếu người dùng muốn chuyển tấm ảnh này sang nhóm màu khác
      if (input.color_id !== undefined) {
        if (input.color_id === null) {
          targetVariantId = null; // Đổi thành ảnh chung của Sản phẩm
        } else {
          // Lấy product_id hiện tại của ảnh để quy đổi color_id -> variant_id
          const currentImage = await prisma.product_images.findUnique({
            where: { id },
            select: { product_id: true },
          });

          if (!currentImage) throw new Error("NOT_FOUND");

          targetVariantId = await productImageService.resolveVariantIdFromColor(
            currentImage.product_id,
            input.color_id,
          );
        }
      }

      return await productImageRepository.updateImage(id, {
        image_url: input.image_url,
        is_featured: input.is_featured,
        variant_id: targetVariantId,
      });
    } catch (err) {
      if (
        err instanceof Error &&
        (err.message === "NOT_FOUND" || err.message === "VARIANT_NOT_FOUND")
      ) {
        throw err;
      }
      if (
        err instanceof PrismaClientKnownRequestError &&
        err.code === "P2025"
      ) {
        throw new Error("NOT_FOUND");
      }
      throw new Error("SERVER_ERROR");
    }
  },

  /**
   * 9. Xóa 1 ảnh theo ID
   */
  deleteProductImage: async (id: number): Promise<product_images> => {
    try {
      return await productImageRepository.deleteImage(id);
    } catch (err) {
      if (
        err instanceof PrismaClientKnownRequestError &&
        err.code === "P2025"
      ) {
        throw new Error("NOT_FOUND");
      }
      throw new Error("SERVER_ERROR");
    }
  },

  /**
   * 10. Xóa nhiều ảnh
   */
  deleteManyProductImages: async (
    imageIds: number[],
  ): Promise<{ count: number }> => {
    try {
      if (!imageIds || imageIds.length === 0) {
        throw new Error("EMPTY_IMAGE_IDS");
      }
      return await productImageRepository.deleteManyImages(imageIds);
    } catch (err) {
      if (err instanceof Error && err.message === "EMPTY_IMAGE_IDS") throw err;
      throw new Error("SERVER_ERROR");
    }
  },
};
