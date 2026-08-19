import type {
  order_status,
  payment_status,
} from "@/app/generated/prisma/client";

import { requireAdmin } from "@/lib/clerk-auth/authorization";
import { orderService } from "@/lib/services/order/order.service";
import type { ApiResponse } from "@/lib/types/public/types";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);

    const keyword = searchParams.get("keyword") || undefined;

    // ORDER STATUS

    const statusParam = searchParams.get("status");

    const status =
      statusParam === "PENDING" ||
      statusParam === "CONFIRMED" ||
      statusParam === "SHIPPING" ||
      statusParam === "COMPLETED" ||
      statusParam === "CANCELLED"
        ? (statusParam as order_status)
        : undefined;

    // PAYMENT STATUS

    const paymentStatusParam = searchParams.get("payment_status");

    const payment_status =
      paymentStatusParam === "UNPAID" ||
      paymentStatusParam === "PENDING" ||
      paymentStatusParam === "PAID" ||
      paymentStatusParam === "REFUNDED"
        ? (paymentStatusParam as payment_status)
        : undefined;

    // GET ORDERS

    const orders = await orderService.getAdminOrders({
      keyword,
      status,
      payment_status,
      page,
      limit,
    });

    // SERIALIZE BIGINT

    const serialized = JSON.parse(
      JSON.stringify(orders, (_, value) =>
        typeof value === "bigint" ? value.toString() : value,
      ),
    );

    return NextResponse.json<ApiResponse<typeof serialized>>({
      success: true,
      message: "Lấy danh sách đơn hàng thành công",
      data: serialized,
    });
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>(
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
