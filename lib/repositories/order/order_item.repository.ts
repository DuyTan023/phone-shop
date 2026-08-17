//order_item.repository.ts

import { prisma } from "@/lib/prisma";

export const orderItemRepository = {
  // Lấy tất cả các sản phẩm chi tiết thuộc về một đơn hàng cụ thể
  findByOrderId(orderId: number) {
    return prisma.order_items.findMany({
      where: {
        order_id: orderId,
      },
      include: {
        product_variants: {
          include: {
            colors: true,
            rams: true,
            storages: true,
            products: {
              select: {
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });
  },

  // Tìm một order_item cụ thể theo ID
  findById(id: number) {
    return prisma.order_items.findUnique({
      where: {
        id: id,
      },
      include: {
        orders: true,
      },
    });
  },
};
