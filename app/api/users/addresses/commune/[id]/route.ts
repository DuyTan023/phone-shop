import { communeService } from "@/lib/services/addresses/commune.service";
import { NextResponse } from "next/server";

import type { communes } from "@/app/generated/prisma/client";
import type { ApiResponse } from "@/lib/types/public/types";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const communeId = Number(id);

    if (isNaN(communeId)) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "ID đơn vị cấp 2 không hợp lệ",
        },
        { status: 400 },
      );
    }

    const result = await communeService.getCommuneById(communeId);

    return NextResponse.json<ApiResponse<communes>>({
      success: true,
      message: "Lấy đơn vị cấp 2 thành công",
      data: result,
    });
  } catch (err) {
    console.error("GET API commune by id Error:", err);

    if (err instanceof Error && err.message === "NOT_FOUND") {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "Không tìm thấy đơn vị cấp 2",
        },
        { status: 404 },
      );
    }

    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        message: "Lỗi hệ thống không thể lấy đơn vị cấp 2",
      },
      { status: 500 },
    );
  }
}
