// app/api/users/order/[id]/cancel/route.ts

import { NextRequest, NextResponse } from "next/server";

import { requireApiAuth } from "@/lib/clerk-auth/authorization";
import { orderService } from "@/lib/services/order/order.service";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const user = await requireApiAuth();
    const userId = user.id;

    const { id } = await params;

    const orderId = Number(id);

    if (!Number.isInteger(orderId) || orderId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "ID đơn hàng không hợp lệ",
        },
        { status: 400 },
      );
    }

    const order = await orderService.cancelOrder(orderId, userId);

    return NextResponse.json({
      success: true,
      message: "Hủy đơn hàng thành công",
      data: order,
    });
  } catch (error) {
    console.error("PATCH /api/users/order/[id]/cancel error:", error);

    const message =
      error instanceof Error ? error.message : "Không thể hủy đơn hàng";

    const statusCode = message === "Không tìm thấy đơn hàng" ? 404 : 400;

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: statusCode },
    );
  }
}
