import type { product_images } from "@/app/generated/prisma/client";
import { productImageService } from "@/lib/services/products/product_image.service";
import type { ApiResponse } from "@/lib/types/public/types";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PUT: Cập nhật thông tin ảnh hoặc Đặt làm ảnh Đại diện
 * Body: { is_featured?: boolean, image_url?: string, variant_id?: number | null, action?: "set_featured" }
 */
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id: idStr } = await params;
    const id = Number(idStr);

    if (isNaN(id)) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, message: "ID ảnh không hợp lệ" },
        { status: 400 },
      );
    }

    const body = await req.json();

    // Trường hợp 1: Set ảnh làm Thumbnail chính (is_featured = true)
    if (body.action === "set_featured" || body.is_featured === true) {
      if (!body.product_id) {
        return NextResponse.json<ApiResponse<null>>(
          { success: false, message: "Thiếu product_id khi đặt ảnh đại diện" },
          { status: 400 },
        );
      }

      await productImageService.setFeaturedImage(body.product_id, id);

      return NextResponse.json<ApiResponse<null>>({
        success: true,
        message: "Cập nhật ảnh đại diện thành công",
      });
    }

    // Trường hợp 2: Update thông tin ảnh bình thường
    const updatedImage = await productImageService.updateProductImage(id, {
      image_url: body.image_url,
      is_featured: body.is_featured,
      variant_id: body.variant_id,
    });

    return NextResponse.json<ApiResponse<product_images>>({
      success: true,
      message: "Cập nhật thông tin hình ảnh thành công",
      data: updatedImage,
    });
  } catch (err) {
    if (err instanceof Error && err.message === "NOT_FOUND") {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, message: "Không tìm thấy hình ảnh" },
        { status: 404 },
      );
    }
    if (err instanceof Error && err.message === "RELATED_ENTITY_NOT_FOUND") {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, message: "Không tìm thấy thông tin phụ thuộc" },
        { status: 400 },
      );
    }
    return NextResponse.json<ApiResponse<null>>(
      { success: false, message: "Lỗi server" },
      { status: 500 },
    );
  }
}

/**
 * DELETE: Xóa 1 tấm ảnh theo ID
 */
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id: idStr } = await params;
    const id = Number(idStr);

    if (isNaN(id)) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, message: "ID ảnh không hợp lệ" },
        { status: 400 },
      );
    }

    const deletedImage = await productImageService.deleteProductImage(id);

    return NextResponse.json<ApiResponse<product_images>>({
      success: true,
      message: "Xóa hình ảnh thành công",
      data: deletedImage,
    });
  } catch (err) {
    if (err instanceof Error && err.message === "NOT_FOUND") {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, message: "Không tìm thấy hình ảnh cần xóa" },
        { status: 404 },
      );
    }
    if (err instanceof Error && err.message === "IN_USE") {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "Hình ảnh đang được sử dụng, không thể xóa",
        },
        { status: 409 },
      );
    }
    return NextResponse.json<ApiResponse<null>>(
      { success: false, message: "Lỗi server" },
      { status: 500 },
    );
  }
}
