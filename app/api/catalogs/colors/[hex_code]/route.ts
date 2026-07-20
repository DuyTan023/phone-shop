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
  // Lấy hex_code gốc từ URL để biết đang cập nhật cho bản ghi nào
  const { hex_code: urlHexCode } = await params;
  const currentHexCode = decodeURIComponent(urlHexCode);

  try {
    // Nhận đúng biến `hexCode` từ payload Client gửi lên
    const { name, hex_code, description } = await req.json();

    // Đảm bảo truyền đúng biến vào tầng Service xử lý
    // (Tùy thuộc service của bạn nhận code cũ hay code mới, thông thường bạn cần định danh bằng code cũ trên URL)
    const color = await colorService.updateColor(
      name,
      hex_code || currentHexCode,
      description,
    );

    return NextResponse.json<ApiResponse<typeof color>>(
      { success: true, message: "Cập nhật màu sắc thành công", data: color },
      { status: 200 },
    );
  } catch (err) {
    console.error("Update color API Error:", err); // Thêm dòng này để dễ debug terminal
    if (err instanceof Error && err.message === "NOT_FOUND") {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, message: "Không tìm thấy màu để cập nhật" },
        { status: 404 },
      );
    }
    return NextResponse.json<ApiResponse<null>>(
      { success: false, message: "Lỗi server khi cập nhật màu" },
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
