import type { product_images } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { productImageRepository } from "@/lib/repositories/product/product_image.repository";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";

export interface CreateProductImageInput {
  product_id: number;
  variant_id?: number | null;
  color_id?: number | null; // Nhận color_id từ client
  image_url: string;
  is_featured?: boolean;
}

export interface CreateManyProductImagesInput {
  product_id: number;
  variant_id?: number | null;
  color_id?: number | null; // Nhận color_id từ client khi upload hàng loạt
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
   * Lấy danh sách ảnh chung của sản phẩm (variant_id = null)
   */
  getGeneralImages: async (productId: number): Promise<product_images[]> => {
    try {
      const productExists = await prisma.products.findUnique({
        where: { id: productId },
        select: { id: true },
      });

      if (!productExists) throw new Error("PRODUCT_NOT_FOUND");

      return await productImageRepository.getGeneralImages(productId);
    } catch (err) {
      if (err instanceof Error && err.message === "PRODUCT_NOT_FOUND")
        throw err;
      throw new Error("SERVER_ERROR");
    }
  },

  /**
   * Lấy danh sách ảnh phân nhóm theo MÀU SẮC của sản phẩm (Dùng cho UI Admin)
   */
  getImagesGroupedByColor: async (productId: number) => {
    try {
      const productExists = await prisma.products.findUnique({
        where: { id: productId },
        select: { id: true },
      });

      if (!productExists) throw new Error("PRODUCT_NOT_FOUND");

      return await productImageRepository.getImagesGroupedByColor(productId);
    } catch (err) {
      if (err instanceof Error && err.message === "PRODUCT_NOT_FOUND")
        throw err;
      throw new Error("SERVER_ERROR");
    }
  },

  /**
   * Lấy danh sách nhóm màu cho Dropdown Select (Dùng cho UI Admin Upload theo màu)
   */
  getColorOptionsByProductId: async (productId: number) => {
    try {
      const productExists = await prisma.products.findUnique({
        where: { id: productId },
        select: { id: true },
      });

      if (!productExists) throw new Error("PRODUCT_NOT_FOUND");

      return await productImageRepository.getColorOptionsByProductId(productId);
    } catch (err) {
      if (err instanceof Error && err.message === "PRODUCT_NOT_FOUND")
        throw err;
      throw new Error("SERVER_ERROR");
    }
  },

  /**
   * Lấy danh sách ảnh của 1 biến thể cụ thể (Dùng cho Storefront)
   */
  getImagesByVariantId: async (
    variantId: number,
  ): Promise<product_images[]> => {
    try {
      const variantExists = await prisma.product_variants.findUnique({
        where: { id: variantId },
        select: { id: true },
      });

      if (!variantExists) throw new Error("VARIANT_NOT_FOUND");

      return await productImageRepository.getImagesByVariantId(variantId);
    } catch (err) {
      if (err instanceof Error && err.message === "VARIANT_NOT_FOUND")
        throw err;
      throw new Error("SERVER_ERROR");
    }
  },

  /**
   * Thêm 1 ảnh mới (Ảnh chung, Ảnh theo Màu, hoặc Ảnh theo Biến thể)
   */
  createProductImage: async (input: CreateProductImageInput) => {
    try {
      // Validate product
      const productExists = await prisma.products.findUnique({
        where: { id: input.product_id },
        select: { id: true },
      });
      if (!productExists) throw new Error("PRODUCT_NOT_FOUND");

      let finalVariantId = input.variant_id ?? null;

      // NẾU truyền color_id mà chưa có variant_id: Tìm variant_id đại diện thuộc màu đó
      if (!finalVariantId && input.color_id) {
        const representativeVariant = await prisma.product_variants.findFirst({
          where: {
            product_id: input.product_id,
            color_id: input.color_id,
          },
          select: { id: true },
          orderBy: { is_default: "desc" }, // Ưu tiên biến thể mặc định
        });

        if (!representativeVariant) throw new Error("VARIANT_NOT_FOUND");
        finalVariantId = representativeVariant.id;
      }

      // Validate variant_id nếu có
      if (finalVariantId) {
        const variantExists = await prisma.product_variants.findUnique({
          where: { id: finalVariantId },
          select: { id: true },
        });
        if (!variantExists) throw new Error("VARIANT_NOT_FOUND");
      }

      return await productImageRepository.createImage({
        product_id: input.product_id,
        variant_id: finalVariantId,
        image_url: input.image_url,
        is_featured: input.is_featured ?? false,
      });
    } catch (err) {
      if (
        err instanceof Error &&
        (err.message === "PRODUCT_NOT_FOUND" ||
          err.message === "VARIANT_NOT_FOUND")
      ) {
        throw err;
      }
      throw new Error("SERVER_ERROR");
    }
  },

