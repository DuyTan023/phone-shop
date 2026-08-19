//order_item.repository.ts

import { prisma } from "@/lib/prisma";
import type { CreateOrderItemInput } from "@/lib/types/order/order.type";

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
  // Tạo order item
  createOrderItem(data: CreateOrderItemInput) {
    return prisma.order_items.create({
      data: {
        order_id: data.order_id,
        variant_id: data.variant_id,
        product_name: data.product_name,
        sku: data.sku,
        variant_info: data.variant_info,
        price: data.price,
        quantity: data.quantity,
        total_price: data.total_price,
        image_url: data.image_url,
      },
    });
  },
};
