import { requireAdmin } from "@/lib/clerk-auth/authorization";
import { orderRequestService } from "@/lib/services/order/order_request.service";
import { NextRequest, NextResponse } from "next/server";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    await requireAdmin();

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

    const body = await request.json();

    const { status, admin_note } = body;

    if (status !== "APPROVED" && status !== "REJECTED") {
      return NextResponse.json(
        {
          message: "status phải là APPROVED hoặc REJECTED",
        },
        { status: 400 },
      );
    }

    const result = await orderRequestService.handleRequest(requestId, {
      status,
      admin_note,
    });

    return NextResponse.json({
      message:
        status === "APPROVED" ? "Đã chấp nhận yêu cầu" : "Đã từ chối yêu cầu",
      data: result,
    });
  } catch (error) {
    console.error(
      "PATCH /api//users/order/admin/order-requests/[id] error:",
      error,
    );

    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Không thể xử lý yêu cầu",
      },
      { status: 500 },
    );
  }
}
