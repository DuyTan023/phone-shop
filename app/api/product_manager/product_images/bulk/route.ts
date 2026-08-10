// app/api/product_manager/product_images/bulk/route.ts Xử lý Upload nhiều ảnh cùng lúc (Bulk Upload).

import {
  productImageService,
  type CreateManyProductImagesInput,
} from "@/lib/services/products/product_image.service";
import type { ApiResponse } from "@/lib/types/public/types";
import { NextRequest, NextResponse } from "next/server";

// POST /api/product_manager/product_images/bulk
export async function POST(req: NextRequest) {
  try {
    const body = (await req
      .json()
      .catch(() => null)) as CreateManyProductImagesInput;

    if (
      !body ||
      !body.product_id ||
      !body.image_urls ||
      body.image_urls.length === 0
    ) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "product_id và danh sách image_urls không được bỏ trống",
        },
        { status: 400 },
      );
    }

    const result = await productImageService.createManyProductImages(body);

    return NextResponse.json<ApiResponse<{ count: number }>>(
      {
        success: true,
        message: `Thêm mới ${result.count} hình ảnh thành công`,
        data: result,
      },
      { status: 201 },
    );
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === "EMPTY_IMAGE_LIST") {
        return NextResponse.json<ApiResponse<null>>(
          {
            success: false,
            message: "Danh sách đường dẫn ảnh không được rỗng",
          },
          { status: 400 },
        );
      }
      if (err.message === "VARIANT_NOT_FOUND") {
        return NextResponse.json<ApiResponse<null>>(
          { success: false, message: "Biến thể hoặc Màu sắc không tồn tại" },
          { status: 404 },
        );
      }
      if (err.message === "RELATED_ENTITY_NOT_FOUND") {
        return NextResponse.json<ApiResponse<null>>(
          { success: false, message: "Dữ liệu liên quan không hợp lệ" },
          { status: 400 },
        );
      }
    }

    console.error("POST API product_images/bulk Error:", err);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        message: "Lỗi hệ thống không thể thêm mới danh sách hình ảnh",
      },
      { status: 500 },
    );
  }
}
