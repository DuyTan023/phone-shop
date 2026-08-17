import { NextResponse } from "next/server";

import { orderService } from "@/lib/services/order/order.service";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    await orderService.handlePayOSWebhook(body);

    return NextResponse.json({
      success: true,
      message: "Webhook xử lý thành công",
    });
  } catch (error) {
    console.error("PayOS webhook error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Webhook không hợp lệ",
      },
      { status: 400 },
    );
  }
}
