import { communeService } from "@/lib/services/addresses/commune.service";
import { NextResponse } from "next/server";

import type { communes } from "@/app/generated/prisma/client";
import type { ApiResponse } from "@/lib/types/public/types";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ province_id: string }> },
) {
  try {
    const { province_id } = await params;
    const provinceId = Number(province_id);

    if (isNaN(provinceId)) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "Province ID không hợp lệ",
        },
        { status: 400 },
      );
    }

    const result = await communeService.getCommunesByProvinceId(provinceId);

    return NextResponse.json<ApiResponse<communes[]>>({
      success: true,
      message: "Lấy danh sách đơn vị cấp 2 thành công",
      data: result,
    });
  } catch (err) {
    console.error("GET API communes by province Error:", err);

    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        message: "Lỗi hệ thống không thể lấy danh sách đơn vị cấp 2",
      },
      { status: 500 },
    );
  }
}
