import type { Prisma, products } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type {
  CreateProductInput,
  UpdateProductInput,
} from "@/lib/types/products/product.type";

import { FindManyParams } from "@/lib/types/public/types";

export type FindManyResultProduct = {
  products: ProductWithSerie[];
  total: number;
};
export type ProductWithSerie = Prisma.productsGetPayload<{
  include: {
    series: {
      include: {
        brands: true; // Lấy luôn thông tin hãng thông qua series
      };
    };
  };
}>;

export const productRepository = {
  findMany: async ({
    page = 1,
    limit = 10,
    keyword,
  }: FindManyParams): Promise<FindManyResultProduct> => {
    const skip = (page - 1) * limit;
    const [products, total] = await prisma.$transaction([
      prisma.products.findMany({
        where: keyword
          ? {
              name: {
                contains: keyword,
                mode: "insensitive",
              },
            }
          : undefined,
        skip,
        take: limit,
        orderBy: { id: "asc" },
        include: {
          series: {
            include: {
              brands: true, // Lấy luôn thông tin hãng thông qua series
            },
          },
          _count: {
            select: {
              product_variants: true, // Số lượng biến thể
              product_specs: true, // Số lượng thông số
            },
          },
        },
      }),
      prisma.products.count({
        where: keyword
          ? {
              name: {
                contains: keyword,
                mode: "insensitive",
              },
            }
          : undefined,
      }),
    ]);
    return { products, total };
  },

  findById: async (id: number): Promise<ProductWithSerie | null> => {
    return prisma.products.findUnique({
      where: { id },
      include: {
        series: {
          include: {
            brands: true, // Lấy luôn thông tin hãng thông qua series
          },
        },
        _count: {
          select: {
            product_variants: true, // Số lượng biến thể
            product_specs: true, // Số lượng thông số
          },
        },
      },
    });
  },

  findBySlug: async (slug: string): Promise<ProductWithSerie | null> => {
    return prisma.products.findUnique({
      where: { slug },
      include: {
        series: {
          include: {
            brands: true, // Lấy luôn thông tin hãng thông qua series
          },
        },
      },
    });
  },

  createProduct: async (
    createProductInput: CreateProductInput,
  ): Promise<products> => {
    return prisma.products.create({ data: createProductInput });
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
      where: { id: id },
    });
  },

  // kiểm tra trong quá trình thêm mới 1 serie ko được có product name trùng nhau
  findByNameSerieId: async (
    name: string,
    serie_id: number,
  ): Promise<ProductWithSerie | null> => {
    return prisma.products.findFirst({
      where: {
        name: name,
        serie_id: serie_id,
      },
      include: {
        series: {
          include: {
            brands: true, // Lấy luôn thông tin hãng thông qua series
          },
        },
      },
    });
  },

  // Kiểm tra tên và serie_id bỏ qua id hiện tại
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
      include: {
        series: {
          include: {
            brands: true, // Lấy luôn thông tin hãng thông qua series
          },
        },
      },
    });
  },

  // Kiểm slug tên bỏ qua ID hiện tại
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
      include: {
        series: {
          include: {
            brands: true, // Lấy luôn thông tin hãng thông qua series
          },
        },
      },
    });
  },
};
