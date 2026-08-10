// app/api/product_manager/product_images/grouped-by-color/route.ts Lấy danh sách hình ảnh phân nhóm theo màu sắc cho Admin UI.

import { productImageService } from "@/lib/services/products/product_image.service";
import type { ApiResponse } from "@/lib/types/public/types";
import { NextRequest, NextResponse } from "next/server";

// GET /api/product_manager/product_images/grouped-by-color?productId=1
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productIdStr = searchParams.get("productId");

    if (!productIdStr) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "productId không được bỏ trống",
        },
        { status: 400 },
      );
    }

    const data = await productImageService.getImagesGroupedByColor(
      Number(productIdStr),
    );

    return NextResponse.json<ApiResponse<typeof data>>({
      success: true,
      message: "Lấy danh sách hình ảnh theo màu sắc thành công",
      data,
    });
  } catch (err) {
    console.error("GET API product_images/grouped-by-color Error:", err);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        message: "Lỗi hệ thống không thể lấy hình ảnh theo màu",
      },
      { status: 500 },
    );
  }
}
