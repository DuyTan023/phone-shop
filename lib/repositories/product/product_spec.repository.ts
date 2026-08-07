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

  // Lấy danh sách giá trị thông số của sp
  findByProductId: async (product_id: number): Promise<Product_Spec | null> => {
    return prisma.product_specs.findFirst({
      where: {
        product_id: product_id,
      },
      include: productSpecInclude,
    });
  },
  // Kiểm tra tính duy nhất 1 sp chỉ có 1 thông số đó
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

  getProductSpecsGroupedByGroup: async (productId: number) => {
    // 1. Truy vấn tất cả thông số của product kèm theo quan hệ Key, Group và Unit
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
            // Thêm các field tên đơn vị nếu có (ví dụ: name, symbol)
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

    // 2. Gom nhóm kết quả theo spec_groups bằng JavaScript
    const groupedSpecs = specs.reduce(
      (acc, curr) => {
        const group = curr.spec_keys.spec_groups;
        const groupId = group.id;

        // Nếu nhóm chưa tồn tại trong accumulator thì khởi tạo
        if (!acc[groupId]) {
          acc[groupId] = {
            groupId: group.id,
            groupName: group.name,
            specs: [],
          };
        }

        // Đưa thông số vào nhóm tương ứng
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
        { groupId: number; groupName: string; specs: any[] }
      >,
    );

    // Chuyển object gom nhóm thành dạng mảng danh sách
    return Object.values(groupedSpecs);
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
