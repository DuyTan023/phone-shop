// order-request.repository.ts

import { prisma } from "@/lib/prisma";
import type {
  CreateOrderRequestInput,
  UpdateOrderRequestInput,
} from "@/lib/types/order/order_request.type";

export type OrderRequestType = "CREATE_ORDER" | "CANCEL_ORDER";

export type OrderRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

interface FindManyForAdminParams {
  keyword?: string;
  type?: OrderRequestType;
  status?: OrderRequestStatus;
  page?: number;
  limit?: number;
}

export const orderRequestRepository = {
  // Tìm request theo ID
  findById(id: number) {
    return prisma.order_requests.findUnique({
      where: {
        id,
      },
      include: {
        orders: {
          include: {
            order_items: true,
          },
        },
        users: true,
      },
    });
  },

  // Tìm request của một user
  findByIdAndUserId(id: number, userId: number) {
    return prisma.order_requests.findFirst({
      where: {
        id,
        user_id: userId,
      },
      include: {
        orders: {
          include: {
            order_items: true,
          },
        },
      },
    });
  },

  // Lấy danh sách request của user
  findManyByUserId(userId: number) {
    return prisma.order_requests.findMany({
      where: {
        user_id: userId,
      },
      include: {
        orders: {
          include: {
            order_items: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });
  },

  // Tạo request
  create(data: CreateOrderRequestInput) {
    return prisma.order_requests.create({
      data: {
        order_id: data.order_id,
        user_id: data.user_id,
        type: data.type,
        reason: data.reason,
      },
    });
  },

  // Cập nhật trạng thái request
  updateStatus(id: number, data: UpdateOrderRequestInput) {
    return prisma.order_requests.update({
      where: {
        id,
      },
      data: {
        status: data.status,
        admin_note: data.admin_note,
      },
    });
  },

  // Kiểm tra request đang PENDING của một order
  findPendingByOrderId(orderId: number, type: OrderRequestType) {
    return prisma.order_requests.findFirst({
      where: {
        order_id: orderId,
        type,
        status: "PENDING",
      },
    });
  },

  // Lấy danh sách request cho admin
  findManyForAdmin(params: FindManyForAdminParams = {}) {
    const { keyword, type, status, page = 1, limit = 10 } = params;

    const normalizedPage = Math.max(1, page);
    const normalizedLimit = Math.min(Math.max(1, limit), 100);

    const skip = (normalizedPage - 1) * normalizedLimit;

    const keywordTrimmed = keyword?.trim();

    const orderId = keywordTrimmed ? Number(keywordTrimmed) : NaN;

    const where = {
      ...(type && {
        type,
      }),

      ...(status && {
        status,
      }),

      ...(keywordTrimmed && {
        OR: [
          ...(Number.isInteger(orderId)
            ? [
                {
                  order_id: orderId,
                },
              ]
            : []),

          {
            users: {
              full_name: {
                contains: keywordTrimmed,
                mode: "insensitive" as const,
              },
            },
          },

          {
            users: {
              email: {
                contains: keywordTrimmed,
                mode: "insensitive" as const,
              },
            },
          },
        ],
      }),
    };

    return prisma.$transaction([
      prisma.order_requests.count({
        where,
      }),

      prisma.order_requests.findMany({
        where,
        orderBy: {
          created_at: "desc",
        },
        skip,
        take: normalizedLimit,
        include: {
          orders: {
            include: {
              order_items: true,
            },
          },
          users: true,
        },
      }),
    ]);
  },

  // Cập nhật ghi chú admin
  updateAdminNote(id: number, admin_note: string | null) {
    return prisma.order_requests.update({
      where: {
        id,
      },
      data: {
        admin_note,
      },
    });
  },
};
