import type { brands } from "@/app/generated/prisma/client";
import { brandService } from "@/lib/services/catalogs/brand.service";
import type { PaginationResult } from "@/lib/types/public/types";
import { NextResponse, type NextRequest } from "next/server";
import { ApiResponse } from "./../../../../lib/types/public/types";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);
    const brands = await brandService.getBrand({ page, limit });
    return NextResponse.json<ApiResponse<PaginationResult<brands>>>({
      success: true,
      message: "Lấy danh sách brand thành công",
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
    const body = await req.json();
    const brand = await brandService.createBrand(body);

    return NextResponse.json<ApiResponse<typeof brand>>(
      { success: true, message: "Tạo brand thành công", data: brand },
      { status: 201 },
    );
  } catch (err) {
    if (err instanceof Error && err.message === "SLUG_EXISTS") {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "Slug đã tồn tại",
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
