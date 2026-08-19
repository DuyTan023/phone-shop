import {
  orderRepository,
  type OrderStatus,
} from "@/lib/repositories/order/order.repository";
import { orderItemRepository } from "@/lib/repositories/order/order_item.repository";
import { payOSService } from "@/lib/services/payment/payos.service";

import type {
  CreateOrderInput,
  CreateOrderItemInput,
} from "@/lib/types/order/order.type";

import type { Webhook } from "@payos/node";

interface GetAdminOrdersInput {
  keyword?: string;
  status?: OrderStatus;
  payment_status?: "UNPAID" | "PENDING" | "PAID" | "REFUNDED";
  page?: number;
  limit?: number;
}

export const orderService = {
  // Lấy đơn hàng theo ID
  getOrderById(id: number) {
    return orderRepository.findById(id);
  },

  // Lấy đơn hàng của user
  getOrderByIdAndUserId(id: number, userId: number) {
    return orderRepository.findByIdAndUserId(id, userId);
  },

  getOrdersByUserId(userId: number) {
    return orderRepository.findManyByUserId(userId);
  },

  // Tạo đơn hàng
  async createOrder(
    orderData: CreateOrderInput,
    orderItems: Omit<CreateOrderItemInput, "order_id">[],
  ) {
    if (orderItems.length === 0) {
      throw new Error("Đơn hàng phải có ít nhất một sản phẩm");
    }

    const order = await orderRepository.create(orderData);

    for (const item of orderItems) {
      await orderItemRepository.createOrderItem({
        ...item,
        order_id: order.id,
      });
    }

    return orderRepository.findById(order.id);
  },

  // Tạo payment PayOS cho đơn hàng
  async createPayOSPayment(orderId: number, userId: number) {
    const order = await orderRepository.findByIdAndUserId(orderId, userId);

    if (!order) {
      throw new Error("Không tìm thấy đơn hàng");
    }

    if (order.payment_method !== "PAYOS") {
      throw new Error("Đơn hàng không sử dụng PayOS");
    }

    if (order.payment_status === "PAID") {
      throw new Error("Đơn hàng đã được thanh toán");
    }

    const amount = Number(order.total_amount);

    if (!Number.isInteger(amount) || amount <= 0) {
      throw new Error("Số tiền thanh toán không hợp lệ");
    }

    const orderCode = Number(`${Date.now()}${order.id}`.slice(-10));

    const items = order.order_items.map((item) => ({
      name: item.product_name,
      quantity: item.quantity,
      price: Number(item.price),
    }));

    const paymentLink = await payOSService.createPaymentLink({
      orderId: order.id,
      orderCode,
      amount,
      description: `Thanh toan don ${order.id}`,
      items,
    });

    await orderRepository.updatePaymentInfo(order.id, {
      payment_order_code: BigInt(orderCode),
      payment_link_id: paymentLink.paymentLinkId,
    });

    await orderRepository.updatePaymentStatus(order.id, "PENDING");

    return paymentLink;
  },

  // Xử lý webhook PayOS
  async handlePayOSWebhook(data: Webhook) {
    const webhookData = await payOSService.verifyWebhook(data);

    console.log("WEBHOOK DATA:", webhookData);
    console.log("ORDER CODE:", webhookData.orderCode);

    const orderCode = BigInt(webhookData.orderCode);

    console.log("ORDER CODE BIGINT:", orderCode);

    const order = await orderRepository.findByPaymentOrderCode(orderCode);

    // PayOS có thể gửi webhook test với orderCode không tồn tại
    if (!order) {
      console.warn(
        `Không tìm thấy đơn hàng với payment_order_code = ${orderCode}`,
      );

      return {
        alreadyPaid: false,
        order: null,
      };
    }

    // Webhook có thể được gửi lại
    if (order.payment_status === "PAID") {
      return {
        alreadyPaid: true,
        order,
      };
    }

    // Kiểm tra số tiền
    if (Number(webhookData.amount) !== Number(order.total_amount)) {
      throw new Error("Số tiền thanh toán không khớp");
    }

    const updatedOrder = await orderRepository.markPaymentAsPaid(order.id, {
      payment_reference: webhookData.reference,
      paid_at: new Date(),
    });

    return {
      alreadyPaid: false,
      order: updatedOrder,
    };
  },

  // Hủy đơn hàng
  async cancelOrder(orderId: number, userId: number) {
    const order = await orderRepository.findByIdAndUserId(orderId, userId);

    if (!order) {
      throw new Error("Không tìm thấy đơn hàng");
    }

    if (order.status !== "PENDING") {
      throw new Error("Không thể hủy đơn hàng ở trạng thái hiện tại");
    }

    if (order.payment_method === "PAYOS" && order.payment_status === "PAID") {
      throw new Error("Đơn hàng đã thanh toán, không thể hủy");
    }

    return orderRepository.cancelOrder(orderId);
  },

  async getAdminOrders(input: GetAdminOrdersInput = {}) {
    const page = input.page && input.page > 0 ? input.page : 1;

    const limit =
      input.limit && input.limit > 0 ? Math.min(input.limit, 100) : 10;

    const [total, orders] = await orderRepository.findManyForAdmin({
      keyword: input.keyword,
      status: input.status,
      payment_status: input.payment_status,
      page,
      limit,
    });

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async updateOrderStatus(orderId: number, newStatus: OrderStatus) {
    const order = await orderRepository.findById(orderId);

    if (!order) {
      throw new Error("Không tìm thấy đơn hàng");
    }

    const currentStatus = order.status as OrderStatus;

    // Không cho cập nhật nếu đơn đã hoàn thành
    // hoặc đã hủy
    if (currentStatus === "COMPLETED" || currentStatus === "CANCELLED") {
      throw new Error("Không thể cập nhật đơn hàng đã hoàn thành hoặc đã hủy");
    }

    // Kiểm tra trạng thái chuyển tiếp hợp lệ
    const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
      PENDING: ["CONFIRMED", "CANCELLED"],
      CONFIRMED: ["SHIPPING", "CANCELLED"],
      SHIPPING: ["COMPLETED"],
      COMPLETED: [],
      CANCELLED: [],
    };

    if (!allowedTransitions[currentStatus].includes(newStatus)) {
      throw new Error(
        `Không thể chuyển trạng thái từ ${currentStatus} sang ${newStatus}`,
      );
    }

    return orderRepository.updateStatus(orderId, newStatus);
  },

  async confirmCODPayment(orderId: number) {
    const order = await orderRepository.findById(orderId);

    if (!order) {
      throw new Error("Không tìm thấy đơn hàng");
    }

    // Chỉ COD mới được admin xác nhận thanh toán
    if (order.payment_method !== "COD") {
      throw new Error("Chỉ có thể xác nhận thanh toán cho đơn COD");
    }

    // Đơn phải đang UNPAID
    if (order.payment_status !== "UNPAID") {
      throw new Error("Đơn hàng không ở trạng thái chưa thanh toán");
    }

    return orderRepository.updatePaymentStatus(orderId, "PAID");
  },
};
