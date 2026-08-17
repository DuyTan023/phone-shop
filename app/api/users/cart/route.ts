import { requireApiAuth, requireAuth } from "@/lib/clerk-auth/authorization";
import { cartService } from "@/lib/services/cart/cart.service";
import { NextResponse } from "next/server";

// Lấy giỏ hàng của user
export async function GET() {
  try {
    const user = await requireApiAuth();

    const cart = await cartService.getCartByUserId(user.id);

    return NextResponse.json({
      success: true,
      message: "Lấy giỏ hàng thành công",
      data: cart,
    });
  } catch (error) {
    console.error("GET /api/cart error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Không thể lấy giỏ hàng",
      },
      { status: 500 },
    );
  }
}

// Tạo giỏ hàng cho user
export async function POST() {
  try {
    const user = await requireAuth();

    const cart = await cartService.createCart(user.id);

    return NextResponse.json(
      {
        success: true,
        message: "Tạo giỏ hàng thành công",
        data: cart,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/cart error:", error);

    if (error instanceof Error && error.message === "CART_ALREADY_EXISTS") {
      return NextResponse.json(
        {
          success: false,
          message: "Giỏ hàng đã tồn tại",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Không thể tạo giỏ hàng",
      },
      { status: 500 },
    );
  }
}
