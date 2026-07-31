import type { units } from "@/app/generated/prisma/client";
import { unitService } from "@/lib/services/catalogs/unit.service";
import { ApiResponse } from "@/lib/types/public/types";
import { NextRequest, NextResponse } from "next/server";

type routeContext = { params: Promise<{ id: string }> };
export async function GET(req: NextRequest, { params }: routeContext) {
  const { id } = await params;
  const numId = Number(id);
  try {
    const unit = await unitService.getUnitById(numId);
    return NextResponse.json<ApiResponse<units>>(
      { success: true, message: "Lấy đơn vị thành công", data: unit },
      { status: 200 },
    );
  } catch (err) {
    if (err instanceof Error && err.message === "NOT_FOUND") {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "Không tìm thấy đơn vị",
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
  const { id } = await params;
  const numId = Number(id);
  try {
    const body = await req.json();
    const unit = await unitService.updateUnit(numId, body.name, body.symbol);
    return NextResponse.json<ApiResponse<units>>(
      { success: true, message: "Cập nhật đơn vị thành công", data: unit },
      { status: 200 },
    );
  } catch (err) {
    if (err instanceof Error && err.message === "NOT_FOUND") {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "Không tìm thấy đơn vị để cập nhật",
        },
        { status: 404 },
      );
    }
    if (err instanceof Error && err.message === "NAME_EXISTS") {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "Tên đơn vị đã tồn tại",
        },
        { status: 409 },
      );
    }
    if (err instanceof Error && err.message === "SYMBOL_EXISTS") {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "Ký hiệu đơn vị đã tồn tại",
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

export async function DELETE(req: NextRequest, { params }: routeContext) {
  const { id } = await params;
  const numId = Number(id);
  try {
    await unitService.deleteUnit(numId);
    return NextResponse.json<ApiResponse<null>>(
      { success: true, message: "Xóa thành công" },
      { status: 200 },
    );
  } catch (err) {
    if (err instanceof Error && err.message === "NOT_FOUND") {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "Không tìm thấy đơn vị để xóa",
        },
        { status: 404 },
      );
    } else if (err instanceof Error && err.message === "IN_USE") {
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
