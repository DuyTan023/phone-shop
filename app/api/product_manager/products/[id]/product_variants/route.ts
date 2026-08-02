import type { ProductVariant } from "@/lib/repositories/product/products_variant.repository";
import { productVariantService } from "@/lib/services/products/product_variant.service";
import type { ApiResponse } from "@/lib/types/public/types";
import { NextResponse, type NextRequest } from "next/server";

type routeContext = { params: Promise<{ id: string }> };
export async function GET(req: NextRequest, { params }: routeContext) {
  const { id } = await params;
  const numId = Number(id);
  try {
    const products =
      await productVariantService.getProductVariantByProductId(numId);
    return NextResponse.json<ApiResponse<ProductVariant[]>>(
      {
        success: true,
        message: "Lấy danh sách biến thể của sản phẩm thành công",
        data: products,
      },
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
