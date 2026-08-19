import { NextResponse } from "next/server";

import { requireApiAuth } from "@/lib/clerk-auth/authorization";
import { orderService } from "@/lib/services/order/order.service";

export async function POST(request: Request) {
  try {
    const user = await requireApiAuth();

    const body = await request.json();

    const {
      recipient_name,
      recipient_phone,
      shipping_address,
      note,
      subtotal,
      shipping_fee,
      total_amount,
      payment_method,
      items,
    } = body;

    if (
      !recipient_name ||
      !recipient_phone ||
      !shipping_address ||
      !payment_method ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Thông tin đặt hàng không hợp lệ",
        },
        { status: 400 },
      );
    }

    if (payment_method !== "COD" && payment_method !== "PAYOS") {
      return NextResponse.json(
        {
          success: false,
          message: "Phương thức thanh toán không hợp lệ",
        },
        { status: 400 },
      );
    }

    const order = await orderService.createOrder(
      {
        user_id: user.id,
        recipient_name,
        recipient_phone,
        shipping_address,
        note,
        subtotal: Number(subtotal),
        shipping_fee: Number(shipping_fee),
        total_amount: Number(total_amount),
        payment_method,
      },
      items,
    );

    return NextResponse.json(
      {
        success: true,
        message: "Tạo đơn hàng thành công",
        data: order,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create order error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Không thể tạo đơn hàng",
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const user = await requireApiAuth();

    const orders = await orderService.getOrdersByUserId(user.id);

    const serialized = JSON.parse(
      JSON.stringify(orders, (_, value) =>
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

        message:
          error instanceof Error
            ? error.message
            : "Không thể tải danh sách đơn hàng",
      },

      { status: 500 },
    );
  }
}
