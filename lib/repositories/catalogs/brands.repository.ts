import type { brands } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type {
  CreateBrandInput,
  UpdateBrandInput,
} from "@/lib/types/catalogs/brands.type";
import { type FindManyParams } from "./../../types/public/types";

type FindManyResultBrands = {
  brands: brands[];
  total: number;
};

export const brandRepository = {
  // lấy danh sách brand với type mặc định của prisma
  findMany: async ({
    page = 1,
    limit = 10,
    keyword,
  }: FindManyParams): Promise<FindManyResultBrands> => {
    const skip = (page - 1) * limit;

    // Dùng $transaction để chạy 2 query cùng lúc, tránh race condition
    const [brands, total] = await prisma.$transaction([
      prisma.brands.findMany({
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
      }),
      prisma.brands.count({
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

    return { brands, total };
  },

  findBySlug: async (slug: string): Promise<brands | null> => {
    return prisma.brands.findFirst({
      where: { slug: slug },
    });
  },

  createBrand: async (input: CreateBrandInput): Promise<brands> => {
    return prisma.brands.create({ data: input });
  },

  updateBrandBySlug: async (
    slug: string,
    input: UpdateBrandInput,
  ): Promise<brands> => {
    return prisma.brands.update({
      where: { slug: slug },
      data: input,
    });
  },

  deleteBrandBySlug: async (slug: string): Promise<brands> => {
    return prisma.brands.delete({
      where: { slug: slug },
    });
  },
};
