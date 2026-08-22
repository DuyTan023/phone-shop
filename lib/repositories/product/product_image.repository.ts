import type { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export class ProductImageRepository {
  async getGeneralImages(productId: number) {
    return await prisma.product_images.findMany({
      where: {
        product_id: productId,
        variant_id: null,
      },
      orderBy: [{ is_featured: "desc" }, { id: "asc" }],
    });
  }

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

  async getAllImagesByProductId(productId: number) {
    return await prisma.product_images.findMany({
      where: { product_id: productId },
      orderBy: [{ is_featured: "desc" }, { id: "asc" }],
    });
  }

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

  async createManyImages(data: Prisma.product_imagesUncheckedCreateInput[]) {
    return await prisma.product_images.createMany({
      data,
    });
  }

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

  async reassignVariantImages(fromVariantId: number, toVariantId: number) {
    return await prisma.product_images.updateMany({
      where: { variant_id: fromVariantId },
      data: { variant_id: toVariantId },
    });
  }

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
