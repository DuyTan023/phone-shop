import {
  productSpecService,
  type GroupedProductSpec,
} from "@/lib/services/products/product.spec.service";
import type { ApiResponse } from "@/lib/types/public/types";

import { NextRequest, NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const numId = Number(id);

  if (isNaN(numId) || numId <= 0) {
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        message: "ID sản phẩm không hợp lệ",
      },
      { status: 400 },
    );
  }

  try {
    const specs = await productSpecService.getProductSpecsGrouped(numId);

    return NextResponse.json<ApiResponse<GroupedProductSpec[]>>(
      {
        success: true,
        message: "Lấy thông số kỹ thuật thành công",
        data: specs,
      },
      { status: 200 },
    );
  } catch (err) {
    if (err instanceof Error && err.message.includes("không tồn tại")) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "Không tìm thấy thông số kỹ thuật cho sản phẩm này",
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
