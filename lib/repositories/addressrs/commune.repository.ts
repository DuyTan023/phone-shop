// communeRepository.ts

import { prisma } from "@/lib/prisma";

export const communeRepository = {
  // Lấy danh sách đơn vị cấp 2 theo tỉnh/thành
  findByProvinceId(province_id: number) {
    return prisma.communes.findMany({
      where: {
        province_id,
      },
      orderBy: {
        name: "asc",
      },
    });
  },

  // Lấy đơn vị cấp 2 theo ID
  findById(id: number) {
    return prisma.communes.findUnique({
      where: {
        id,
      },
    });
  },

  // Lấy đơn vị cấp 2 theo code
  findByCode(code: string) {
    return prisma.communes.findUnique({
      where: {
        code,
      },
    });
  },

  // Lấy đơn vị cấp 2 theo ID và province_id
  findByIdAndProvinceId(id: number, province_id: number) {
    return prisma.communes.findUnique({
      where: {
        id_province_id: {
          id,
          province_id,
        },
      },
    });
  },
};
