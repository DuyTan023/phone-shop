import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import type { ProductVariant } from "@/lib/repositories/product/products_variant.repository";
import { productVariantService } from "@/lib/services/products/product_variant.service";
import type { ApiResponse } from "@/lib/types/public/types";

export async function GET(req: NextRequest) {
  try {
    const keyword = req.nextUrl.searchParams.get("keyword") ?? undefined;

    const product_variants =
      await productVariantService.getAllDefaultProductVariants(keyword);

    return NextResponse.json<ApiResponse<ProductVariant[]>>({
      success: true,
      message: "Lấy danh sách biến thể mặc định thành công",
      data: product_variants,
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
