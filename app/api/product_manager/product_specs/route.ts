import type { product_specs } from "@/app/generated/prisma/client";
import type { Product_Spec } from "@/lib/repositories/product/product_spec.repository";
import { productSpecService } from "@/lib/services/products/product.spec.service";
import type { ApiResponse, PaginationResult } from "@/lib/types/public/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);
    const keyword = searchParams.get("keyword") || undefined;
    const product_specs = await productSpecService.GetProductSpec({
      page,
      limit,
      keyword,
    });
    return NextResponse.json<ApiResponse<PaginationResult<Product_Spec>>>({
      success: true,
      message: "Lấy danh sách giá trị thông số sản phẩm thành công",
      data: product_specs,
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
    const product_spec = await productSpecService.createProductSpec(body);
    return NextResponse.json<ApiResponse<product_specs>>(
      {
        success: true,
        message: "Tạo giá trị thông số sản phẩm thành công",
        data: product_spec,
      },
      { status: 201 },
    );
  } catch (err) {
    if (err instanceof Error && err.message === "PRODUCT_SPEC_EXISTS") {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "Giá trị thông số đã tồn tại ",
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
