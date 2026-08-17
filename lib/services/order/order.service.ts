import { orderRepository } from "@/lib/repositories/order/order.repository";
import { payOSService } from "@/lib/services/payment/payos.service";
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

    // Tạo orderCode cho PayOS
    const orderCode = Number(`${Date.now()}${order.id}`.slice(-10));

    // Chuyển order_items thành items của PayOS
    const items = order.order_items.map((item) => ({
      name: item.product_name,
      quantity: item.quantity,
      price: Number(item.price),
    }));

    // Gọi PayOS
    const paymentLink = await payOSService.createPaymentLink({
      orderCode,
      amount,
      description: `Thanh toan don ${order.id}`,
      items,
    });

    // Lưu thông tin PayOS
    await orderRepository.updatePaymentInfo(order.id, {
      payment_order_code: BigInt(orderCode),
      payment_link_id: paymentLink.paymentLinkId,
    });

    // Chuyển sang trạng thái chờ thanh toán
    await orderRepository.updatePaymentStatus(order.id, "PENDING");

    return paymentLink;
  },

  // Xử lý webhook PayOS
  async handlePayOSWebhook(data: Webhook) {
    // Verify chữ ký webhook
    const webhookData = await payOSService.verifyWebhook(data);

    // Tìm Order
    const order = await orderRepository.findByPaymentOrderCode(
      BigInt(webhookData.orderCode),
    );

    if (!order) {
      throw new Error("Không tìm thấy đơn hàng");
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

    // Cập nhật PAID
    const updatedOrder = await orderRepository.markPaymentAsPaid(order.id, {
      payment_reference: webhookData.reference,
      paid_at: new Date(),
    });

    return {
      alreadyPaid: false,
      order: updatedOrder,
    };
  },

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
