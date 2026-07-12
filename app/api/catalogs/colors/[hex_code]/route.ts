import type { colors } from "@/app/generated/prisma/client";
import { colorService } from "@/lib/services/catalogs/color.service";
import type { ApiResponse } from "@/lib/types/public/types";
import { NextRequest, NextResponse } from "next/server";

type routeContext = { params: Promise<{ hex_code: string }> };
export async function GET(req: NextRequest, { params }: routeContext) {
  const { hex_code } = await params;
  try {
    const color = await colorService.getColorByHexCode(hex_code);
    return NextResponse.json<ApiResponse<colors>>(
      { success: true, message: "Lấy drand thành công", data: color },
      { status: 200 },
    );
  } catch (err) {
    if (err instanceof Error && err.message === "NOT_FOUND") {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "Không tìm thấy màu",
        },
        { status: 404 },
      );
    }
    return NextResponse.json<ApiResponse<null>>(
      { success: false, message: "Lỗi server" },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest, { params }: routeContext) {
  const { hex_code } = await params;
  try {
    const { name, hex_code } = await req.json();
    const color = await colorService.updateColor(name, hex_code);
    return NextResponse.json<ApiResponse<typeof color>>(
      { success: true, message: "Cập nhật banrd thành công", data: color },
      { status: 200 },
    );
  } catch (err) {
    if (err instanceof Error && err.message === "NOT_FOUND") {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "Không tìm thấy màu để cập nhật",
        },
        { status: 404 },
      );
    }
    return NextResponse.json<ApiResponse<null>>(
      { success: false, message: "Lỗi server" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest, { params }: routeContext) {
  const { hex_code } = await params;
  try {
    await colorService.deleteColor(hex_code);
    return NextResponse.json<ApiResponse<null>>(
      { success: true, message: "Xóa thành công" },
      { status: 200 },
    );
  } catch (err) {
    if (err instanceof Error && err.message === "NOT_FOUND") {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "Không tìm thấy màu để xóa",
        },
        { status: 404 },
      );
    } else if (err instanceof Error && err.message === "COLOR_HAS_PRODUCTS") {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "Không thể xóa vì đang được sử dụng",
        },
        { status: 400 },
      );
    } else {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, message: "Lỗi server" },
        { status: 500 },
      );
    }
  }
}
