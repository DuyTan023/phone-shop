// app/api/product_manager/product_images/color-options/route.ts Lấy danh sách màu hỗ trợ cho Dropdown Select khi Upload.

import { productImageService } from "@/lib/services/products/product_image.service";
import type { ApiResponse } from "@/lib/types/public/types";
import { NextRequest, NextResponse } from "next/server";

// GET /api/product_manager/product_images/color-options?productId=1
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productIdStr = searchParams.get("product_id");

    if (!productIdStr) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "productId không được bỏ trống",
        },
        { status: 400 },
      );
    }

    const data = await productImageService.getColorOptionsByProductId(
      Number(productIdStr),
    );

    return NextResponse.json<ApiResponse<typeof data>>({
      success: true,
      message: "Lấy danh sách tùy chọn màu thành công",
      data,
    });
  } catch (err) {
    console.error("GET API product_images/color-options Error:", err);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        message: "Lỗi hệ thống không thể lấy danh sách màu sắc",
      },
      { status: 500 },
    );
  }
}
