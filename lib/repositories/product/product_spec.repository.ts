import type { Prisma, product_specs } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type {
  CreateProductSpecInput,
  UpdateProductSpecInput,
} from "@/lib/types/products/product_spec.type";
import type { FindManyParams } from "@/lib/types/public/types";

export type FindManyResultProductSpec = {
  product_specs: Product_Spec[];
  total: number;
};
export type Product_Spec = Prisma.product_specsGetPayload<{
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
    spec_keys: {
      include: {
        spec_groups: true;
      };
    };
    units: true;
  };
}>;

const productSpecInclude = {
  products: {
    include: {
      series: {
        include: {
          brands: true,
        },
      },
    },
  },
  spec_keys: {
    include: {
      spec_groups: true,
    },
  },
  units: true,
} satisfies Prisma.product_specsInclude;

const buildProductSpecWhere = (keyword?: string) => {
  if (!keyword) return undefined;

  return {
    products: {
      name: {
        contains: keyword,
        mode: "insensitive",
      },
    },
  } satisfies Prisma.product_specsWhereInput;
};

export const productSpecRepository = {
  findMany: async ({
    page = 1,
    limit = 10,
    keyword,
  }: FindManyParams): Promise<FindManyResultProductSpec> => {
    const skip = (page - 1) * limit;
    const [product_specs, total] = await prisma.$transaction([
      prisma.product_specs.findMany({
        where: buildProductSpecWhere(keyword),
        skip,
        take: limit,
        orderBy: { id: "asc" },
        include: productSpecInclude,
      }),
      prisma.product_specs.count({
        where: buildProductSpecWhere(keyword),
      }),
    ]);
    return { product_specs, total };
  },

  findById: async (id: number): Promise<Product_Spec | null> => {
    return prisma.product_specs.findUnique({
      where: { id },
      include: productSpecInclude,
    });
  },

  // Lấy theo bộ lọc product và spec_key
  findByProductSpec: async (
    product_id: number,
    spec_key_id: number,
  ): Promise<Product_Spec | null> => {
    return prisma.product_specs.findFirst({
      where: {
        product_id: product_id,
        spec_key_id: spec_key_id,
      },
      include: productSpecInclude,
    });
  },
  createProductSpec: async (
    input: CreateProductSpecInput,
  ): Promise<product_specs> => {
    return prisma.product_specs.create({ data: input });
  },
  updateProductSpec: async (
    id: number,
    input: UpdateProductSpecInput,
  ): Promise<product_specs> => {
    return prisma.product_specs.update({
      where: { id },
      data: input,
    });
  },
  deleteById: async (id: number): Promise<product_specs> => {
    return prisma.product_specs.delete({
      where: { id: id },
    });
  },
};
