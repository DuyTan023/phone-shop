import { prisma } from "@/lib/prisma";

import type { Prisma, spec_keys } from "@/app/generated/prisma/client";
import { FindManyParams } from "./../../types/public/types";

export type FindManyResultSpecKey = {
  spec_keys: SpecKeyWithGroup[];
  total: number;
};

export type SpecKeyWithGroup = Prisma.spec_keysGetPayload<{
  include: {
    spec_groups: true;
  };
}>;

export const specKeyRepository = {
  findMany: async ({
    page = 1,
    limit = 10,
  }: FindManyParams): Promise<FindManyResultSpecKey> => {
    const skip = (page - 1) * limit;

    const [spec_keys, total] = await prisma.$transaction([
      prisma.spec_keys.findMany({
        skip,
        take: limit,
        orderBy: { id: "asc" },
        include: { spec_groups: true },
      }),
      prisma.spec_keys.count(),
    ]);
    return { spec_keys, total };
  },

  findById: async (id: number): Promise<SpecKeyWithGroup | null> => {
    return prisma.spec_keys.findUnique({
      where: { id },
      include: { spec_groups: true },
    });
  },

  findByNameGroupId: async (
    name: string,
    group_id: number,
  ): Promise<SpecKeyWithGroup | null> => {
    return prisma.spec_keys.findFirst({
      where: {
        name: name,
        group_id: group_id,
      },
      include: { spec_groups: true },
    });
  },
  createSpecKey: async (group_id: number, name: string): Promise<spec_keys> => {
    return prisma.spec_keys.create({ data: { group_id, name } });
  },

  updateSpecKeyById: async (
    id: number,
    name: string,
    group_id: number,
  ): Promise<spec_keys> => {
    return prisma.spec_keys.update({
      where: { id },
      data: { group_id, name },
    });
  },

  deleteSpecKeyById: async (id: number): Promise<spec_keys> => {
    return prisma.spec_keys.delete({
      where: { id: id },
    });
  },
};
