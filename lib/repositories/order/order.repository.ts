//order.repository.ts

import { prisma } from "@/lib/prisma";

export const orderRepository = {
  // Tìm đơn hàng theo ID
  findById(id: number) {
    return prisma.orders.findUnique({
      where: {
        id,
      },
      include: {
        order_items: true,
      },
    });
  },

  findByIdAndUserId(id: number, userId: number) {
    return prisma.orders.findFirst({
      where: {
        id,
        user_id: userId,
      },
      include: {
        order_items: true,
      },
    });
  },

  // Tìm đơn hàng bằng mã orderCode của PayOS
  findByPaymentOrderCode(paymentOrderCode: bigint) {
    return prisma.orders.findUnique({
      where: {
        payment_order_code: paymentOrderCode,
      },
    });
  },

  // Lưu thông tin payment link PayOS
  updatePaymentInfo(
    id: number,
    data: {
      payment_order_code: bigint;
      payment_link_id: string;
    },
  ) {
    return prisma.orders.update({
      where: {
        id,
      },
      data: {
        payment_order_code: data.payment_order_code,
        payment_link_id: data.payment_link_id,
      },
    });
  },

  // Cập nhật trạng thái thanh toán thành công
  markPaymentAsPaid(
    id: number,
    data: {
      payment_reference?: string | null;
      paid_at: Date;
    },
  ) {
    return prisma.orders.update({
      where: {
        id,
      },
      data: {
        payment_status: "PAID",
        payment_reference: data.payment_reference,
        paid_at: data.paid_at,
      },
    });
  },

  // Cập nhật trạng thái thanh toán
  updatePaymentStatus(
    id: number,
    payment_status: "UNPAID" | "PENDING" | "PAID" | "REFUNDED",
  ) {
    return prisma.orders.update({
      where: {
        id,
      },
      data: {
        payment_status,
      },
    });
  },

  // Hủy đơn hàng
  cancelOrder(id: number) {
    return prisma.orders.update({
      where: {
        id,
      },
      data: {
        status: "CANCELLED",
      },
    });
  },
};
