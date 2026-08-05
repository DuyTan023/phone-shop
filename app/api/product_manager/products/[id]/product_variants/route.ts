import type { product_variants } from "@/app/generated/prisma/client";
import type {
  FindManyResultProductVariant,
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

    // Lấy page và limit từ searchParams (có giá trị mặc định nếu không truyền)
    const page = parseNumParam("page") ?? 1;
    const limit = parseNumParam("limit") ?? 10;

    const filters: ProductVariantFilter = {
      sku: searchParams.get("sku") || undefined,
      color_id: parseNumParam("color_id"),
      ram_id: parseNumParam("ram_id"),
      storage_id: parseNumParam("storage_id"),
    };

    // Truyền đúng thứ tự tham số: (page, limit, product_id, filters)
    const productVariants =
      await productVariantService.getProductVariantByProductId(
        page,
        limit,
        productId,
        filters,
      );

    return NextResponse.json<ApiResponse<FindManyResultProductVariant>>(
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
