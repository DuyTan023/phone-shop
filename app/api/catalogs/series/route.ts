import type { series } from "@/app/generated/prisma/client";
import type { SerieWithBrand } from "@/lib/repositories/catalogs/series.repository";
import { serieService } from "@/lib/services/catalogs/serie.service";
import type { ApiResponse, PaginationResult } from "@/lib/types/public/types";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);
    const keyword = searchParams.get("keyword") || undefined;
    const series = await serieService.GetSerie({ page, limit, keyword });

    return NextResponse.json<ApiResponse<PaginationResult<SerieWithBrand>>>({
      success: true,
      message: "Lấy danh sách serie thành công",
      data: series,
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
    const releaseYear = Number(body.release_year);
    const brandId = Number(body.brand_id);
    const serie = await serieService.createSerie({
      name: body.name,
      slug: body.slug,
      brand_id: brandId,
      release_year: releaseYear,
    });
    return NextResponse.json<ApiResponse<series>>(
      { success: true, message: "Tạo serie thành công", data: serie },
      { status: 201 },
    );
  } catch (err) {
    if (err instanceof Error && err.message === "SLUG_EXISTS") {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "Slug đã tồn tại",
        },
        { status: 409 },
      );
    }
    if (err instanceof Error && err.message === "SERIE_EXISTS") {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "Serie đã tồn tại",
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