  /**
   * Thêm nhiều ảnh cùng lúc (Upload hàng loạt)
   */
  createManyProductImages: async (
    input: CreateManyProductImagesInput,
  ): Promise<{ count: number }> => {
    try {
      if (!input.image_urls || input.image_urls.length === 0) {
        throw new Error("EMPTY_IMAGE_LIST");
      }

      const productExists = await prisma.products.findUnique({
        where: { id: input.product_id },
        select: { id: true },
      });
      if (!productExists) throw new Error("PRODUCT_NOT_FOUND");

      let finalVariantId = input.variant_id ?? null;

      // NẾU truyền color_id mà chưa có variant_id: Tìm variant_id đại diện thuộc màu đó
      if (!finalVariantId && input.color_id) {
        const representativeVariant = await prisma.product_variants.findFirst({
          where: {
            product_id: input.product_id,
            color_id: input.color_id,
          },
          select: { id: true },
          orderBy: { is_default: "desc" },
        });

        if (!representativeVariant) throw new Error("VARIANT_NOT_FOUND");
        finalVariantId = representativeVariant.id;
      }

      const recordsData = input.image_urls.map((url) => ({
        product_id: input.product_id,
        variant_id: finalVariantId,
        image_url: url,
        is_featured: false,
      }));

      return await productImageRepository.createManyImages(recordsData);
    } catch (err) {
      if (
        err instanceof Error &&
        (err.message === "PRODUCT_NOT_FOUND" ||
          err.message === "VARIANT_NOT_FOUND" ||
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
   * Đặt 1 ảnh làm ảnh Đại diện chính của sản phẩm (is_featured = true)
   */
  setFeaturedImage: async (productId: number, imageId: number) => {
    try {
      const imageExists = await prisma.product_images.findFirst({
        where: { id: imageId, product_id: productId },
      });

      if (!imageExists) throw new Error("NOT_FOUND");

      return await productImageRepository.setFeaturedImage(productId, imageId);
    } catch (err) {
      if (err instanceof Error && err.message === "NOT_FOUND") throw err;
      throw new Error("SERVER_ERROR");
    }
  },

  /**
   * Cập nhật thông tin 1 tấm ảnh
   */
  updateProductImage: async (
    id: number,
    input: UpdateProductImageInput,
  ): Promise<product_images> => {
    try {
      const currentImage = await prisma.product_images.findUnique({
        where: { id },
      });
      if (!currentImage) throw new Error("NOT_FOUND");

      let finalVariantId = input.variant_id;

      // NẾU truyền color_id để đổi màu ảnh
      if (input.color_id !== undefined && !finalVariantId) {
        if (input.color_id === null) {
          finalVariantId = null;
        } else {
          const representativeVariant = await prisma.product_variants.findFirst(
            {
              where: {
                product_id: currentImage.product_id,
                color_id: input.color_id,
              },
              select: { id: true },
              orderBy: { is_default: "desc" },
            },
          );

          if (!representativeVariant) throw new Error("VARIANT_NOT_FOUND");
          finalVariantId = representativeVariant.id;
        }
      }

      return await productImageRepository.updateImage(id, {
        image_url: input.image_url,
        is_featured: input.is_featured,
        variant_id: finalVariantId,
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
        err.code === "P2003"
      ) {
        throw new Error("RELATED_ENTITY_NOT_FOUND");
      }
      throw new Error("SERVER_ERROR");
    }
  },

  /**
   * Xóa 1 tấm ảnh theo ID
   */
  deleteProductImage: async (id: number): Promise<product_images> => {
    try {
      return await productImageRepository.deleteImage(id);
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        if (err.code === "P2025") {
          throw new Error("NOT_FOUND");
        }
        if (err.code === "P2003") {
          throw new Error("IN_USE");
        }
      }
      throw new Error("SERVER_ERROR");
    }
  },

  /**
   * Xóa nhiều ảnh cùng lúc
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
