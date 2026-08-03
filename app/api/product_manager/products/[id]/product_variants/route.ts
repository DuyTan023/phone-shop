import type {
  ProductVariant,
  ProductVariantFilter,
} from "@/lib/repositories/product/products_variant.repository";
import { productVariantService } from "@/lib/services/products/product_variant.service";
import type { ApiResponse } from "@/lib/types/public/types";
import { NextResponse, type NextRequest } from "next/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(req: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const productId = Number(id);

  if (isNaN(productId)) {
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        message: "ID sản phẩm không hợp lệ",
      },
      { status: 400 },
    );
  }

  try {
    const searchParams = req.nextUrl.searchParams;

    const parseNumParam = (key: string) => {
      const val = searchParams.get(key);
      if (!val) return undefined;
      const num = Number(val);
      return isNaN(num) ? undefined : num;
    };

    const filters: ProductVariantFilter = {
      sku: searchParams.get("sku") || undefined,
      color_id: parseNumParam("color_id"),
      ram_id: parseNumParam("ram_id"),
      storage_id: parseNumParam("storage_id"),
    };

    const productVariants =
      await productVariantService.getProductVariantByProductId(
        productId,
        filters,
      );

    return NextResponse.json<ApiResponse<ProductVariant[]>>(
      {
        success: true,
        message: "Lấy danh sách biến thể thành công",
        data: productVariants,
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        message: "Lỗi server",
      },
      { status: 500 },
    );
  }
}
