import type { colors } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { FindManyParams } from "./../../types/public/types";

type FindManyResultColors = {
  colors: colors[];
  total: number;
};

export const colorRepository = {
  findMany: async ({
    page = 1,
    limit = 10,
  }: FindManyParams): Promise<FindManyResultColors> => {
    const skip = (page - 1) * limit;

    const [colors, total] = await prisma.$transaction([
      prisma.colors.findMany({ skip, take: limit, orderBy: { id: "asc" } }),
      prisma.colors.count(),
    ]);

    return { colors, total };
  },

  findByHexCode: async (hexCode: string): Promise<colors | null> => {
    return prisma.colors.findFirst({
      where: { hex_code: hexCode },
    });
  },

  createColor: async (name: string, hex_code: string): Promise<colors> => {
    return prisma.colors.create({ data: { name, hex_code } });
  },

  updateColorByHexCode: async (
    name: string,
    hex_code: string,
  ): Promise<colors> => {
    return prisma.colors.update({
      where: { hex_code: hex_code },
      data: { name: name },
    });
  },

  deleteColor: async (hex_code: string): Promise<colors> => {
    return prisma.colors.delete({
      where: { hex_code: hex_code },
    });
  },
};
