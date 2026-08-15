import { provinceService } from "@/lib/services/addresses/province.service";
import { NextRequest, NextResponse } from "next/server";

import type { provinces } from "@/app/generated/prisma/client";
import type { ApiResponse } from "@/lib/types/public/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const provinceId = Number(id);

    if (isNaN(provinceId)) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "ID tỉnh/thành không hợp lệ",
        },
        { status: 400 },
      );
    }

    const result = await provinceService.getProvinceById(provinceId);

    return NextResponse.json<ApiResponse<provinces>>({
      success: true,
      message: "Lấy tỉnh/thành thành công",
      data: result,
    });
  } catch (err) {
    console.error("GET API province by id Error:", err);

    if (err instanceof Error && err.message === "NOT_FOUND") {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "Không tìm thấy tỉnh/thành",
        },
        { status: 404 },
      );
    }

    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        message: "Lỗi hệ thống không thể lấy tỉnh/thành",
      },
      { status: 500 },
    );
  }
}
