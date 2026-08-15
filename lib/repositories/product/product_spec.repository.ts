/* eslint-disable @typescript-eslint/no-explicit-any */
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

const buildProductSpecWhere = ({
  keyword,
  product_id,
}: {
  keyword?: string;
  product_id?: number;
}): Prisma.product_specsWhereInput => {
  const where: Prisma.product_specsWhereInput = {};

  // Lọc theo sản phẩm
  if (product_id !== undefined) {
    where.product_id = product_id;
  }

  // Tìm theo tên sản phẩm
  if (keyword) {
    where.products = {
      name: {
        contains: keyword,
        mode: "insensitive",
      },
    };
  }

  return where;
};

export const productSpecRepository = {
  // Lấy danh sách thông số sản phẩm
  findMany: async ({
    page = 1,
    limit = 10,
    keyword,
    product_id,
  }: FindManyParams & {
    product_id?: number;
  }): Promise<FindManyResultProductSpec> => {
    const skip = (page - 1) * limit;

    const where = buildProductSpecWhere({
      keyword,
      product_id,
    });

    const [product_specs, total] = await prisma.$transaction([
      prisma.product_specs.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          id: "asc",
        },
        include: productSpecInclude,
      }),

      prisma.product_specs.count({
        where,
      }),
    ]);

    return {
      product_specs,
      total,
    };
  },

  // Lấy 1 thông số theo ID
  findById: async (id: number): Promise<Product_Spec | null> => {
    return prisma.product_specs.findUnique({
      where: {
        id,
      },
      include: productSpecInclude,
    });
  },

  // Lấy TẤT CẢ thông số của một sản phẩm
  findByProductId: async (product_id: number): Promise<Product_Spec[]> => {
    return prisma.product_specs.findMany({
      where: {
        product_id,
      },
      include: productSpecInclude,
      orderBy: {
        id: "asc",
      },
    });
  },

  // Kiểm tra một sản phẩm đã có thông số này chưa
  findByProductSpec: async (
    product_id: number,
    spec_key_id: number,
  ): Promise<Product_Spec | null> => {
    return prisma.product_specs.findFirst({
      where: {
        product_id,
        spec_key_id,
      },
      include: productSpecInclude,
    });
  },

  // Lấy thông số của sản phẩm và gom theo nhóm
  getProductSpecsGroupedByGroup: async (productId: number) => {
    const specs = await prisma.product_specs.findMany({
      where: {
        product_id: productId,
      },
      select: {
        id: true,
        spec_value: true,
        units: {
          select: {
            id: true,
            name: true,
            symbol: true,
          },
        },
        spec_keys: {
          select: {
            id: true,
            name: true,
            spec_groups: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    const groupedSpecs = specs.reduce(
      (acc, curr) => {
        const group = curr.spec_keys.spec_groups;
        const groupId = group.id;

        if (!acc[groupId]) {
          acc[groupId] = {
            groupId: group.id,
            groupName: group.name,
            specs: [],
          };
        }

        acc[groupId].specs.push({
          specId: curr.id,
          keyId: curr.spec_keys.id,
          keyName: curr.spec_keys.name,
          value: curr.spec_value,
          unit: curr.units,
        });

        return acc;
      },
      {} as Record<
        number,
        {
          groupId: number;
          groupName: string;
          specs: any[];
        }
      >,
    );

    return Object.values(groupedSpecs);
  },

  // Tạo thông số
  createProductSpec: async (
    input: CreateProductSpecInput,
  ): Promise<product_specs> => {
    return prisma.product_specs.create({
      data: input,
    });
  },

  // Cập nhật thông số
  updateProductSpec: async (
    id: number,
    input: UpdateProductSpecInput,
  ): Promise<product_specs> => {
    return prisma.product_specs.update({
      where: {
        id,
      },
      data: input,
    });
  },

  // Xóa thông số
  deleteById: async (id: number): Promise<product_specs> => {
    return prisma.product_specs.delete({
      where: {
        id,
      },
    });
  },
};
