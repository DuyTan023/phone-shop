import { requireApiAuth } from "@/lib/clerk-auth/authorization";
import { orderRequestService } from "@/lib/services/order/order_request.service";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const user = await requireApiAuth();

    const body = await request.json();

    const { order_id, type, reason } = body;

    if (!order_id || !type) {
      return NextResponse.json(
        {
          message: "order_id và type là bắt buộc",
        },
        { status: 400 },
      );
    }

    if (type !== "CREATE_ORDER" && type !== "CANCEL_ORDER") {
      return NextResponse.json(
        {
          message: "Loại yêu cầu không hợp lệ",
        },
        { status: 400 },
      );
    }

    const orderRequest = await orderRequestService.createRequest({
      order_id: Number(order_id),
      user_id: user.id,
      type,
      reason,
    });

    return NextResponse.json(
      {
        message: "Tạo yêu cầu thành công",
        data: orderRequest,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/users/order/requests error:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Không thể tạo yêu cầu",
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const user = await requireApiAuth();

    const requests = await orderRequestService.getUserRequests(user.id);

    return NextResponse.json({
      success: true,
      data: requests,
    });
  } catch (error) {
    console.error("GET /api/orders/requests error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Không thể lấy danh sách yêu cầu",
      },
      { status: 500 },
    );
  }
}
