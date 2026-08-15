import type { Prisma, products } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type {
  CreateProductInput,
  UpdateProductInput,
} from "@/lib/types/products/product.type";

import { FindManyParams } from "@/lib/types/public/types";

const productInclude = {
  series: {
    include: {
      brands: true,
    },
  },
  product_images: {
    where: {
      is_featured: true,
    },
    take: 1,
  },
} satisfies Prisma.productsInclude;

export type ProductWithSerie = Prisma.productsGetPayload<{
  include: typeof productInclude;
}>;

export type FindManyResultProduct = {
  products: ProductWithSerie[];
  total: number;
};

export const productRepository = {
  findMany: async ({
    page = 1,
    limit = 10,
    keyword,
  }: FindManyParams): Promise<FindManyResultProduct> => {
    const skip = (page - 1) * limit;

    const where = keyword
      ? {
          name: {
            contains: keyword,
            mode: "insensitive" as const,
          },
        }
      : undefined;

    const [products, total] = await prisma.$transaction([
      prisma.products.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id: "asc" },
        include: {
          ...productInclude,
          _count: {
            select: {
              product_variants: true,
              product_specs: true,
            },
          },
        },
      }),

      prisma.products.count({
        where,
      }),
    ]);

    return { products, total };
  },

  findById: async (id: number): Promise<ProductWithSerie | null> => {
    return prisma.products.findUnique({
      where: { id },
      include: productInclude,
    });
  },

  findBySlug: async (slug: string): Promise<ProductWithSerie | null> => {
    return prisma.products.findUnique({
      where: { slug },
      include: productInclude,
    });
  },

  createProduct: async (
    createProductInput: CreateProductInput,
  ): Promise<products> => {
    return prisma.products.create({
      data: createProductInput,
    });
  },

  updateProductById: async (
    id: number,
    updateProductInput: UpdateProductInput,
  ): Promise<products> => {
    return prisma.products.update({
      where: { id },
      data: updateProductInput,
    });
  },

  deleteProductById: async (id: number): Promise<products> => {
    return prisma.products.delete({
      where: { id },
    });
  },

  // Kiểm tra product trùng name trong cùng series
  findByNameSerieId: async (
    name: string,
    serie_id: number,
  ): Promise<ProductWithSerie | null> => {
    return prisma.products.findFirst({
      where: {
        name,
        serie_id,
      },
      include: productInclude,
    });
  },

  // Kiểm tra product trùng name trong cùng series, bỏ qua ID hiện tại
  findByNameSerieIdExceptId: async (
    id: number,
    name: string,
    serie_id: number,
  ): Promise<ProductWithSerie | null> => {
    return prisma.products.findFirst({
      where: {
        name,
        serie_id,
        NOT: {
          id,
        },
      },
      include: productInclude,
    });
  },

  // Kiểm tra slug, bỏ qua ID hiện tại
  findBySlugExceptId: async (
    id: number,
    slug: string,
  ): Promise<ProductWithSerie | null> => {
    return prisma.products.findFirst({
      where: {
        slug,
        NOT: {
          id,
        },
      },
      include: productInclude,
    });
  },
};
