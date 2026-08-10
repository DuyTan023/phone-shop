// app/api/product_manager/product_images/[id]/route.ts

import type { product_images } from "@/app/generated/prisma/client";
import {
  productImageService,
  type UpdateProductImageInput,
} from "@/lib/services/products/product_image.service";
import type { ApiResponse } from "@/lib/types/public/types";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PATCH /api/product_manager/product_images/[id]
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const imageId = Number(id);

    if (isNaN(imageId)) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, message: "ID hình ảnh không hợp lệ" },
        { status: 400 },
      );
    }

    const body = (await req
      .json()
      .catch(() => null)) as UpdateProductImageInput;

    if (!body) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, message: "Dữ liệu cập nhật không hợp lệ" },
        { status: 400 },
      );
    }

    const updatedImage = await productImageService.updateProductImage(
      imageId,
      body,
    );

    return NextResponse.json<ApiResponse<product_images>>({
      success: true,
      message: "Cập nhật hình ảnh thành công",
      data: updatedImage,
    });
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === "NOT_FOUND") {
        return NextResponse.json<ApiResponse<null>>(
          { success: false, message: "Không tìm thấy hình ảnh" },
          { status: 404 },
        );
      }
      if (err.message === "VARIANT_NOT_FOUND") {
        return NextResponse.json<ApiResponse<null>>(
          {
            success: false,
            message: "Biến thể hoặc Màu sắc chỉ định không tồn tại",
          },
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

    console.error("PATCH API product_images/[id] Error:", err);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        message: "Lỗi hệ thống không thể cập nhật hình ảnh",
      },
      { status: 500 },
    );
  }
}

// DELETE /api/product_manager/product_images/[id]
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const imageId = Number(id);

    if (isNaN(imageId)) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, message: "ID hình ảnh không hợp lệ" },
        { status: 400 },
      );
    }

    const deletedImage = await productImageService.deleteProductImage(imageId);

    return NextResponse.json<ApiResponse<product_images>>({
      success: true,
      message: "Xóa hình ảnh thành công",
      data: deletedImage,
    });
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === "NOT_FOUND") {
        return NextResponse.json<ApiResponse<null>>(
          { success: false, message: "Hình ảnh không tồn tại" },
          { status: 404 },
        );
      }
      if (err.message === "IN_USE") {
        return NextResponse.json<ApiResponse<null>>(
          {
            success: false,
            message: "Hình ảnh đang được sử dụng, không thể xóa",
          },
          { status: 409 },
        );
      }
    }

    console.error("DELETE API product_images/[id] Error:", err);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        message: "Lỗi hệ thống không thể xóa hình ảnh",
      },
      { status: 500 },
    );
  }
}
