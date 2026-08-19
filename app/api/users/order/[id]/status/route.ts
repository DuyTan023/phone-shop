// app/api/orders/[id]/status/route.ts

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
    await requireApiAuth();

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

    const body = await request.json();

    const { status } = body;

    if (!status) {
      return NextResponse.json(
        {
          success: false,
          message: "Thiếu trạng thái đơn hàng",
        },
        { status: 400 },
      );
    }

    const order = await orderService.updateOrderStatus(orderId, status);

    return NextResponse.json({
      success: true,
      message: "Cập nhật trạng thái đơn hàng thành công",
      data: order,
    });
  } catch (error) {
    console.error("PATCH /api/admin/orders/[id]/status error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Không thể cập nhật trạng thái đơn hàng";

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
