// Danh sách sản phẩm mặc định theo brand

import type { ProductVariant } from "@/lib/repositories/product/products_variant.repository";
import { productVariantService } from "@/lib/services/products/product_variant.service";
import type { ApiResponse } from "@/lib/types/public/types";
import { NextResponse, type NextRequest } from "next/server";

type routeContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(req: NextRequest, { params }: routeContext) {
  const { slug } = await params;

  try {
    const product_variants =
      await productVariantService.getProductVariantDefaultByBrandSlug(slug);

    return NextResponse.json<ApiResponse<ProductVariant[]>>(
      {
        success: true,
        message: "Lấy sản phẩm thành công",
        data: product_variants,
      },
      { status: 200 },
    );
  } catch (err) {
    if (err instanceof Error && err.message === "NOT_FOUND") {
      return NextResponse.json<ApiResponse<ProductVariant[]>>(
        {
          success: true,
          message: "Brand chưa có sản phẩm nào",
          data: [],
        },
        { status: 200 },
      );
    }

    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        message: "Lỗi server",
      },
      { status: 500 },
    );
  }
}
