import type { units } from "@/app/generated/prisma/client";
import { unitService } from "@/lib/services/catalogs/unit.service";
import type { ApiResponse, PaginationResult } from "@/lib/types/public/types";
import { NextResponse, type NextRequest } from "next/server";
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);
    const keyword = searchParams.get("keyword") || undefined;
    const units = await unitService.getUnit({ page, limit, keyword });

    return NextResponse.json<ApiResponse<PaginationResult<units>>>({
      success: true,
      message: "Lấy danh sách đơn vị thành công",
      data: units,
    });
  } catch (err) {
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        message: "Lỗi server",
      },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const unit = await unitService.createUnit(body.name, body.symbol);
    return NextResponse.json<ApiResponse<units>>(
      { success: true, message: "Tạo đơn vị thành công", data: unit },
      { status: 201 },
    );
  } catch (err) {
    if (err instanceof Error && err.message === "NAME_EXISTS") {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "ĐƠn vị đã tồn tại",
        },
        { status: 409 },
      );
    }
    if (err instanceof Error && err.message === "SYMBOL_EXISTS") {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "Ký hiệu đã tồn tại",
        },
        { status: 409 },
      );
    }
    return NextResponse.json<ApiResponse<null>>(
      { success: false, message: "Lỗi server" },
      { status: 500 },
    );
  }
}
