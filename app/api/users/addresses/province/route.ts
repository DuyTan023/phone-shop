import { provinceService } from "@/lib/services/addresses/province.service";
import { NextResponse } from "next/server";

import type { provinces } from "@/app/generated/prisma/client";
import type { ApiResponse } from "@/lib/types/public/types";

export async function GET() {
  try {
    const result = await provinceService.getProvinces();

    return NextResponse.json<ApiResponse<provinces[]>>({
      success: true,
      message: "Lấy danh sách tỉnh/thành thành công",
      data: result,
    });
  } catch (err) {
    console.error("GET API provinces Error:", err);

    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        message: "Lỗi hệ thống không thể lấy danh sách tỉnh/thành",
      },
      { status: 500 },
    );
  }
}
