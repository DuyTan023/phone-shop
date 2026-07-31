import type { product_specs } from "@/app/generated/prisma/client";
import type { Product_Spec } from "@/lib/repositories/product/product_spec.repository";
import { productSpecService } from "@/lib/services/products/product.spec.service";
import type { ApiResponse } from "@/lib/types/public/types";
import { NextRequest, NextResponse } from "next/server";

type routeContext = { params: Promise<{ id: string }> };
export async function GET(req: NextRequest, { params }: routeContext) {
  const { id } = await params;
  const numId = Number(id);
  try {
    const product_spec = await productSpecService.getProductSpecById(numId);
    return NextResponse.json<ApiResponse<Product_Spec>>(
      {
        success: true,
        message: "Lấy giá trị thông số phẩm thành công",
        data: product_spec,
      },
      { status: 200 },
    );
  } catch (err) {
    if (err instanceof Error && err.message === "NOT_FOUND") {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "Không tìm thấy thông số sản phẩm",
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
    const product_spec = await productSpecService.updateProductSpec(
      numId,
      body,
    );
    return NextResponse.json<ApiResponse<product_specs>>(
      {
        success: true,
        message: "Cập nhật giá trị thông số thành công",
        data: product_spec,
      },
      { status: 200 },
    );
  } catch (err) {
    if (err instanceof Error && err.message === "NOT_FOUND") {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "Không tìm thấy thông số để cập nhật",
        },
        { status: 404 },
      );
    }
    if (err instanceof Error && err.message === "RELATED_ENTITY_NOT_FOUND") {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "Không tìm thấy đơn vị hoặc thông tin phụ thuộc",
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

export async function DELETE(req: NextRequest, { params }: routeContext) {
  const { id } = await params;
  const numId = Number(id);
  try {
    await productSpecService.deleteProductSpec(numId);
    return NextResponse.json<ApiResponse<null>>(
      { success: true, message: "Xóa thành công" },
      { status: 200 },
    );
  } catch (err) {
    if (err instanceof Error && err.message === "NOT_FOUND") {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "Không tìm thấy thông số sản phẩm để xóa",
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
