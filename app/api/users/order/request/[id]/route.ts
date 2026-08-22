import { requireApiAuth } from "@/lib/clerk-auth/authorization";
import { orderRequestService } from "@/lib/services/order/order_request.service";
import { NextResponse } from "next/server";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const user = await requireApiAuth();

    const { id } = await context.params;

    const requestId = Number(id);

    if (!Number.isInteger(requestId)) {
      return NextResponse.json(
        {
          message: "ID yêu cầu không hợp lệ",
        },
        { status: 400 },
      );
    }

    const orderRequest = await orderRequestService.getUserRequestById(
      requestId,
      user.id,
    );

    return NextResponse.json({
      data: orderRequest,
    });
  } catch (error) {
    console.error("GET /api/orders/requests/[id] error:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Không thể lấy yêu cầu",
      },
      { status: 500 },
    );
  }
}
