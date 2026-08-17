// app/api/orders/[id]/payment/route.ts

import { NextResponse } from "next/server";

import { requireApiAuth } from "@/lib/clerk-auth/authorization";
import { orderService } from "@/lib/services/order/order.service";

export async function POST(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  },
) {
  try {
    const user = await requireApiAuth();

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

    const paymentLink = await orderService.createPayOSPayment(orderId, user.id);

    return NextResponse.json({
      success: true,
      message: "Tạo link thanh toán thành công",
      data: {
        checkoutUrl: paymentLink.checkoutUrl,
      },
    });
  } catch (error) {
    console.error("Create PayOS payment error:", error);

    const message =
      error instanceof Error ? error.message : "Không thể tạo link thanh toán";

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 },
    );
  }
}
