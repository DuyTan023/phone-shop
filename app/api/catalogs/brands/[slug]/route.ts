import type { brands } from "@/app/generated/prisma/client";
import { brandService } from "@/lib/services/catalogs/brand.service";
import type { ApiResponse } from "@/lib/types/public/types";
import { NextRequest, NextResponse } from "next/server";

type routeContext = { params: Promise<{ slug: string }> };

export async function GET(req: NextRequest, { params }: routeContext) {
  const { slug } = await params;
  try {
    const brand = await brandService.getBrandBySlug(slug);
    return NextResponse.json<ApiResponse<brands>>(
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

export async function PUT(req: NextRequest, { params }: routeContext) {
  const { slug } = await params;
  try {
    const body = await req.json();
    const brand = await brandService.updateBrand(slug, body);
    return NextResponse.json<ApiResponse<typeof brand>>(
      { success: true, message: "Cập nhật banrd thành công", data: brand },
      { status: 200 },
    );
  } catch (err) {
    if (err instanceof Error && err.message === "NOT_FOUND") {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "Không tìm thấy brand để cập nhật",
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
  const { slug } = await params;
  try {
    await brandService.deleteBrand(slug);
    return NextResponse.json<ApiResponse<null>>(
      { success: true, message: "Xóa thành công" },
      { status: 200 },
    );
  } catch (err) {
    if (err instanceof Error && err.message === "NOT_FOUND") {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "Không tìm thấy brand để xóa",
        },
        { status: 404 },
      );
    } else if (err instanceof Error && err.message === "BRAND_HAS_PRODUCTS") {
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
