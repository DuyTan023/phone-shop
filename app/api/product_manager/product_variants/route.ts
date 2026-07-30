import type { product_variants } from "@/app/generated/prisma/client";
import { type ProductVariant } from "@/lib/repositories/product/products_variant.repository";
import { productVariantService } from "@/lib/services/products/product_variant.service";
import type { ApiResponse, PaginationResult } from "@/lib/types/public/types";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);
    const keyword = searchParams.get("keyword") || undefined;
    const product_variant = await productVariantService.GetProductVariant({
      page,
      limit,
      keyword,
    });
    return NextResponse.json<ApiResponse<PaginationResult<ProductVariant>>>({
      success: true,
      message: "Lấy danh sách biến thể thành công",
      data: product_variant,
    });
  } catch (err) {
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        message: "Lỗi server",
      },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const product = await productVariantService.createProductVariant(body);
    return NextResponse.json<ApiResponse<product_variants>>(
      {
        success: true,
        message: "Tạo biến thể sản phẩm thành công",
        data: product,
      },
      { status: 201 },
    );
  } catch (err) {
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
