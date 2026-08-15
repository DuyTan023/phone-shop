import type { SerieWithBrand } from "@/lib/repositories/catalogs/series.repository";

import { serieService } from "@/lib/services/catalogs/serie.service";
import type { ApiResponse } from "@/lib/types/public/types";
import { NextResponse, type NextRequest } from "next/server";
type routeContext = { params: Promise<{ slug: string }> };

export async function GET(req: NextRequest, { params }: routeContext) {
  const { slug } = await params;
  try {
    const brand = await serieService.getSerieByBrandSlug(slug);
    return NextResponse.json<ApiResponse<SerieWithBrand[]>>(
      { success: true, message: "Lấy drand thành công", data: brand },
      { status: 200 },
    );
  } catch (err) {
    if (err instanceof Error && err.message === "NOT_FOUND") {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "Không tìm thấy brand",
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
