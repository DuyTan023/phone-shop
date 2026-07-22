import { storageService } from "@/lib/services/catalogs/storage_ram.service";
import { NextRequest, NextResponse } from "next/server";

import type { storages } from "@/app/generated/prisma/client";
import type { ApiResponse } from "@/lib/types/public/types";

export async function GET() {
  try {
    const result = await storageService.getStorage();
    return NextResponse.json<ApiResponse<storages[]>>({
      success: true,
      message: "Lấy danh sách storage thành công",
      data: result,
    });
  } catch (err) {
    console.error("GET API rams Error:", err); // Luôn ghi log lỗi hệ thống ra console server để tiện tracking
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        message: "Lỗi hệ thống không thể lấy danh sách storage",
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
    const newStorage = await storageService.createStorage(formatValue);
    if (!formatValue) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "Giá trị không được bỏ trống",
        },
        { status: 400 },
      );
    }
    return NextResponse.json<ApiResponse<storages>>(
      {
        success: true,
        message: "Thêm mới storage thành công",
        data: newStorage,
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
    console.error("POST API storage Error:", err); // Luôn ghi log lỗi hệ thống ra console server để tiện tracking
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        message: "Lỗi hệ thống không thể thêm mới storage",
      },
      { status: 500 },
    );
  }
}
