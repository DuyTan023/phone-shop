import type { spec_groups } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export const spectGroupRepository = {
  findMany: async (): Promise<spec_groups[]> =>
    prisma.spec_groups.findMany({
      orderBy: { id: "asc" },
    }),

  findSpecGroupById: async (id: number): Promise<spec_groups | null> =>
    prisma.spec_groups.findFirst({
      where: { id: id },
    }),

  findSpecGroupByName: async (name: string): Promise<spec_groups | null> =>
    prisma.spec_groups.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive", // Tự động bỏ qua hoa/thường cả tiếng Việt
        },
      },
    }),
  createSpecGroup: async (name: string): Promise<spec_groups> =>
    prisma.spec_groups.create({
      data: { name },
    }),
  updateSpecGroup: async (id: number, name: string): Promise<spec_groups> =>
    prisma.spec_groups.update({
      where: { id: id },
      data: { name },
    }),
  deleteSpecGroup: async (id: number): Promise<spec_groups> =>
    prisma.spec_groups.delete({
      where: { id: id },
    }),
};
