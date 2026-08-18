// api/orders/[id]/route.ts

import { NextResponse } from "next/server";

import { requireApiAuth } from "@/lib/clerk-auth/authorization";
import { orderService } from "@/lib/services/order/order.service";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireApiAuth();
    const userId = await user.id;

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

    const order = await orderService.getOrderByIdAndUserId(orderId, userId);

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "Không tìm thấy đơn hàng",
        },
        { status: 404 },
      );
    }

    const serialized = JSON.parse(
      JSON.stringify(order, (_, value) =>
        typeof value === "bigint" ? value.toString() : value,
      ),
    );

    return NextResponse.json({
      success: true,
      data: serialized,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Có lỗi xảy ra",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireApiAuth();
    const userId = await user.id;

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

    const cancelledOrder = await orderService.cancelOrder(orderId, userId);

    const serialized = JSON.parse(
      JSON.stringify(cancelledOrder, (_, value) =>
        typeof value === "bigint" ? value.toString() : value,
      ),
    );

    return NextResponse.json({
      success: true,
      message: "Hủy đơn hàng thành công",
      data: serialized,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Không thể hủy đơn hàng",
      },
      { status: 400 },
    );
  }
}
