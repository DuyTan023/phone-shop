import { requireAuth } from "@/lib/clerk-auth/authorization";
import { cartItemService } from "@/lib/services/cart/cart_item.service";
import { NextRequest, NextResponse } from "next/server";

// Lấy danh sách sản phẩm trong giỏ
export async function GET() {
  try {
    const user = await requireAuth();

    const cartItems = await cartItemService.getCartItems(user.id);

    return NextResponse.json({
      success: true,
      message: "Lấy danh sách sản phẩm trong giỏ hàng thành công",
      data: cartItems,
    });
  } catch (error) {
    console.error("GET /api/cart/items error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Không thể lấy danh sách sản phẩm trong giỏ hàng",
      },
      { status: 500 },
    );
  }
}

// Thêm sản phẩm vào giỏ
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const body = await request.json();

    const { variant_id, quantity } = body;

    if (!Number.isInteger(variant_id) || variant_id <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "variant_id không hợp lệ",
        },
        { status: 400 },
      );
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "quantity phải là số nguyên lớn hơn 0",
        },
        { status: 400 },
      );
    }

    const cartItem = await cartItemService.addToCart(
      user.id,
      variant_id,
      quantity,
    );

    return NextResponse.json(
      {
        success: true,
        message: "Thêm sản phẩm vào giỏ hàng thành công",
        data: cartItem,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/cart/items error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Không thể thêm sản phẩm vào giỏ hàng",
      },
      { status: 500 },
    );
  }
}
