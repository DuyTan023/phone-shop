import { requireAdmin } from "@/lib/clerk-auth/authorization";
import { orderService } from "@/lib/services/order/order.service";
import { NextRequest, NextResponse } from "next/server";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(_request: NextRequest, context: RouteContext) {
  try {
    await requireAdmin();

    const { id } = await context.params;
    const orderId = Number(id);

    // Kiểm tra ID
    if (!Number.isInteger(orderId) || orderId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "ID đơn hàng không hợp lệ",
        },
        { status: 400 },
      );
    }

    // Xác nhận thanh toán COD
    const result = await orderService.confirmCODPayment(orderId);

    return NextResponse.json(
      {
        success: true,
        message: "Đã xác nhận thanh toán COD",
        data: result,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(
      "PATCH /api/users/order/admin/orders/[id]/confirm-cod error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Không thể xác nhận thanh toán COD",
      },
      { status: 500 },
    );
  }
}
