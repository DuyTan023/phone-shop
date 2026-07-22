import type { rams, storages } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export const ramRepository = {
  findMany: async (): Promise<rams[]> =>
    prisma.rams.findMany({
      orderBy: { id: "asc" },
    }),

  findRamById: async (id: number): Promise<rams | null> =>
    prisma.rams.findUnique({
      where: { id: id },
    }),
  findRamByValue: (value: string): Promise<rams | null> =>
    prisma.rams.findFirst({
      where: { value },
    }),
  createRam: async (value: string): Promise<rams> =>
    prisma.rams.create({
      data: { value },
    }),

  updateRam: async (id: number, value: string): Promise<rams> =>
    prisma.rams.update({
      where: { id: id },
      data: { value: value },
    }),
  deleteRam: async (id: number): Promise<rams> =>
    prisma.rams.delete({
      where: { id: id },
    }),
};

export const storageRepository = {
  findMany: async (): Promise<storages[]> =>
    prisma.storages.findMany({
      orderBy: { id: "asc" },
    }),

  findStorageById: async (id: number): Promise<storages | null> =>
    prisma.storages.findUnique({
      where: { id: id },
    }),
  findStorageByValue: (value: string): Promise<storages | null> =>
    prisma.storages.findFirst({
      where: { value },
    }),

  createStorage: async (value: string): Promise<storages> =>
    prisma.storages.create({
      data: { value },
    }),

  updateStorage: async (id: number, value: string): Promise<storages> =>
    prisma.storages.update({
      where: { id: id },
      data: { value: value },
    }),
  deleteStorage: async (id: number): Promise<storages> =>
    prisma.storages.delete({
      where: { id: id },
    }),
};
