// order-request.service.ts

import { orderRepository } from "@/lib/repositories/order/order.repository";
import {
  orderRequestRepository,
  type OrderRequestStatus,
  type OrderRequestType,
} from "@/lib/repositories/order/order_request.repository";
import type {
  CreateOrderRequestInput,
  UpdateOrderRequestInput,
} from "@/lib/types/order/order_request.type";

export const orderRequestService = {
  // User tạo yêu cầu
  async createRequest(data: CreateOrderRequestInput) {
    // Kiểm tra order tồn tại và thuộc về user
    const order = await orderRepository.findByIdAndUserId(
      data.order_id,
      data.user_id,
    );

    if (!order) {
      throw new Error("Không tìm thấy đơn hàng");
    }

    // Kiểm tra request đang chờ xử lý
    const pendingRequest = await orderRequestRepository.findPendingByOrderId(
      data.order_id,
      data.type,
    );

    if (pendingRequest) {
      throw new Error("Đơn hàng đã có yêu cầu đang chờ xử lý");
    }

    // CREATE_ORDER
    if (data.type === "CREATE_ORDER") {
      if (order.status !== "PENDING") {
        throw new Error("Đơn hàng không ở trạng thái chờ xác nhận");
      }
    }

    // CANCEL_ORDER
    if (data.type === "CANCEL_ORDER") {
      if (order.status === "CANCELLED") {
        throw new Error("Đơn hàng đã bị hủy");
      }

      if (order.status === "COMPLETED") {
        throw new Error("Không thể yêu cầu hủy đơn đã hoàn thành");
      }

      if (order.payment_method !== "COD") {
        throw new Error("Chỉ có thể yêu cầu hủy đơn bằng phương thức COD");
      }
    }

    return orderRequestRepository.create(data);
  },

  // Lấy request theo ID
  async getRequestById(id: number) {
    const request = await orderRequestRepository.findById(id);

    if (!request) {
      throw new Error("Không tìm thấy yêu cầu");
    }

    return request;
  },

  // User lấy request của mình
  async getUserRequests(userId: number) {
    return orderRequestRepository.findManyByUserId(userId);
  },

  // User lấy request cụ thể của mình
  async getUserRequestById(id: number, userId: number) {
    const request = await orderRequestRepository.findByIdAndUserId(id, userId);

    if (!request) {
      throw new Error("Không tìm thấy yêu cầu");
    }

    return request;
  },

  // Admin lấy danh sách request
  async getRequestsForAdmin(params?: {
    keyword?: string;
    type?: OrderRequestType;
    status?: OrderRequestStatus;
    page?: number;
    limit?: number;
  }) {
    return orderRequestRepository.findManyForAdmin(params);
  },

  // Admin xử lý request
  async handleRequest(id: number, data: UpdateOrderRequestInput) {
    const request = await orderRequestRepository.findById(id);

    if (!request) {
      throw new Error("Không tìm thấy yêu cầu");
    }

    if (request.status !== "PENDING") {
      throw new Error("Yêu cầu này đã được xử lý");
    }

    // Nếu admin từ chối
    if (data.status === "REJECTED") {
      return orderRequestRepository.updateStatus(id, data);
    }

    // =========================
    // Admin APPROVED request
    // =========================

    if (request.type === "CREATE_ORDER") {
      if (request.orders.status !== "PENDING") {
        throw new Error("Đơn hàng không còn ở trạng thái chờ xác nhận");
      }

      const [updatedRequest, updatedOrder] = await Promise.all([
        orderRequestRepository.updateStatus(id, data),
        orderRepository.updateStatus(request.order_id, "CONFIRMED"),
      ]);

      return {
        request: updatedRequest,
        order: updatedOrder,
      };
    }

    if (request.type === "CANCEL_ORDER") {
      if (request.orders.status === "CANCELLED") {
        throw new Error("Đơn hàng đã bị hủy");
      }

      const [updatedRequest, updatedOrder] = await Promise.all([
        orderRequestRepository.updateStatus(id, data),
        orderRepository.cancelOrder(request.order_id),
      ]);

      return {
        request: updatedRequest,
        order: updatedOrder,
      };
    }

    throw new Error("Loại yêu cầu không hợp lệ");
  },

  // Admin cập nhật ghi chú
  async updateAdminNote(id: number, admin_note: string | null) {
    const request = await orderRequestRepository.findById(id);

    if (!request) {
      throw new Error("Không tìm thấy yêu cầu");
    }

    return orderRequestRepository.updateAdminNote(id, admin_note);
  },
};
