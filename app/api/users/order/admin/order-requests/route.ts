import { requireAdmin } from "@/lib/clerk-auth/authorization";
import { orderRequestService } from "@/lib/services/order/order_request.service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);

    const keyword = searchParams.get("keyword") || undefined;

    const type = searchParams.get("type") || undefined;

    const status = searchParams.get("status") || undefined;

    const page = Number(searchParams.get("page") || 1);

    const limit = Number(searchParams.get("limit") || 10);

    const [total, requests] = await orderRequestService.getRequestsForAdmin({
      keyword,
      type:
        type === "CREATE_ORDER" || type === "CANCEL_ORDER" ? type : undefined,
      status:
        status === "PENDING" || status === "APPROVED" || status === "REJECTED"
          ? status
          : undefined,
      page,
      limit,
    });

    return NextResponse.json({
      data: requests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/users/order/admin/order-requests error:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Không thể lấy danh sách yêu cầu",
      },
      { status: 500 },
    );
  }
}
