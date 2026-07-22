import { ramService } from "@/lib/services/catalogs/storage_ram.service";
import { NextRequest, NextResponse } from "next/server";

import type { rams } from "@/app/generated/prisma/client";
import type { ApiResponse } from "@/lib/types/public/types";

export async function GET() {
  try {
    const result = await ramService.getRam();
    return NextResponse.json<ApiResponse<rams[]>>({
      success: true,
      message: "Lấy danh sách ram thành công",
      data: result,
    });
  } catch (err) {
    console.error("GET API rams Error:", err); // Luôn ghi log lỗi hệ thống ra console server để tiện tracking
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        message: "Lỗi hệ thống không thể lấy danh sách ram",
      },
      { status: 500 },
    );
  }
}
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || !body.value) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "Giá trị không được bỏ trống",
        },
        {
          status: 400,
        },
      );
    }
    const { value } = body;
    const formatValue = value.replace(/\s+/g, "");
    const newRam = await ramService.createRam(formatValue);
    if (!formatValue) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "Giá trị không được bỏ trống",
        },
        { status: 400 },
      );
    }
    return NextResponse.json<ApiResponse<rams>>(
      {
        success: true,
        message: "Thêm mới ram thành công",
        data: newRam,
      },
      { status: 201 },
    );
  } catch (err) {
    if (err instanceof Error && err.message === "VALUE_EXISTS") {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "Giá trị này đã tồn tại trong hệ thống",
        },
        {
          status: 409,
        },
      );
    }
    console.error("POST API rams Error:", err); // Luôn ghi log lỗi hệ thống ra console server để tiện tracking
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        message: "Lỗi hệ thống không thể thêm mới ram",
      },
      { status: 500 },
    );
  }
}
