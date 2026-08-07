import type { colors, product_images } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { productImageService } from "@/lib/services/products/product_image.service";
import type { ApiResponse } from "@/lib/types/public/types";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET: Lấy danh sách hình ảnh hoặc danh sách màu sắc của sản phẩm
 * Query Params:
 * - product_id (bắt buộc): ID sản phẩm
 * - type: "general" (ảnh chung) | "grouped_color" (ảnh theo màu) | "color_options" (danh sách màu để select)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("product_id");
    const type = searchParams.get("type");

    if (!productId) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, message: "Thiếu product_id" },
        { status: 400 },
      );
    }

    const parsedProductId = Number(productId);
    if (isNaN(parsedProductId)) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, message: "product_id phải là số" },
        { status: 400 },
      );
    }

    // ------------------------------------------------------------------
    // 1. Lấy danh sách màu sắc duy nhất của sản phẩm (color_options)
    // ------------------------------------------------------------------
    if (type === "color_options") {
      // Truy vấn biến thể sản phẩm kèm thông tin quan hệ bảng colors
      const variants = await prisma.product_variants.findMany({
        where: {
          product_id: parsedProductId,
        },
        select: {
          colors: {
            select: {
              id: true,
              name: true,
              hex_code: true,
            },
          },
        },
      });

      const uniqueColorsMap = new Map<
        number,
        Pick<colors, "id" | "name" | "hex_code">
      >();

      for (const variant of variants) {
        if (variant.colors && !uniqueColorsMap.has(variant.colors.id)) {
          uniqueColorsMap.set(variant.colors.id, {
            id: variant.colors.id,
            name: variant.colors.name,
            hex_code: variant.colors.hex_code,
          });
        }
      }

      const colorOptions = Array.from(uniqueColorsMap.values());

      return NextResponse.json<
        ApiResponse<Pick<colors, "id" | "name" | "hex_code">[]>
      >({
        success: true,
        message: "Lấy danh sách màu sắc thành công",
        data: colorOptions,
      });
    }

    // ------------------------------------------------------------------
    // 2. Lấy danh sách ảnh chung của sản phẩm (general)
    // ------------------------------------------------------------------
    if (type === "general") {
      const generalImages =
        await productImageService.getGeneralImages(parsedProductId);

      return NextResponse.json<ApiResponse<product_images[]>>({
        success: true,
        message: "Lấy danh sách hình ảnh chung thành công",
        data: generalImages,
      });
    }

    // ------------------------------------------------------------------
    // 3. Lấy danh sách ảnh gom nhóm theo màu (grouped_color)
    // ------------------------------------------------------------------
    if (type === "grouped_color") {
      const colorGroupedImages =
        await productImageService.getImagesGroupedByColor(parsedProductId);

      return NextResponse.json<ApiResponse<unknown>>({
        success: true,
        message: "Lấy danh sách hình ảnh theo màu thành công",
        data: colorGroupedImages,
      });
    }

    return NextResponse.json<ApiResponse<null>>(
      { success: false, message: "Type không hợp lệ" },
      { status: 400 },
    );
  } catch (error) {
    console.error("Lỗi API lấy dữ liệu hình ảnh/màu sắc:", error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, message: "Lỗi máy chủ nội bộ" },
      { status: 500 },
    );
  }
}

// export async function GET(req: NextRequest) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const productIdStr = searchParams.get("product_id");
//     const variantIdStr = searchParams.get("variant_id");
//     const colorIdStr = searchParams.get("color_id");

//     if (!productIdStr || isNaN(Number(productIdStr))) {
//       return NextResponse.json(
//         { success: false, message: "product_id không hợp lệ" },
//         { status: 400 },
//       );
//     }

//     const productId = Number(productIdStr);

//     // TH1: Lấy ảnh theo color_id (Lấy tất cả variant_id thuộc màu này)
//     if (colorIdStr) {
//       const colorId = Number(colorIdStr);
//       const variants = await prisma.product_variants.findMany({
//         where: { product_id: productId, color_id: colorId },
//         select: { id: true },
//       });

//       const variantIds = variants.map((v) => v.id);

//       const images = await prisma.product_images.findMany({
//         where: {
//           product_id: productId,
//           variant_id: { in: variantIds },
//         },
//         orderBy: { id: "desc" },
//       });

//       return NextResponse.json({ success: true, data: images });
//     }

//     // TH2: Lấy ảnh theo variant_id cụ thể
//     if (variantIdStr) {
//       const images = await prisma.product_images.findMany({
//         where: {
//           product_id: productId,
//           variant_id: Number(variantIdStr),
//         },
//         orderBy: { id: "desc" },
//       });

//       return NextResponse.json({ success: true, data: images });
//     }

//     // TH3: Lấy ảnh chung của sản phẩm (variant_id là null)
//     const images = await prisma.product_images.findMany({
//       where: {
//         product_id: productId,
//         variant_id: null,
//       },
//       orderBy: { id: "desc" },
//     });

//     return NextResponse.json({ success: true, data: images });
//   } catch (err) {
//     return NextResponse.json(
//       { success: false, message: "Lỗi server khi lấy ảnh" },
//       { status: 500 },
//     );
//   }
// }

/**
 * POST: Tạo mới ảnh (đơn lẻ hoặc hàng loạt)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Xử lý Upload nhiều ảnh cùng lúc
    if (Array.isArray(body.image_urls)) {
      const result = await productImageService.createManyProductImages({
        product_id: body.product_id,
        variant_id: body.variant_id ?? null,
        image_urls: body.image_urls,
      });

      return NextResponse.json<ApiResponse<{ count: number }>>(
        {
          success: true,
          message: `Đã thêm thành công ${result.count} hình ảnh`,
          data: result,
        },
        { status: 201 },
      );
    }

    // Xử lý Upload 1 ảnh
    const newImage = await productImageService.createProductImage({
      product_id: body.product_id,
      variant_id: body.variant_id ?? null,
      image_url: body.image_url,
      is_featured: body.is_featured ?? false,
    });

    return NextResponse.json<ApiResponse<product_images>>(
      {
        success: true,
        message: "Thêm hình ảnh thành công",
        data: newImage,
      },
      { status: 201 },
    );
  } catch (err) {
    if (err instanceof Error && err.message === "PRODUCT_NOT_FOUND") {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "Không tìm thấy sản phẩm",
        },
        { status: 404 },
      );
    }
    if (err instanceof Error && err.message === "VARIANT_NOT_FOUND") {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "Không tìm thấy biến thể sản phẩm",
        },
        { status: 404 },
      );
    }
    if (err instanceof Error && err.message === "EMPTY_IMAGE_LIST") {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "Danh sách đường dẫn ảnh không được để trống",
        },
        { status: 400 },
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
