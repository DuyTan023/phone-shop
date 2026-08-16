// //app/api/product_manager/product_images/route.ts: Xử lý Lấy danh sách ảnh, Tạo 1 ảnh mới, hoặc Xóa nhiều ảnh

import type { product_images } from "@/app/generated/prisma/client";
import {
  productImageService,
  type CreateProductImageInput,
} from "@/lib/services/products/product_image.service";
import type { ApiResponse } from "@/lib/types/public/types";
import { NextRequest, NextResponse } from "next/server";

// GET /api/product_manager/product_images?product_id=1&type=featured|general|variant
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productIdStr = searchParams.get("product_id");
    const variantIdStr = searchParams.get("variant_id");
    const type = searchParams.get("type"); // 'featured' | 'general' | 'variant'

    if (!productIdStr && !variantIdStr) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "Cần truyền product_id hoặc variant_id để truy vấn",
        },
        { status: 400 },
      );
    }

    // 1. TRƯỜNG HỢP LẤY ẢNH ĐẠI DIỆN (FEATURED IMAGE)
    if (productIdStr && type === "featured") {
      const productId = Number(productIdStr);
      const featuredImage =
        await productImageService.getFeaturedImage(productId);

      return NextResponse.json<ApiResponse<product_images | null>>({
        success: true,
        message: "Lấy ảnh đại diện sản phẩm thành công",
        data: featuredImage,
      });
    }

    // 2. TRƯỜNG HỢP LẤY DANH SÁCH ÁNH (GENERAL HOẶC VARIANT)
    let data: product_images[] = [];

    if (variantIdStr) {
      data = await productImageService.getImagesByVariantId(
        Number(variantIdStr),
      );
    } else if (productIdStr) {
      const productId = Number(productIdStr);
      if (type === "general") {
        data = await productImageService.getGeneralImages(productId);
      } else {
        // Mặc định nếu không chỉ định type thì lấy ảnh chung
        data = await productImageService.getGeneralImages(productId);
      }
    }

    return NextResponse.json<ApiResponse<product_images[]>>({
      success: true,
      message: "Lấy danh sách hình ảnh thành công",
      data,
    });
  } catch (err) {
    console.error("GET API product_images Error:", err);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        message: "Lỗi hệ thống không thể lấy danh sách hình ảnh",
      },
      { status: 500 },
    );
  }
}

// POST /api/product_manager/product_images
export async function POST(req: NextRequest) {
  try {
    const body = (await req
      .json()
      .catch(() => null)) as CreateProductImageInput;

    if (!body || !body.product_id || !body.image_url) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "product_id và image_url không được bỏ trống",
        },
        { status: 400 },
      );
    }

    const newImage = await productImageService.createProductImage(body);

    return NextResponse.json<ApiResponse<product_images>>(
      {
        success: true,
        message: "Thêm mới hình ảnh thành công",
        data: newImage,
      },
      { status: 201 },
    );
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === "PRODUCT_NOT_FOUND") {
        return NextResponse.json<ApiResponse<null>>(
          { success: false, message: "Sản phẩm không tồn tại" },
          { status: 404 },
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

    console.error("POST API product_images Error:", err);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        message: "Lỗi hệ thống không thể thêm mới hình ảnh",
      },
      { status: 500 },
    );
  }
}

// DELETE /api/product_manager/product_images (Xóa nhiều ảnh cùng lúc)
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || !Array.isArray(body.imageIds) || body.imageIds.length === 0) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "Danh sách imageIds không được bỏ trống",
        },
        { status: 400 },
      );
    }

    const result = await productImageService.deleteManyProductImages(
      body.imageIds,
    );

    return NextResponse.json<ApiResponse<{ count: number }>>({
      success: true,
      message: `Đã xóa thành công ${result.count} hình ảnh`,
      data: result,
    });
  } catch (err) {
    if (err instanceof Error && err.message === "EMPTY_IMAGE_IDS") {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, message: "Danh sách ảnh cần xóa rỗng" },
        { status: 400 },
      );
    }

    console.error("DELETE Many API product_images Error:", err);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        message: "Lỗi hệ thống không thể xóa danh sách hình ảnh",
      },
      { status: 500 },
    );
  }
}
