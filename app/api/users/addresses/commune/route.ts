import { communeService } from "@/lib/services/addresses/commune.service";
import { NextResponse } from "next/server";

import type { communes } from "@/app/generated/prisma/client";
import type { ApiResponse } from "@/lib/types/public/types";

export async function GET() {
  try {
    const result = await communeService.getCommunesByProvinceId(0);

    return NextResponse.json<ApiResponse<communes[]>>({
      success: true,
      message: "Lấy danh sách đơn vị cấp 2 thành công",
      data: result,
    });
  } catch (err) {
    console.error("GET API communes Error:", err);

    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        message: "Lỗi hệ thống không thể lấy danh sách đơn vị cấp 2",
      },
      { status: 500 },
    );
  }
}
