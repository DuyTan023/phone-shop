import { productImageService } from "@/lib/services/products/product_image.service";
import type { ApiResponse } from "@/lib/types/public/types";
import { NextRequest, NextResponse } from "next/server";

/**
 * DELETE: Xóa nhiều hình ảnh cùng lúc
 * Body: { ids: number[] }
 */
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();

    if (!Array.isArray(body.ids) || body.ids.length === 0) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, message: "Danh sách ID ảnh cần xóa không hợp lệ" },
        { status: 400 },
      );
    }

    const result = await productImageService.deleteManyProductImages(body.ids);

    return NextResponse.json<ApiResponse<{ count: number }>>({
      success: true,
      message: `Đã xóa thành công ${result.count} hình ảnh`,
      data: result,
    });
  } catch (err) {
    if (err instanceof Error && err.message === "EMPTY_IMAGE_IDS") {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, message: "Danh sách ID không được để trống" },
        { status: 400 },
      );
    }
    return NextResponse.json<ApiResponse<null>>(
      { success: false, message: "Lỗi server" },
      { status: 500 },
    );
  }
}
