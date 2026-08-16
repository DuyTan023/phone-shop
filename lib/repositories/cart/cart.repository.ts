import { prisma } from "@/lib/prisma";

export const cartRepository = {
  // Lấy giỏ hàng theo user ID
  findByUserId(userId: number) {
    return prisma.carts.findUnique({
      where: {
        user_id: userId,
      },
    });
  },

  // Tạo giỏ hàng cho user
  create(userId: number) {
    return prisma.carts.create({
      data: {
        user_id: userId,
      },
    });
  },
};
