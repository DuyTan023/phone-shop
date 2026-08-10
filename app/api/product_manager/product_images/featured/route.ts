// app/api/product_manager/product_images/featured/route.ts
import { productImageService } from "@/lib/services/products/product_image.service";
import type { ApiResponse } from "@/lib/types/public/types";
import { NextRequest, NextResponse } from "next/server";

// PUT /api/product_manager/product_images/featured
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || !body.productId || !body.imageId) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "productId và imageId không được bỏ trống",
        },
        { status: 400 },
      );
    }

    await productImageService.setFeaturedImage(
      Number(body.productId),
      Number(body.imageId),
    );

    return NextResponse.json<ApiResponse<null>>({
      success: true,
      message: "Đặt ảnh làm ảnh đại diện chính thành công",
    });
  } catch (err) {
    if (err instanceof Error && err.message === "NOT_FOUND") {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "Hình ảnh không tồn tại hoặc không thuộc sản phẩm này",
        },
        { status: 404 },
      );
    }

    console.error("PUT API product_images/featured Error:", err);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        message: "Lỗi hệ thống không thể cập nhật ảnh đại diện",
      },
      { status: 500 },
    );
  }
}
