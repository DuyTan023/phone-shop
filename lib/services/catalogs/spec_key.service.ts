import {
  specKeyRepository,
  type SpecKeyWithGroup,
} from "@/lib/repositories/catalogs/spec_keys.repository";

import type { spec_keys } from "@/app/generated/prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { PaginationResult } from "./../../types/public/types";

type GetSpecKeyParams = {
  page?: number;
  limit?: number;
};

export const specKeyService = {
  GetSpecKey: async ({
    page = 1,
    limit = 10,
  }: GetSpecKeyParams): Promise<PaginationResult<SpecKeyWithGroup>> => {
    try {
      const { spec_keys, total } = await specKeyRepository.findMany({
        page,
        limit,
      });
      return {
        data: spec_keys,
        total: total,
        page: page,
        limit: limit,
        totalPage: Math.ceil(total / limit),
      };
    } catch (err) {
      throw new Error("Không thể lấy danh sách danh sách tên thông số" + err);
    }
  },
  getSpecKeyById: async (id: number): Promise<spec_keys> => {
    try {
      const spec_key = await specKeyRepository.findById(id);
      if (!spec_key) throw new Error("NOT_FOUND");
      return spec_key;
    } catch (err) {
      if (err instanceof Error && err.message === "NOT_FOUND") throw err;

      throw new Error("SERVER_ERROR");
    }
  },

  updateSpecKey: async (
    id: number,
    name: string,
    group_id: number,
  ): Promise<spec_keys> => {
    try {
      if (name && group_id) {
        const existing = await specKeyRepository.findByNameGroupId(
          name,
          group_id,
        );
        if (existing && existing.id != id) throw new Error("SPEC_KEY_EXISTS");
      }
      return await specKeyRepository.updateSpecKeyById(id, name, group_id);
    } catch (err) {
      if (err instanceof Error && err.message === "SPEC_KEY_EXISTS") throw err;

      if (err instanceof PrismaClientKnownRequestError && err.code === "P2025")
        throw new Error("NOT_FOUND");
      throw new Error("SERVER_ERROR");
    }
  },

  creatSpecKey: async (name: string, group_id: number): Promise<spec_keys> => {
    try {
      const existing = await specKeyRepository.findByNameGroupId(
        name,
        group_id,
      );
      if (existing) throw new Error("SPEC_KEY_EXISTS");

      return await specKeyRepository.createSpecKey(group_id, name);
    } catch (err) {
      if (err instanceof Error && err.message === "SPEC_KEY_EXISTS") throw err;

      if (err instanceof PrismaClientKnownRequestError && err.code === "2003")
        throw new Error("NOT_FOUND");
      throw new Error("SERVER_ERROR");
    }
  },

  deleteSpecKey: async (id: number): Promise<spec_keys> => {
    try {
      return await specKeyRepository.deleteSpecKeyById(id);
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        if (err.code === "P2025") {
          throw new Error("NOT_FOUND");
        }
        if (err.code === "P2003") {
          throw new Error("SPEC_KEYS_HAS_PRODUCTS");
        }
      }
      throw new Error("SERVER_ERROR");
    }
  },
};
