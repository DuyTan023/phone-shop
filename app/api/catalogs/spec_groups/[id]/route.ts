import type { spec_groups } from "@/app/generated/prisma/client";
import { specGroupService } from "@/lib/services/catalogs/spec_group.service";
import type { ApiResponse } from "@/lib/types/public/types";
import { NextRequest, NextResponse } from "next/server";

type routeContext = { params: Promise<{ id: string }> };
export async function GET(req: NextRequest, { params }: routeContext) {
  const id = Number((await params).id);
  try {
    const spec_group = await specGroupService.getSpecGroupById(id);
    return NextResponse.json<ApiResponse<spec_groups>>({
      success: true,
      message: "Lấy nhóm thông số thành công",
      data: spec_group,
    });
  } catch (err) {
    if (err instanceof Error && err.message === "NOT_FOUND") {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "Không tìm thấy nhóm thông số",
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
    const { name } = await req.json();
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
    const spec_groups = await specGroupService.updateSpecGroup(
      numId,
      formatValue,
    );
    return NextResponse.json<ApiResponse<spec_groups>>(
      {
        success: true,
        message: "Cập nhật giá trị ram thành công",
        data: spec_groups,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("Update Spec Group API Error:", err); // Thêm dòng này để dễ debug terminal
    if (err instanceof Error && err.message === "NOT_FOUND") {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, message: "Không tìm thấy nhóm thông số để cập nhật" },
        { status: 404 },
      );
    }
    if (err instanceof Error && err.message === "NAME_EXISTS") {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "Giá trị này đã tồn tại trong hệ thống",
        },
        { status: 409 },
      );
    }
    return NextResponse.json<ApiResponse<null>>(
      { success: false, message: "Lỗi server khi cập nhật nhóm thông số" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest, { params }: routeContext) {
  const id = Number((await params).id);
  try {
    await specGroupService.deleteSpecGroup(id);
    return NextResponse.json<ApiResponse<null>>(
      { success: true, message: "Xóa thành công" },
      { status: 200 },
    );
  } catch (err) {
    if (err instanceof Error && err.message === "NOT_FOUND") {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "Không tìm thấy nhóm thông số để xóa",
        },
        { status: 404 },
      );
    } else if (
      err instanceof Error &&
      err.message === "SPEC_GROUP_HAS_PRODUCTS"
    ) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "Không thể xóa vì đang được sử dụng",
        },
        { status: 409 },
      );
    } else {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, message: "Lỗi server" },
        { status: 500 },
      );
    }
  }
}
