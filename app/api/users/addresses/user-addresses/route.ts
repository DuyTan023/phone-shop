import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { userAddressService } from "@/lib/services/addresses/user_addresses.service";
import { userService } from "@/lib/services/users/users.service";

import type { user_addresses } from "@/app/generated/prisma/client";
import type { ApiResponse } from "@/lib/types/public/types";
import type { CreateUserAddressesInput } from "@/lib/types/users/addresses.type";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "Bạn chưa đăng nhập",
        },
        { status: 401 },
      );
    }

    const user = await userService.getUserByClerkId(userId);

    const result = await userAddressService.getUserAddresses(user.id);

    return NextResponse.json<ApiResponse<user_addresses[]>>({
      success: true,
      message: "Lấy danh sách địa chỉ thành công",
      data: result,
    });
  } catch (err) {
    console.error("GET API user-addresses Error:", err);

    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        message: "Lỗi hệ thống không thể lấy danh sách địa chỉ",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "Bạn chưa đăng nhập",
        },
        { status: 401 },
      );
    }

    const user = await userService.getUserByClerkId(userId);

    const body: CreateUserAddressesInput = await request.json();

    const result = await userAddressService.createUserAddress(user.id, body);

    return NextResponse.json<ApiResponse<user_addresses>>(
      {
        success: true,
        message: "Tạo địa chỉ thành công",
        data: result,
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("POST API user-addresses Error:", err);

    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        message: "Lỗi hệ thống không thể tạo địa chỉ",
      },
      { status: 500 },
    );
  }
}
