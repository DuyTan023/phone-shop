import type { spec_keys } from "@/app/generated/prisma/client";
import { specKeyService } from "@/lib/services/catalogs/spec_key.service";
import type { ApiResponse, PaginationResult } from "@/lib/types/public/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);
    const keyword = searchParams.get("keyword") || undefined;
    const spec_keys = await specKeyService.GetSpecKey({ page, limit, keyword });
    return NextResponse.json<ApiResponse<PaginationResult<spec_keys>>>({
      success: true,
      message: "Lấy danh sách danh sách thông số thành công",
      data: spec_keys,
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
    const { name, group_id } = await req.json();
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, message: "Tên thông số không được để trống" },
        { status: 400 },
      );
    }

    if (!group_id || typeof group_id !== "number") {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, message: "Nhóm thông số không hợp lệ" },
        { status: 400 },
      );
    }
    const spec_key = await specKeyService.creatSpecKey(name, group_id);

    return NextResponse.json<ApiResponse<typeof spec_key>>(
      { success: true, message: "Tạo thông số thành công", data: spec_key },
      { status: 201 },
    );
  } catch (err) {
    if (err instanceof Error && err.message === "SPEC_KEY_EXISTS") {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "Thông số đã tồn tại",
        },
        { status: 409 },
      );
    }

    if (err instanceof Error && err.message === "NOT_FOUND") {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "Nhóm thông số không tồn tại",
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
