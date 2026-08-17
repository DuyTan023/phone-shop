/* eslint-disable @typescript-eslint/no-explicit-any */
//api/orders/[id]/route.ts

import { orderService } from "@/lib/services/order/order.service";
import { NextResponse } from "next/server";

// GET: Xem chi tiết 1 hóa đơn cũ
export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const orderId = Number(params.id);
    const order = await orderService.getOrderById(orderId);

    const serialized = JSON.parse(
      JSON.stringify(order, (_, v) =>
        typeof v === "bigint" ? v.toString() : v,
      ),
    );

    return NextResponse.json({ success: true, data: serialized });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 404 },
    );
  }
}

// PATCH: Hủy đơn hàng
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const orderId = Number(params.id);
    const { user_id } = await req.json();

    const cancelledOrder = await orderService.cancelOrder(
      orderId,
      Number(user_id),
    );

    const serialized = JSON.parse(
      JSON.stringify(cancelledOrder, (_, v) =>
        typeof v === "bigint" ? v.toString() : v,
      ),
    );

    return NextResponse.json({
      success: true,
      message: "Hủy đơn hàng thành công",
      data: serialized,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 },
    );
  }
}
