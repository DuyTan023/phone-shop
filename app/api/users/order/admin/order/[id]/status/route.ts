import { order_status } from "@/app/generated/prisma/enums";
import { requireAdmin } from "@/lib/clerk-auth/authorization";
import { orderService } from "@/lib/services/order/order.service";
import type { ApiResponse } from "@/lib/types/public/types";

import { NextResponse, type NextRequest } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // 1. Xác thực quyền Admin
    await requireAdmin();

    // Await params vì trong Next.js mới, params là một Promise
    const resolvedParams = await params;
    const orderId = Number(resolvedParams.id);

    if (isNaN(orderId)) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, message: "ID đơn hàng không hợp lệ" },
        { status: 400 },
      );
    }

    // 2. Lấy status từ body
    const body = await req.json();
    const { status } = body;

    // 3. Kiểm tra status có nằm trong enum hợp lệ không
    const validStatuses = Object.values(order_status);
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, message: "Trạng thái đơn hàng không hợp lệ" },
        { status: 400 },
      );
    }

    // 4. Gọi Service layer để cập nhật
    const updatedOrder = await orderService.updateOrderStatus(orderId, status);

    return NextResponse.json<ApiResponse<typeof updatedOrder>>({
      success: true,
      message: "Cập nhật trạng thái đơn hàng thành công",
      data: updatedOrder,
    });
  } catch (error) {
    // 5. Xử lý lỗi (bao gồm lỗi từ logic chuyển trạng thái của Service)
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Có lỗi xảy ra khi cập nhật trạng thái đơn hàng",
      },
      { status: 500 },
    );
  }
}
