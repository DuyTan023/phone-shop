import type { spec_groups } from "@/app/generated/prisma/client";
import { specGroupService } from "@/lib/services/catalogs/spec_group.service";
import type { ApiResponse } from "@/lib/types/public/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const result = await specGroupService.getSpecGroup();
    return NextResponse.json<ApiResponse<spec_groups[]>>({
      success: true,
      message: "Lấy danh sách nhóm thông số thành công",
      data: result,
    });
  } catch (err) {
    console.error("GET API Spec Group Error:", err); // Luôn ghi log lỗi hệ thống ra console server để tiện tracking
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        message: "Lỗi hệ thống không thể lấy danh sách nhóm thông số",
      },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body.name !== "string") {
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
    const { name } = body;
    const formatValue = name.trim().replace(/\s+/g, " ");

    if (!formatValue) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "Giá trị không được bỏ trống",
        },
        { status: 400 },
      );
    }
    const newSpecGroup = await specGroupService.createSpecGroup(formatValue);
    return NextResponse.json<ApiResponse<spec_groups>>(
      {
        success: true,
        message: "Thêm mới nhóm thông số thành công",
        data: newSpecGroup,
      },
      { status: 201 },
    );
  } catch (err) {
    if (err instanceof Error && err.message === "NAME_EXISTS") {
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
    console.error("POST API Spec Group Error:", err); // Luôn ghi log lỗi hệ thống ra console server để tiện tracking
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        message: "Lỗi hệ thống không thể thêm mới nhóm thông số",
      },
      { status: 500 },
    );
  }
}
