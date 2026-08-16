import { requireAuth } from "@/lib/clerk-auth/authorization";

import { cartItemService } from "@/lib/services/cart/cart_item.service";
import { NextRequest, NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

// Cập nhật số lượng sản phẩm
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const user = await requireAuth();

    const { id } = await params;
    const itemId = Number(id);

    if (!Number.isInteger(itemId) || itemId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "ID cart item không hợp lệ",
        },
        { status: 400 },
      );
    }

    const body = await request.json();
    const { quantity } = body;

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "quantity phải là số nguyên lớn hơn 0",
        },
        { status: 400 },
      );
    }

    const cartItem = await cartItemService.updateQuantity(
      user.id,
      itemId,
      quantity,
    );

    return NextResponse.json({
      success: true,
      message: "Cập nhật số lượng thành công",
      data: cartItem,
    });
  } catch (error) {
    console.error("PATCH /api/cart/items/[id] error:", error);

    if (error instanceof Error) {
      if (error.message === "CART_NOT_FOUND") {
        return NextResponse.json(
          {
            success: false,
            message: "Không tìm thấy giỏ hàng",
          },
          { status: 404 },
        );
      }

      if (error.message === "CART_ITEM_NOT_FOUND") {
        return NextResponse.json(
          {
            success: false,
            message: "Không tìm thấy sản phẩm trong giỏ hàng",
          },
          { status: 404 },
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        message: "Không thể cập nhật số lượng",
      },
      { status: 500 },
    );
  }
}

// Xóa sản phẩm khỏi giỏ
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const user = await requireAuth();

    const { id } = await params;
    const itemId = Number(id);

    if (!Number.isInteger(itemId) || itemId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "ID cart item không hợp lệ",
        },
        { status: 400 },
      );
    }

    await cartItemService.removeFromCart(user.id, itemId);

    return NextResponse.json({
      success: true,
      message: "Xóa sản phẩm khỏi giỏ hàng thành công",
    });
  } catch (error) {
    console.error("DELETE /api/cart/items/[id] error:", error);

    if (error instanceof Error) {
      if (error.message === "CART_NOT_FOUND") {
        return NextResponse.json(
          {
            success: false,
            message: "Không tìm thấy giỏ hàng",
          },
          { status: 404 },
        );
      }

      if (error.message === "CART_ITEM_NOT_FOUND") {
        return NextResponse.json(
          {
            success: false,
            message: "Không tìm thấy sản phẩm trong giỏ hàng",
          },
          { status: 404 },
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        message: "Không thể xóa sản phẩm khỏi giỏ hàng",
      },
      { status: 500 },
    );
  }
}
