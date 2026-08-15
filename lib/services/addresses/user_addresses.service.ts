import type { user_addresses } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { userAddressRepository } from "@/lib/repositories/addressrs/user_addresses.repository";
import type {
  CreateUserAddressesInput,
  UpdateUserAddressesInput,
} from "@/lib/types/users/addresses.type";

export const userAddressService = {
  // Lấy tất cả địa chỉ của user
  getUserAddresses: async (user_id: number): Promise<user_addresses[]> => {
    try {
      return await userAddressRepository.findByUserId(user_id);
    } catch (error) {
      console.log("Lỗi tại getUserAddresses service: ", error);
      throw new Error("SERVER_ERROR");
    }
  },

  // Lấy địa chỉ theo ID
  getUserAddressById: async (
    id: number,
    user_id: number,
  ): Promise<user_addresses> => {
    try {
      const address = await userAddressRepository.findByIdAndUserId(
        id,
        user_id,
      );

      if (!address) throw new Error("NOT_FOUND");

      return address;
    } catch (error) {
      if (error instanceof Error && error.message === "NOT_FOUND") {
        throw error;
      }

      throw new Error("SERVER_ERROR");
    }
  },

  // Lấy địa chỉ mặc định
  getDefaultUserAddress: async (user_id: number): Promise<user_addresses> => {
    try {
      const address = await userAddressRepository.findDefaultByUserId(user_id);

      if (!address) throw new Error("NOT_FOUND");

      return address;
    } catch (error) {
      if (error instanceof Error && error.message === "NOT_FOUND") {
        throw error;
      }

      throw new Error("SERVER_ERROR");
    }
  },

  // Tạo địa chỉ (Dùng transaction)
  createUserAddress: async (
    user_id: number,
    data: CreateUserAddressesInput,
  ): Promise<user_addresses> => {
    try {
      return await prisma.$transaction(async (tx) => {
        if (data.is_default) {
          await tx.user_addresses.updateMany({
            where: { user_id, is_default: true },
            data: { is_default: false },
          });
        }

        return await tx.user_addresses.create({
          data: {
            ...data,
            user_id,
          },
        });
      });
    } catch (error) {
      console.log("Lỗi tại createUserAddress service: ", error);
      throw new Error("SERVER_ERROR");
    }
  },

  // Cập nhật địa chỉ (Dùng transaction)
  updateUserAddress: async (
    id: number,
    user_id: number,
    data: UpdateUserAddressesInput,
  ): Promise<user_addresses> => {
    try {
      const address = await userAddressRepository.findByIdAndUserId(
        id,
        user_id,
      );

      if (!address) throw new Error("NOT_FOUND");

      return await prisma.$transaction(async (tx) => {
        if (data.is_default === true) {
          await tx.user_addresses.updateMany({
            where: { user_id, is_default: true },
            data: { is_default: false },
          });
        }

        return await tx.user_addresses.update({
          where: { id },
          data,
        });
      });
    } catch (error) {
      if (error instanceof Error && error.message === "NOT_FOUND") {
        throw error;
      }

      console.log("Lỗi tại updateUserAddress service: ", error);
      throw new Error("SERVER_ERROR");
    }
  },

  // Xóa địa chỉ
  deleteUserAddress: async (
    id: number,
    user_id: number,
  ): Promise<user_addresses> => {
    try {
      const address = await userAddressRepository.findByIdAndUserId(
        id,
        user_id,
      );

      if (!address) throw new Error("NOT_FOUND");

      return await userAddressRepository.delete(id);
    } catch (error) {
      if (error instanceof Error && error.message === "NOT_FOUND") {
        throw error;
      }

      throw new Error("SERVER_ERROR");
    }
  },
};
