import type { units } from "@/app/generated/prisma/client";
import { unitRepository } from "@/lib/repositories/catalogs/units.repository";
import type { PaginationResult } from "@/lib/types/public/types";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";

type GetUnitParams = {
  page?: number;
  limit?: number;
  keyword?: string;
};

export const unitService = {
  getUnit: async ({
    page = 1,
    limit = 10,
    keyword,
  }: GetUnitParams): Promise<PaginationResult<units>> => {
    try {
      const { units, total } = await unitRepository.findMany({
        page,
        limit,
        keyword,
      });
      return {
        data: units,
        total: total,
        page: page,
        limit: limit,
        totalPage: Math.ceil(total / limit),
      };
    } catch (err) {
      throw new Error("Không thể lấy danh sách đơn vị" + err);
    }
  },
  getUnitById: async (id: number): Promise<units> => {
    try {
      const unit = await unitRepository.findById(id);
      if (!unit) throw new Error("NOT_FOUND");
      return unit;
    } catch (err) {
      // Nếu lỗi là do chính mình chủ động quăng ra (NOT_FOUND), cứ thế đẩy thẳng lên tầng Route
      if (err instanceof Error && err.message === "NOT_FOUND") {
        throw err;
      }

      // Nếu là lỗi không mong muốn khác (ví dụ sập DB, lỗi kết nối Postgres), log lại rồi quăng lỗi chung
      throw new Error("SERVER_ERROR");
    }
  },
  getUnitByName: async (name: string): Promise<units> => {
    try {
      const unit = await unitRepository.findByName(name);
      if (!unit) throw new Error("NOT_FOUND");
      return unit;
    } catch (err) {
      // Nếu lỗi là do chính mình chủ động quăng ra (NOT_FOUND), cứ thế đẩy thẳng lên tầng Route
      if (err instanceof Error && err.message === "NOT_FOUND") {
        throw err;
      }

      // Nếu là lỗi không mong muốn khác (ví dụ sập DB, lỗi kết nối Postgres), log lại rồi quăng lỗi chung
      throw new Error("SERVER_ERROR");
    }
  },
  getUnitBySymbol: async (symbol: string): Promise<units> => {
    try {
      const unit = await unitRepository.findBySymbol(symbol);
      if (!unit) throw new Error("NOT_FOUND");
      return unit;
    } catch (err) {
      // Nếu lỗi là do chính mình chủ động quăng ra (NOT_FOUND), cứ thế đẩy thẳng lên tầng Route
      if (err instanceof Error && err.message === "NOT_FOUND") {
        throw err;
      }

      // Nếu là lỗi không mong muốn khác (ví dụ sập DB, lỗi kết nối Postgres), log lại rồi quăng lỗi chung
      throw new Error("SERVER_ERROR");
    }
  },
  createUnit: async (name: string, symbol: string): Promise<units> => {
    try {
      if (name || symbol) {
        const [existing_name, existing_symbol] = await Promise.all([
          unitRepository.findByName(name),
          unitRepository.findBySymbol(symbol),
        ]);

        if (existing_name) throw new Error("NAME_EXISTS");
        if (existing_symbol) throw new Error("SYMBOL_EXISTS");
      }
      return await unitRepository.createUnit(name, symbol);
    } catch (err) {
      if (err instanceof Error && err.message === "NAME_EXISTS") throw err;
      if (err instanceof Error && err.message === "SYMBOL_EXISTS") throw err;
      throw new Error("SERVER_ERROR");
    }
  },

  updateUnit: async (
    id: number,
    name_input: string,
    symbol_input: string,
  ): Promise<units> => {
    try {
      // Kiểm tra unit có tồn tại không
      const currentUnit = await unitRepository.findById(id);

      if (!currentUnit) {
        throw new Error("NOT_FOUND");
      }

      // Lấy dữ liệu sau khi cập nhật
      const name = name_input ?? currentUnit.name;
      const symbol = symbol_input ?? currentUnit.symbol;

      // Kiểm tra trùng
      const [existingName, existingSymbol] = await Promise.all([
        unitRepository.findByNameExceptId(id, name),
        unitRepository.findBySymbolExceptId(id, symbol),
      ]);

      if (existingName) throw new Error("NAME_EXISTS");
      if (existingSymbol) throw new Error("SYMBOL_EXISTS");

      return await unitRepository.updateUnit(id, name, symbol);
    } catch (err) {
      if (
        err instanceof Error &&
        ["NOT_FOUND", "NAME_EXISTS", "SYMBOL_EXISTS"].includes(err.message)
      ) {
        throw err;
      }
      throw new Error("SERVER_ERROR");
    }
  },

  deleteUnit: async (id: number): Promise<units> => {
    try {
      return await unitRepository.deleteById(id);
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        if (err.code === "P2025") {
          throw new Error("NOT_FOUND");
        }
        if (err.code === "P2003") {
          throw new Error("IN_USE");
        }
      }
      throw new Error("SERVER_ERROR");
    }
  },
};
