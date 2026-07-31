import type { units } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { FindManyParams } from "@/lib/types/public/types";

type FindManyResultUnits = {
  units: units[];
  total: number;
};

export const unitRepository = {
  // lấy danh sách units với type mặc định của prisma
  findMany: async ({
    page = 1,
    limit = 10,
    keyword,
  }: FindManyParams): Promise<FindManyResultUnits> => {
    const skip = (page - 1) * limit;
    const where = keyword
      ? {
          OR: [
            {
              name: {
                contains: keyword,
                mode: "insensitive" as const,
              },
            },
            {
              symbol: {
                contains: keyword,
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : undefined;
    // Dùng $transaction để chạy 2 query cùng lúc, tránh race condition
    const [units, total] = await prisma.$transaction([
      prisma.units.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id: "asc" },
      }),
      prisma.units.count({
        where,
      }),
    ]);
    return { units, total };
  },
  findById: async (id: number): Promise<units | null> => {
    return prisma.units.findUnique({
      where: { id },
    });
  },

  findByName: async (name: string): Promise<units | null> => {
    return prisma.units.findUnique({
      where: { name },
    });
  },

  findBySymbol: async (symbol: string): Promise<units | null> => {
    return prisma.units.findUnique({
      where: { symbol },
    });
  },

  createUnit: async (name: string, symbol: string): Promise<units> => {
    return prisma.units.create({ data: { name, symbol } });
  },

  updateUnit: async (
    id: number,
    name: string,
    symbol: string,
  ): Promise<units> => {
    return prisma.units.update({
      where: { id },
      data: { name, symbol },
    });
  },

  deleteById: async (id: number): Promise<units> => {
    return prisma.units.delete({
      where: { id: id },
    });
  },

  findByNameExceptId: async (
    id: number,
    name: string,
  ): Promise<units | null> => {
    return prisma.units.findFirst({
      where: {
        name,
        NOT: {
          id,
        },
      },
    });
  },

  findBySymbolExceptId: async (
    id: number,
    symbol: string,
  ): Promise<units | null> => {
    return prisma.units.findFirst({
      where: {
        symbol,
        NOT: {
          id,
        },
      },
    });
  },
};
