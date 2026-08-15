import { prisma } from "@/lib/prisma";
import type {
  CreateUserAddressesInput,
  UpdateUserAddressesInput,
} from "@/lib/types/users/addresses.type";

export const userAddressRepository = {
  findByUserId(user_id: number) {
    return prisma.user_addresses.findMany({
      where: {
        user_id,
      },
      orderBy: [
        {
          is_default: "desc",
        },
        {
          created_at: "desc",
        },
      ],
    });
  },

  findById(id: number) {
    return prisma.user_addresses.findUnique({
      where: {
        id,
      },
    });
  },

  findByIdAndUserId(id: number, user_id: number) {
    return prisma.user_addresses.findFirst({
      where: {
        id,
        user_id,
      },
    });
  },

  findDefaultByUserId(user_id: number) {
    return prisma.user_addresses.findFirst({
      where: {
        user_id,
        is_default: true,
      },
    });
  },

  // Hàm reset tất cả địa chỉ mặc định của user về false
  resetDefaultByUserId(user_id: number) {
    return prisma.user_addresses.updateMany({
      where: {
        user_id,
        is_default: true,
      },
      data: {
        is_default: false,
      },
    });
  },

  create(data: CreateUserAddressesInput) {
    return prisma.user_addresses.create({
      data,
    });
  },

  update(id: number, data: UpdateUserAddressesInput) {
    return prisma.user_addresses.update({
      where: {
        id,
      },
      data,
    });
  },

  delete(id: number) {
    return prisma.user_addresses.delete({
      where: {
        id,
      },
    });
  },
};
