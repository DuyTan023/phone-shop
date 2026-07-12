import { Prisma, type colors } from "@/app/generated/prisma/client";
import { colorRepository } from "@/lib/repositories/catalogs/colors.repository";
import { PaginationResult } from "./../../types/public/types";
type GetColorParams = {
  page?: number;
  limit?: number;
};

export const colorService = {
  getColor: async ({
    page = 1,
    limit = 10,
  }: GetColorParams): Promise<PaginationResult<colors>> => {
    try {
      const { colors, total } = await colorRepository.findMany({ page, limit });
      return {
        data: colors,
        total: total,
        page: page,
        limit: limit,
        totalPage: Math.ceil(total / limit),
      };
    } catch (err) {
      throw new Error("Không thể lấy danh sách màu" + err);
    }
  },

  getColorByHexCode: async (hex_code: string): Promise<colors> => {
    try {
      const color = await colorRepository.findByHexCode(hex_code);
      if (!color) throw new Error("NOT_FOUND");
      return color;
    } catch (err) {
      if (err instanceof Error && err.message === "NOT_FOUND") throw err;
      throw new Error("SERVER_ERROR");
    }
  },

  createColor: async (name: string, hex_code: string): Promise<colors> => {
    try {
      if (hex_code) {
        const existing = await colorRepository.findByHexCode(hex_code);
        if (existing) throw new Error("HEX_CODE_EXISTS");
      }
      return await colorRepository.createColor(name, hex_code);
    } catch (err) {
      if (err instanceof Error && err.message === "HEX_CODE_EXISTS") {
        throw err;
      }
      throw new Error("SERVER_ERROR");
    }
  },

  updateColor: async (name: string, hex_code: string): Promise<colors> => {
    try {
      return await colorRepository.updateColorByHexCode(name, hex_code);
    } catch (err) {
      // Bắt mã lỗi của Prisma khi không tìm thấy bản ghi (P2025)
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2025"
      ) {
        throw new Error("NOT_FOUND");
      }

      throw new Error("SERVER_ERROR");
    }
  },

  deleteColor: async (hex_code: string): Promise<colors> => {
    try {
      return await colorRepository.deleteColor(hex_code);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        // Trường hợp 1: Slug không tồn tại trong DB
        if (err.code === "P2025") {
          throw new Error("NOT_FOUND");
        }

        // Trường hợp 2: Brand này đang có sản phẩm thuộc về nó, không được xóa bừa bãi
        if (err.code === "P2003") {
          throw new Error("COLOR_HAS_PRODUCTS");
        }
      }
      throw new Error("SERVER_ERROR");
    }
  },
};
