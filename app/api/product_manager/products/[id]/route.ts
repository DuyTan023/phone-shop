import type { products } from "@/app/generated/prisma/client";
import type { ProductWithSerie } from "@/lib/repositories/product/product.repository";
import { productService } from "@/lib/services/products/product.service";
import type { ApiResponse } from "@/lib/types/public/types";
import { NextResponse, type NextRequest } from "next/server";

type routeContext = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: routeContext) {
  const { id } = await params;
  const numId = Number(id);
  try {
    const products = await productService.getProductById(numId);
    return NextResponse.json<ApiResponse<ProductWithSerie>>(
      { success: true, message: "Lấy sản phẩm thành công", data: products },
      { status: 200 },
    );
  } catch (err) {
    if (err instanceof Error && err.message === "NOT_FOUND") {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "Không tìm thấy sản phẩm",
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
    const serie = await productService.updateProduct(numId, body);
    return NextResponse.json<ApiResponse<products>>(
      { success: true, message: "Cập nhật Sản phẩm thành công", data: serie },
      { status: 200 },
    );
  } catch (err) {
    if (err instanceof Error && err.message === "NOT_FOUND") {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "Không tìm thấy sản phẩm để cập nhật",
        },
        { status: 404 },
      );
    }
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
    if (err instanceof Error && err.message === "SERIE_NOT_FOUND") {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "Không tìm thấy serie",
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

export async function DELETE(req: NextRequest, { params }: routeContext) {
  const { id } = await params;
  const numId = Number(id);
  try {
    await productService.deleteProduct(numId);
    return NextResponse.json<ApiResponse<null>>(
      { success: true, message: "Xóa thành công" },
      { status: 200 },
    );
  } catch (err) {
    if (err instanceof Error && err.message === "NOT_FOUND") {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "Không tìm thấy sản phẩm để xóa",
        },
        { status: 404 },
      );
    } else if (err instanceof Error && err.message === "PRODUCT_HAS_VARIANT") {
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
