import type { Prisma, product_variants } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type {
  CreateProductVariantInput,
  UpdateProductVariantInput,
} from "@/lib/types/products/product_variant.type";

import { FindManyParams } from "@/lib/types/public/types";
import crypto from "crypto";

// Hàm sinh SKU gồm 8 ký tự in hoa + số (VD: A8F9K2L1)
const generateSku = (): string => {
  return crypto.randomBytes(4).toString("hex").toUpperCase();
};

export type FindManyResultProductVariant = {
  product_variants: ProductVariant[];
  total: number;
};
export type ProductVariant = Prisma.product_variantsGetPayload<{
  include: {
    products: {
      include: {
        series: {
          include: {
            brands: true;
          };
        };
      };
    };
    colors: true;
    storages: true;
    rams: true;
  };
}>;

const productVariantInclude = {
  products: {
    include: {
      series: {
        include: {
          brands: true,
        },
      },
    },
  },
  colors: true,
  storages: true,
  rams: true,
} satisfies Prisma.product_variantsInclude;

//Định nghĩa kiểu Filter

export type ProductVariantFilter = {
  sku?: string;
  color_id?: number;
  ram_id?: number;
  storage_id?: number;
};

const buildProductVariantWhere = (keyword?: string) => {
  if (!keyword) return undefined;

  return {
    products: {
      name: {
        contains: keyword,
        mode: "insensitive",
      },
    },
  } satisfies Prisma.product_variantsWhereInput;
};

const buildVariantWhere = (
  productId: number,
  filters?: ProductVariantFilter,
): Prisma.product_variantsWhereInput => {
  const where: Prisma.product_variantsWhereInput = {
    product_id: productId,
  };

  if (!filters) return where;

  if (filters.sku?.trim()) {
    where.sku = {
      contains: filters.sku.trim(),
      mode: "insensitive",
    };
  }

  if (filters.color_id) {
    where.color_id = filters.color_id;
  }

  if (filters.ram_id) {
    where.ram_id = filters.ram_id;
  }

  if (filters.storage_id) {
    where.storage_id = filters.storage_id;
  }

  return where;
};

export const productVariantRepository = {
  findMany: async ({
    page = 1,
    limit = 10,
    keyword,
  }: FindManyParams): Promise<FindManyResultProductVariant> => {
    const skip = (page - 1) * limit;
    const [product_variants, total] = await prisma.$transaction([
      prisma.product_variants.findMany({
        where: buildProductVariantWhere(keyword),
        skip,
        take: limit,
        orderBy: { id: "asc" },
        include: productVariantInclude,
      }),
      prisma.product_variants.count({
        where: buildProductVariantWhere(keyword),
      }),
    ]);
    return { product_variants, total };
  },
  findById: async (id: number): Promise<ProductVariant | null> => {
    return prisma.product_variants.findUnique({
      where: { id },
      include: productVariantInclude,
    });
  },

  findBySku: async (sku: string): Promise<ProductVariant | null> => {
    return prisma.product_variants.findUnique({
      where: { sku },
      include: productVariantInclude,
    });
  },

  findByProductId: async (
    productId: number,
    filters?: ProductVariantFilter,
  ): Promise<ProductVariant[]> => {
    const where = buildVariantWhere(productId, filters);

    return prisma.product_variants.findMany({
      where,
      include: productVariantInclude,
      orderBy: {
        id: "asc",
      },
    });
  },

  create: async (
    input: CreateProductVariantInput,
  ): Promise<product_variants> => {
    let sku = generateSku();
    let isDuplicate = true;
    while (isDuplicate) {
      const existing = await prisma.product_variants.findUnique({
        where: { sku },
        select: { id: true },
      });
      if (!existing) {
        isDuplicate = false;
      } else {
        sku = generateSku();
      }
    }

    return prisma.product_variants.create({
      data: {
        ...input,
        sku,
        status: input.status ?? true, // Mặc định là true khi tạo mới
        create_at: new Date(),
      },
    });
  },

  update: async (
    id: number,
    input: UpdateProductVariantInput,
  ): Promise<product_variants> => {
    return prisma.product_variants.update({
      where: { id },
      data: {
        ...input,
        update_at: new Date(),
      },
    });
  },
  deleteById: async (id: number): Promise<product_variants> => {
    return prisma.product_variants.delete({
      where: { id: id },
    });
  },

  findProductVariantunique: async (
    product_id: number,
    color_id: number,
    storage_id: number,
    ram_id: number,
  ): Promise<product_variants | null> => {
    return prisma.product_variants.findFirst({
      where: {
        product_id: product_id,
        color_id: color_id,
        storage_id: storage_id,
        ram_id: ram_id,
      },
    });
  },

  findProductVariantuniqueExceptId: async (
    id: number,
    product_id: number,
    color_id: number,
    storage_id: number,
    ram_id: number,
  ): Promise<product_variants | null> => {
    return prisma.product_variants.findFirst({
      where: {
        product_id: product_id,
        color_id: color_id,
        storage_id: storage_id,
        ram_id: ram_id,
        NOT: {
          id,
        },
      },
    });
  },
};
