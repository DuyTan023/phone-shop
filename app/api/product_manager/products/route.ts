import type { products } from "@/app/generated/prisma/client";
import type { ProductWithSerie } from "@/lib/repositories/product/product.repository";
import { productService } from "@/lib/services/products/product.service";
import type { ApiResponse, PaginationResult } from "@/lib/types/public/types";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);
    const keyword = searchParams.get("keyword") || undefined;
    const products = await productService.GetProduct({ page, limit, keyword });
    return NextResponse.json<ApiResponse<PaginationResult<ProductWithSerie>>>({
      success: true,
      message: "Lấy danh sách serie thành công",
      data: products,
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
    const product = await productService.createProduct(body);
    return NextResponse.json<ApiResponse<products>>(
      { success: true, message: "Tạo sản phẩm thành công", data: product },
      { status: 201 },
    );
  } catch (err) {
    if (err instanceof Error && err.message === "PRODUCT_EXISTS") {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "Sản phẩm đã tồn tại",
        },
        { status: 409 },
      );
    }
    if (err instanceof Error && err.message === "SLUG_EXISTS") {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "Slug đã tồn tại",
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
