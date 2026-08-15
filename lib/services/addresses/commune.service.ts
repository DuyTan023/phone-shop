import type { communes } from "@/app/generated/prisma/client";
import { communeRepository } from "@/lib/repositories/addressrs/commune.repository";

export const communeService = {
  getCommunesByProvinceId: async (province_id: number): Promise<communes[]> => {
    try {
      return await communeRepository.findByProvinceId(province_id);
    } catch (error) {
      console.log("Lỗi tại getCommunesByProvinceId service: ", error);
      throw new Error("SERVER_ERROR");
    }
  },

  getCommuneById: async (id: number): Promise<communes> => {
    try {
      const commune = await communeRepository.findById(id);

      if (!commune) throw new Error("NOT_FOUND");

      return commune;
    } catch (error) {
      if (error instanceof Error && error.message === "NOT_FOUND") {
        throw error;
      }

      throw new Error("SERVER_ERROR");
    }
  },

  getCommuneByCode: async (code: string): Promise<communes> => {
    try {
      const commune = await communeRepository.findByCode(code);

      if (!commune) throw new Error("NOT_FOUND");

      return commune;
    } catch (error) {
      if (error instanceof Error && error.message === "NOT_FOUND") {
        throw error;
      }

      throw new Error("SERVER_ERROR");
    }
  },

  getCommuneByIdAndProvinceId: async (
    id: number,
    province_id: number,
  ): Promise<communes> => {
    try {
      const commune = await communeRepository.findByIdAndProvinceId(
        id,
        province_id,
      );

      if (!commune) throw new Error("NOT_FOUND");

      return commune;
    } catch (error) {
      if (error instanceof Error && error.message === "NOT_FOUND") {
        throw error;
      }

      throw new Error("SERVER_ERROR");
    }
  },
};
