//app/api/users/[id]/role/route.ts

import { NextResponse, type NextRequest } from "next/server";

import type { user_role, users } from "@/app/generated/prisma/client";
import { requireAdmin } from "@/lib/clerk-auth/authorization";
import { userService } from "@/lib/services/users/users.service";
import type { ApiResponse } from "@/lib/types/public/types";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    await requireAdmin();

    const { id: idParam } = await params;
    const id = Number(idParam);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "ID user không hợp lệ",
        },
        { status: 400 },
      );
    }

    const body = await req.json();
    const role = body.role as user_role;

    if (role !== "USER" && role !== "ADMIN") {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "Role không hợp lệ",
        },
        { status: 400 },
      );
    }

    const user = await userService.updateUser(id, {
      role,
    });

    return NextResponse.json<ApiResponse<users>>({
      success: true,
      message: "Cập nhật role user thành công",
      data: user,
    });
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === "UNAUTHORIZED") {
        return NextResponse.json<ApiResponse<null>>(
          {
            success: false,
            message: "Bạn chưa đăng nhập",
          },
          { status: 401 },
        );
      }

      if (err.message === "USER_BLOCKED") {
        return NextResponse.json<ApiResponse<null>>(
          {
            success: false,
            message: "Tài khoản đã bị khóa",
          },
          { status: 403 },
        );
      }

      if (err.message === "FORBIDDEN") {
        return NextResponse.json<ApiResponse<null>>(
          {
            success: false,
            message: "Bạn không có quyền thực hiện thao tác này",
          },
          { status: 403 },
        );
      }

      if (err.message === "NOT_FOUND") {
        return NextResponse.json<ApiResponse<null>>(
          {
            success: false,
            message: "Không tìm thấy user",
          },
          { status: 404 },
        );
      }
    }

    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        message: "Lỗi server",
      },
      { status: 500 },
    );
  }
}
