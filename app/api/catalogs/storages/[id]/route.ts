import type { storages } from "@/app/generated/prisma/client";
import { storageService } from "@/lib/services/catalogs/storage_ram.service";
import type { ApiResponse } from "@/lib/types/public/types";
import { NextRequest, NextResponse } from "next/server";

type routeContext = { params: Promise<{ id: string }> };
export async function GET(req: NextRequest, { params }: routeContext) {
  const id = Number((await params).id);
  try {
    const storage = await storageService.getStorageById(id);
    return NextResponse.json<ApiResponse<storages>>({
      success: true,
      message: "Lấy ram thành công",
      data: storage,
    });
  } catch (err) {
    if (err instanceof Error && err.message === "NOT_FOUND") {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "Không tìm thấy storage",
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
    const { value } = await req.json();
    const formatValue = value.replace(/\s+/g, "");
    if (!formatValue) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "Giá trị không được bỏ trống",
        },
        { status: 400 },
      );
    }
    const ram = await storageService.updateStorage(numId, formatValue);
    return NextResponse.json<ApiResponse<storages>>(
      {
        success: true,
        message: "Cập nhật giá trị storage thành công",
        data: ram,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("Update storage API Error:", err); // Thêm dòng này để dễ debug terminal
    if (err instanceof Error && err.message === "NOT_FOUND") {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, message: "Không tìm thấy storage để cập nhật" },
        { status: 404 },
      );
    }
    if (err instanceof Error && err.message === "VALUE_EXISTS") {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "Giá trị này đã tồn tại trong hệ thống",
        },
        { status: 409 },
      );
    }
    return NextResponse.json<ApiResponse<null>>(
      { success: false, message: "Lỗi server khi cập nhật storage" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest, { params }: routeContext) {
  const id = Number((await params).id);
  try {
    await storageService.deleteStorage(id);
    return NextResponse.json<ApiResponse<null>>(
      { success: true, message: "Xóa thành công" },
      { status: 200 },
    );
  } catch (err) {
    if (err instanceof Error && err.message === "NOT_FOUND") {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "Không tìm thấy storage để xóa",
        },
        { status: 404 },
      );
    } else if (err instanceof Error && err.message === "STORAGE_HAS_PRODUCTS") {
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
