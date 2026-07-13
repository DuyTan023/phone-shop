import type { colors } from "@/app/generated/prisma/client";
import { colorService } from "@/lib/services/catalogs/color.service";
import type { ApiResponse, PaginationResult } from "@/lib/types/public/types";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Đảm bảo page và limit luôn là số dương hợp lệ
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const limit = Math.max(
      1,
      Math.min(100, Number(searchParams.get("limit") || 10)),
    ); // Giới hạn max 100 item để tránh bị ddos kéo sập db

    // Đổi tên biến từ 'colors' thành 'result' để tránh xung đột với Type 'colors'
    const result = await colorService.getColor({ page, limit });

    return NextResponse.json<ApiResponse<PaginationResult<colors>>>({
      success: true,
      message: "Lấy danh sách màu thành công",
      data: result,
    });
  } catch (err) {
    console.error("GET API Colors Error:", err); // Luôn ghi log lỗi hệ thống ra console server để tiện tracking
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        message: "Lỗi hệ thống không thể lấy danh sách màu",
      },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || !body.name || !body.hex_code) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "Tên màu và mã HEX code không được để trống",
        },
        { status: 400 }, // Trả về 400 Bad Request khi Client gửi thiếu dữ liệu
      );
    }

    const { name, hex_code } = body;

    // Chuẩn hóa mã HEX (Ví dụ client gửi '#ffffff' hoặc 'ffffff' -> đồng bộ thành chữ hoa có dấu # hoặc không tùy bạn quy ước)
    const formattedHex = hex_code.trim().toUpperCase();
    const formattedName = name.trim();

    // Sửa tên biến từ 'brand' thành 'newColor' cho đúng ngữ cảnh
    const newColor = await colorService.createColor(
      formattedName,
      formattedHex,
    );

    return NextResponse.json<ApiResponse<colors>>(
      {
        success: true,
        message: "Tạo màu thành công",
        data: newColor,
      },
      { status: 201 },
    );
  } catch (err) {
    if (err instanceof Error && err.message === "HEX_CODE_EXISTS") {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "Mã màu HEX này đã tồn tại trong hệ thống",
        },
        { status: 409 }, // 409 Conflict
      );
    }

    console.error("POST API Colors Error:", err);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, message: "Lỗi hệ thống không thể tạo màu" },
      { status: 500 },
    );
  }
}
