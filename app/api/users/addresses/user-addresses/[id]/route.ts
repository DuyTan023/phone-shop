import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { userAddressService } from "@/lib/services/addresses/user_addresses.service";
import { userService } from "@/lib/services/users/users.service";

import type { user_addresses } from "@/app/generated/prisma/client";
import type { ApiResponse } from "@/lib/types/public/types";
import type { UpdateUserAddressesInput } from "@/lib/types/users/addresses.type";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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

    const { id } = await params;
    const addressId = Number(id);

    if (isNaN(addressId)) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "ID địa chỉ không hợp lệ",
        },
        { status: 400 },
      );
    }

    const result = await userAddressService.getUserAddressById(
      addressId,
      user.id,
    );

    return NextResponse.json<ApiResponse<user_addresses>>({
      success: true,
      message: "Lấy địa chỉ thành công",
      data: result,
    });
  } catch (err) {
    console.error("GET API user-address by id Error:", err);

    if (err instanceof Error && err.message === "NOT_FOUND") {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "Không tìm thấy địa chỉ",
        },
        { status: 404 },
      );
    }

    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        message: "Lỗi hệ thống không thể lấy địa chỉ",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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

    const { id } = await params;
    const addressId = Number(id);

    if (isNaN(addressId)) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "ID địa chỉ không hợp lệ",
        },
        { status: 400 },
      );
    }

    const body: UpdateUserAddressesInput = await request.json();

    const result = await userAddressService.updateUserAddress(
      addressId,
      user.id,
      body,
    );

    return NextResponse.json<ApiResponse<user_addresses>>({
      success: true,
      message: "Cập nhật địa chỉ thành công",
      data: result,
    });
  } catch (err) {
    console.error("PATCH API user-address Error:", err);

    if (err instanceof Error && err.message === "NOT_FOUND") {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "Không tìm thấy địa chỉ",
        },
        { status: 404 },
      );
    }

    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        message: "Lỗi hệ thống không thể cập nhật địa chỉ",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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

    const { id } = await params;
    const addressId = Number(id);

    if (isNaN(addressId)) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "ID địa chỉ không hợp lệ",
        },
        { status: 400 },
      );
    }

    await userAddressService.deleteUserAddress(addressId, user.id);

    return NextResponse.json<ApiResponse<null>>({
      success: true,
      message: "Xóa địa chỉ thành công",
      data: null,
    });
  } catch (err) {
    console.error("DELETE API user-address Error:", err);

    if (err instanceof Error && err.message === "NOT_FOUND") {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "Không tìm thấy địa chỉ",
        },
        { status: 404 },
      );
    }

    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        message: "Lỗi hệ thống không thể xóa địa chỉ",
      },
      { status: 500 },
    );
  }
}
