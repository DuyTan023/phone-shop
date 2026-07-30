import type { product_variants } from "@/app/generated/prisma/client";
import type { ProductVariant } from "@/lib/repositories/product/products_variant.repository";
import { productVariantService } from "@/lib/services/products/product_variant.service";
import type { ApiResponse } from "@/lib/types/public/types";
import { NextResponse, type NextRequest } from "next/server";

type routeContext = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: routeContext) {
  const { id } = await params;
  const numId = Number(id);
  try {
    const products = await productVariantService.getProductVariantById(numId);
    return NextResponse.json<ApiResponse<ProductVariant>>(
      {
        success: true,
        message: "Lấy biến thể sản phẩm thành công",
        data: products,
      },
      { status: 200 },
    );
  } catch (err) {
    if (err instanceof Error && err.message === "NOT_FOUND") {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "Không tìm thấy biến thể sản phẩm",
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
  const { id } = await params;
  const numId = Number(id);
  try {
    const body = await req.json();
    const serie = await productVariantService.updateProductVariant(numId, body);
    return NextResponse.json<ApiResponse<product_variants>>(
      {
        success: true,
        message: "Cập nhật biến thể sản phẩm thành công",
        data: serie,
      },
      { status: 200 },
    );
  } catch (err) {
    if (err instanceof Error && err.message === "NOT_FOUND") {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "Không tìm thấy biến thể sản phẩm để cập nhật",
        },
        { status: 404 },
      );
    }
    if (err instanceof Error && err.message === "INVALID_PRICE") {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "Giá bán không hợp lệ",
        },
        { status: 409 },
      );
    }
    if (err instanceof Error && err.message === "PRODUCT_VARIANT_EXISTS") {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "Biến thể sản phẩm đã tồn tại",
        },
        { status: 409 },
      );
    }
    if (err instanceof Error && err.message === "INVALID_STOCK") {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "Giá trị tồn kho không hợp lệ",
        },
        { status: 409 },
      );
    }

    if (err instanceof Error && err.message === "RELATED_ENTITY_NOT_FOUND") {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "Không tìm thấy các giá trị phụ thuộc",
        },
        { status: 400 },
      );
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
  try {
    await productVariantService.deleteProduct(numId);
    return NextResponse.json<ApiResponse<null>>(
      { success: true, message: "Xóa thành công" },
      { status: 200 },
    );
  } catch (err) {
    if (err instanceof Error && err.message === "NOT_FOUND") {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "Không tìm thấy biến thể sản phẩm để xóa",
        },
        { status: 404 },
      );
    } else if (err instanceof Error && err.message === "IN_USE") {
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
