import type { series } from "@/app/generated/prisma/client";
import { serieService } from "@/lib/services/catalogs/serie.service";
import { ApiResponse } from "@/lib/types/public/types";
import { NextRequest, NextResponse } from "next/server";

type routeContext = { params: Promise<{ id: string }> };
export async function GET(req: NextRequest, { params }: routeContext) {
  const { id } = await params;
  const numId = Number(id);
  try {
    const serie = await serieService.getSerieById(numId);
    return NextResponse.json<ApiResponse<series>>(
      { success: true, message: "Lấy serie thành công", data: serie },
      { status: 200 },
    );
  } catch (err) {
    if (err instanceof Error && err.message === "NOT_FOUND") {
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

export async function PUT(req: NextRequest, { params }: routeContext) {
  const { id } = await params;
  const numId = Number(id);
  try {
    const body = await req.json();
    const releaseYear = Number(body.release_year);
    const brandId = Number(body.brand_id);
    const serie = await serieService.updateSerie(numId, {
      name: body.name,
      slug: body.slug,
      brand_id: brandId,
      release_year: releaseYear,
    });
    return NextResponse.json<ApiResponse<series>>(
      { success: true, message: "Cập nhật serie thành công", data: serie },
      { status: 200 },
    );
  } catch (err) {
    if (err instanceof Error && err.message === "NOT_FOUND") {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "Không tìm thấy serie để cập nhật",
        },
        { status: 404 },
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
    if (err instanceof Error && err.message === "SLUG_EXISTS") {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "Slug đã tồn tại",
        },
        { status: 409 },
      );
    }
    if (err instanceof Error && err.message === "BRAND_NOT_FOUND") {
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

export async function DELETE(req: NextRequest, { params }: routeContext) {
  const { id } = await params;
  const numId = Number(id);
  try {
    await serieService.deleteSerie(numId);
    return NextResponse.json<ApiResponse<null>>(
      { success: true, message: "Xóa thành công" },
      { status: 200 },
    );
  } catch (err) {
    if (err instanceof Error && err.message === "NOT_FOUND") {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "Không tìm thấy serie để xóa",
        },
        { status: 404 },
      );
    } else if (err instanceof Error && err.message === "SERIES_HAS_PRODUCTS") {
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
