import type { rams, storages } from "@/app/generated/prisma/client";
import {
  ramRepository,
  storageRepository,
} from "@/lib/repositories/catalogs/storage_ram.repository";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";

export const ramService = {
  getRam: async (): Promise<rams[]> => {
    try {
      return await ramRepository.findMany();
    } catch (error) {
      console.log("Lỗi tại getRam service: ", error);
      throw new Error("SERVER_ERROR");
    }
  },
  getRamById: async (id: number): Promise<rams> => {
    try {
      const ram = await ramRepository.findRamById(id);
      if (!ram) throw new Error("NOT_FOUND");
      return ram;
    } catch (error) {
      if (error instanceof Error && error.message === "NOT_FOUND") {
        throw error;
      }
      throw new Error("SERVER_ERROR");
    }
  },

  createRam: async (value: string): Promise<rams> => {
    try {
      if (value) {
        const existing = await ramRepository.findRamByValue(value);
        if (existing) throw new Error("VALUE_EXISTS");
      }
      return await ramRepository.createRam(value);
    } catch (err) {
      if (err instanceof Error && err.message === "VALUE_EXISTS") {
        throw err;
      }
      throw new Error("SERVER_ERROR");
    }
  },
  updateRam: async (id: number, value: string): Promise<rams> => {
    try {
      if (value) {
        const existing = await ramRepository.findRamByValue(value);
        if (existing && existing.id !== id) throw new Error("VALUE_EXISTS");
      }
      return await ramRepository.updateRam(id, value);
    } catch (err) {
      if (err instanceof Error && err.message === "VALUE_EXISTS") {
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

  deleteRam: async (id: number): Promise<rams> => {
    try {
      return await ramRepository.deleteRam(id);
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        if (err.code === "P2025") {
          throw new Error("NOT_FOUND");
        }
        if (err.code === "P2003") {
          throw new Error("RAM_HAS_PRODUCTS");
        }
      }
      throw new Error("SERVER_ERROR");
    }
  },
};

export const storageService = {
  getStorage: async (): Promise<storages[]> => {
    try {
      return await storageRepository.findMany();
    } catch (error) {
      console.log("Lỗi tại getRam service: ", error);
      throw new Error("SERVER_ERROR");
    }
  },
  getStorageById: async (id: number): Promise<storages> => {
    try {
      const storage = await storageRepository.findStorageById(id);
      if (!storage) throw new Error("NOT_FOUND");
      return storage;
    } catch (error) {
      if (error instanceof Error && error.message === "NOT_FOUND") {
        throw error;
      }
      throw new Error("SERVER_ERROR");
    }
  },

  createStorage: async (value: string): Promise<storages> => {
    try {
      if (value) {
        const existing = await storageRepository.findStorageByValue(value);
        if (existing) throw new Error("VALUE_EXISTS");
      }
      return await storageRepository.createStorage(value);
    } catch (err) {
      if (err instanceof Error && err.message === "VALUE_EXISTS") {
        throw err;
      }
      throw new Error("SERVER_ERROR");
    }
  },
  updateStorage: async (id: number, value: string): Promise<storages> => {
    try {
      if (value) {
        const existing = await storageRepository.findStorageByValue(value);
        if (existing && existing.id !== id) throw new Error("VALUE_EXISTS");
      }
      return await storageRepository.updateStorage(id, value);
    } catch (err) {
      if (err instanceof Error && err.message === "VALUE_EXISTS") {
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

  deleteStorage: async (id: number): Promise<storages> => {
    try {
      return await storageRepository.deleteStorage(id);
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        if (err.code === "P2025") {
          throw new Error("NOT_FOUND");
        }
        if (err.code === "P2003") {
          throw new Error("STORAGE_HAS_PRODUCTS");
        }
      }
      throw new Error("SERVER_ERROR");
    }
  },
};
