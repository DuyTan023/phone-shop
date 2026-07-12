import type { colors } from "@/app/generated/prisma/client";
import { colorService } from "@/lib/services/catalogs/color.service";
import type { ApiResponse, PaginationResult } from "@/lib/types/public/types";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);
    const brands = await colorService.getColor({ page, limit });
    return NextResponse.json<ApiResponse<PaginationResult<colors>>>({
      success: true,
      message: "Lấy danh sách màu thành công",
      data: brands,
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
    const { name, hex_code } = await req.json();
    const brand = await colorService.createColor(name, hex_code);

    return NextResponse.json<ApiResponse<typeof brand>>(
      { success: true, message: "Tạo màu thành công", data: brand },
      { status: 201 },
    );
  } catch (err) {
    if (err instanceof Error && err.message === "HEX_CODE_EXISTS") {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "Màu đã tồn tại",
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
