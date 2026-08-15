// provinceRepository.ts

import { prisma } from "@/lib/prisma";

export const provinceRepository = {
  // Lấy tất cả tỉnh/thành
  findMany() {
    return prisma.provinces.findMany({
      orderBy: {
        name: "asc",
      },
    });
  },

  // Lấy tỉnh/thành theo ID
  findById(id: number) {
    return prisma.provinces.findUnique({
      where: {
        id,
      },
    });
  },

  // Lấy tỉnh/thành theo code
  findByCode(code: string) {
    return prisma.provinces.findUnique({
      where: {
        code,
      },
    });
  },
};
