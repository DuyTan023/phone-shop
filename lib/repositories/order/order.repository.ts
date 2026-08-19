//order.repository.ts

import type { order_status } from "@/app/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import type { CreateOrderInput } from "@/lib/types/order/order.type";
export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "SHIPPING"
  | "COMPLETED"
  | "CANCELLED";

type PaymentStatus = "UNPAID" | "PENDING" | "PAID" | "REFUNDED";
interface FindManyForAdminParams {
  keyword?: string;
  status?: OrderStatus;
  payment_status?: PaymentStatus;
  page?: number;
  limit?: number;
}

const statusPriority: Record<string, number> = {
  PENDING: 1,
  CONFIRMED: 2,
  SHIPPING: 3,
  COMPLETED: 4,
  CANCELLED: 5, // Thấp nhất, nằm ở cuối cùng
};

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

  findManyByUserId(userId: number) {
    return prisma.orders.findMany({
      where: {
        user_id: userId,
      },
      include: {
        order_items: true,
      },
      orderBy: {
        created_at: "desc",
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

  // Tạo đơn hàng
  create(data: CreateOrderInput) {
    return prisma.orders.create({
      data: {
        user_id: data.user_id,
        recipient_name: data.recipient_name,
        recipient_phone: data.recipient_phone,
        shipping_address: data.shipping_address,
        note: data.note,
        subtotal: data.subtotal,
        shipping_fee: data.shipping_fee,
        total_amount: data.total_amount,
        payment_method: data.payment_method,
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
      include: {
        order_items: true,
      },
    });
  },

  findManyForAdmin(params: FindManyForAdminParams = {}) {
    const { keyword, status, payment_status, page = 1, limit = 10 } = params;

    const normalizedPage = Math.max(1, page);
    const normalizedLimit = Math.min(Math.max(1, limit), 100);

    const skip = (normalizedPage - 1) * normalizedLimit;

    const keywordTrimmed = keyword?.trim();

    const orderId = keywordTrimmed ? Number(keywordTrimmed) : NaN;

    const where = {
      status: status ? status : { not: "CANCELLED" as order_status },

      ...(payment_status && {
        payment_status,
      }),

      ...(keywordTrimmed && {
        OR: [
          ...(Number.isInteger(orderId)
            ? [
                {
                  id: orderId,
                },
              ]
            : []),

          {
            recipient_name: {
              contains: keywordTrimmed,
              mode: "insensitive" as const,
            },
          },
        ],
      }),
    };
    return prisma.$transaction([
      prisma.orders.count({
        where,
      }),

      prisma.orders.findMany({
        where,
        orderBy: {
          created_at: "desc",
        },
        skip,
        take: normalizedLimit,
        include: {
          order_items: true,
          users: true,
        },
      }),
    ]);
  },

  updateStatus(id: number, status: OrderStatus) {
    return prisma.orders.update({
      where: {
        id,
      },
      data: {
        status,
      },
    });
  },
};
