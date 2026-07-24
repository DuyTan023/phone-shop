import type { spec_keys } from "@/app/generated/prisma/client";
import { specKeyService } from "@/lib/services/catalogs/spec_key.service";
import type { ApiResponse } from "@/lib/types/public/types";
import { NextResponse, type NextRequest } from "next/server";

type routeContext = { params: Promise<{ id: number }> };

export async function GET(req: NextRequest, { params }: routeContext) {
  const { id } = await params;
  const numId = Number(id);

  try {
    const spec_key = await specKeyService.getSpecKeyById(numId);
    return NextResponse.json<ApiResponse<spec_keys>>(
      { success: true, message: "Lấy thông số thành công", data: spec_key },
      { status: 200 },
    );
  } catch (err) {
    if (err instanceof Error && err.message === "NOT_FOUND") {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "Không tìm thấy thuộc tính",
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

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } },
) {
  // Bọc await đàng hoàng hỗ trợ cả Next.js 14 & 15
  const resolvedParams = await params;
  const numId = Number(resolvedParams.id);

  // 1. Validate ID trên URL
  if (isNaN(numId) || numId <= 0) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, message: "ID thông số không hợp lệ" },
      { status: 400 },
    );
  }

  try {
    const body = await req.json();
    const { name, group_id } = body;

    // 2. Validate Body: Tên thông số
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, message: "Tên thông số không được để trống" },
        { status: 400 },
      );
    }

    // 2. Validate Body: group_id (Tránh bẫy `!group_idNum` và `NaN`)
    const group_idNum = Number(group_id);
    if (group_id === undefined || group_id === null || isNaN(group_idNum)) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, message: "Nhóm thông số không hợp lệ" },
        { status: 400 },
      );
    }

    // 3. Gọi Service
    const spec_key = await specKeyService.updateSpecKey(
      numId,
      name.trim(),
      group_idNum,
    );

    return NextResponse.json<ApiResponse<typeof spec_key>>(
      {
        success: true,
        message: "Cập nhật thông số thành công",
        data: spec_key,
      },
      { status: 200 },
    );
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === "SPEC_KEY_EXISTS") {
        return NextResponse.json<ApiResponse<null>>(
          { success: false, message: "Thông số đã tồn tại trong nhóm này" },
          { status: 409 },
        );
      }

      if (err.message === "NOT_FOUND") {
        return NextResponse.json<ApiResponse<null>>(
          {
            success: false,
            message: "Không tìm thấy thông số hoặc nhóm thông số",
          },
          { status: 404 },
        );
      }
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
  // 1. Validate ID truyền vào
  if (isNaN(numId) || numId <= 0) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, message: "ID thông số không hợp lệ" },
      { status: 400 },
    );
  }

  try {
    // 2. Thực thi xóa
    await specKeyService.deleteSpecKey(numId);

    return NextResponse.json<ApiResponse<null>>(
      { success: true, message: "Xóa thông số thành công" },
      { status: 200 },
    );
  } catch (err) {
    if (err instanceof Error && err.message === "NOT_FOUND") {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "Không tìm thấy thông số để xóa",
        },
        { status: 404 },
      );
    } else if (
      err instanceof Error &&
      err.message === "SPEC_KEYS_HAS_PRODUCTS"
    ) {
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
