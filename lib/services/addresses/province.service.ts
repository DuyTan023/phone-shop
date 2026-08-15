import type { provinces } from "@/app/generated/prisma/client";
import { provinceRepository } from "@/lib/repositories/addressrs/province.repository";

export const provinceService = {
  getProvinces: async (): Promise<provinces[]> => {
    try {
      return await provinceRepository.findMany();
    } catch (error) {
      console.log("Lỗi tại getProvinces service: ", error);
      throw new Error("SERVER_ERROR");
    }
  },

  getProvinceById: async (id: number): Promise<provinces> => {
    try {
      const province = await provinceRepository.findById(id);

      if (!province) throw new Error("NOT_FOUND");

      return province;
    } catch (error) {
      if (error instanceof Error && error.message === "NOT_FOUND") {
        throw error;
      }

      throw new Error("SERVER_ERROR");
    }
  },

  getProvinceByCode: async (code: string): Promise<provinces> => {
    try {
      const province = await provinceRepository.findByCode(code);

      if (!province) throw new Error("NOT_FOUND");

      return province;
    } catch (error) {
      if (error instanceof Error && error.message === "NOT_FOUND") {
        throw error;
      }

      throw new Error("SERVER_ERROR");
    }
  },
};
