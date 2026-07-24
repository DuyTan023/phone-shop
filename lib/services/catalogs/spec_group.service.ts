import type { spec_groups } from "@/app/generated/prisma/client";
import { spectGroupRepository } from "@/lib/repositories/catalogs/spec_groups.repository";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";

export const specGroupService = {
  getSpecGroup: async (): Promise<spec_groups[]> => {
    try {
      return await spectGroupRepository.findMany();
    } catch (error) {
      console.log("Lỗi tại getSpecGroup service: ", error);
      throw new Error("SERVER_ERROR");
    }
  },

  getSpecGroupById: async (id: number): Promise<spec_groups> => {
    try {
      const spec_gropu = await spectGroupRepository.findSpecGroupById(id);
      if (!spec_gropu) throw new Error("NOT_FOUND");
      return spec_gropu;
    } catch (error) {
      if (error instanceof Error && error.message === "NOT_FOUND") {
        throw error;
      }
      throw new Error("SERVER_ERROR");
    }
  },

  createSpecGroup: async (name: string): Promise<spec_groups> => {
    try {
      if (name) {
        const existing = await spectGroupRepository.findSpecGroupByName(name);
        if (existing) throw new Error("VALUE_EXISTS");
      }
      return await spectGroupRepository.createSpecGroup(name);
    } catch (err) {
      if (err instanceof Error && err.message === "NAME_EXISTS") {
        throw err;
      }
      throw new Error("SERVER_ERROR");
    }
  },

  updateSpecGroup: async (id: number, name: string): Promise<spec_groups> => {
    try {
      if (name) {
        const existing = await spectGroupRepository.findSpecGroupByName(name);
        if (existing && existing.id !== id) throw new Error("NAME_EXISTS");
      }
      return await spectGroupRepository.updateSpecGroup(id, name);
    } catch (err) {
      if (err instanceof Error && err.message === "NAME_EXISTS") {
        throw err;
      }
      if (
        err instanceof PrismaClientKnownRequestError &&
        err.code === "P2025"
      ) {
        throw new Error("NOT_FOUND");
      }
      throw new Error("SERVER_ERROR");
    }
  },

  deleteSpecGroup: async (id: number): Promise<spec_groups> => {
    try {
      return await spectGroupRepository.deleteSpecGroup(id);
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        if (err.code === "P2025") {
          throw new Error("NOT_FOUND");
        }
        if (err.code === "P2003") {
          throw new Error("SPEC_GROUP_HAS_PRODUCTS");
        }
      }
      throw new Error("SERVER_ERROR");
    }
  },
};
