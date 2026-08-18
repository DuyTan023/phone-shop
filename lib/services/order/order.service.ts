import { orderRepository } from "@/lib/repositories/order/order.repository";
import { orderItemRepository } from "@/lib/repositories/order/order_item.repository";
import { payOSService } from "@/lib/services/payment/payos.service";

import type {
  CreateOrderInput,
  CreateOrderItemInput,
} from "@/lib/types/order/order.type";

import type { Webhook } from "@payos/node";

export const orderService = {
  // Lấy đơn hàng theo ID
  getOrderById(id: number) {
    return orderRepository.findById(id);
  },

  // Lấy đơn hàng của user
  getOrderByIdAndUserId(id: number, userId: number) {
    return orderRepository.findByIdAndUserId(id, userId);
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
};
