// api/users/route.ts

import type {
  user_role,
  user_status,
  users,
} from "@/app/generated/prisma/client";
import { userService } from "@/lib/services/users/users.service";
import type { ApiResponse, PaginationResult } from "@/lib/types/public/types";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);
    const keyword = searchParams.get("keyword") || undefined;
    const clerk_id = searchParams.get("clerk_id") || undefined;
    const email = searchParams.get("email") || undefined;
    const full_name = searchParams.get("full_name") || undefined;
    const phone = searchParams.get("phone") || undefined;

    const roleParam = searchParams.get("role");
    const statusParam = searchParams.get("status");

    const role =
      roleParam === "USER" || roleParam === "ADMIN"
        ? (roleParam as user_role)
        : undefined;
    const status =
      statusParam === "ACTIVE" || statusParam === "BLOCKED"
        ? (statusParam as user_status)
        : undefined;

    const sortByParam = searchParams.get("sortBy");
    const sortBy =
      sortByParam === "id" ||
      sortByParam === "full_name" ||
      sortByParam === "email" ||
      sortByParam === "created_at" ||
      sortByParam === "updated_at"
        ? sortByParam
        : undefined;

    const sortOrderParam = searchParams.get("sortOrder");
    const sortOrder =
      sortOrderParam === "asc" || sortOrderParam === "desc"
        ? sortOrderParam
        : undefined;

    const users = await userService.getUsers({
      keyword,
      clerk_id,
      email,
      full_name,
      phone,
      role,
      status,
      page,
      limit,
      sortBy,
      sortOrder,
    });
    return NextResponse.json<ApiResponse<PaginationResult<users>>>({
      success: true,
      message: "Lấy danh sách user thành công",
      data: users,
    });
  } catch {
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        message: "Lỗi server",
      },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const user = await userService.createUser(body);

    return NextResponse.json<ApiResponse<typeof user>>(
      { success: true, message: "Tạo user thành công", data: user },
      { status: 201 },
    );
  } catch (err) {
    if (err instanceof Error && err.message === "USER_EXISTS") {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "User đã tồn tại",
        },
        { status: 409 },
      );
    }
    return NextResponse.json<ApiResponse<null>>(
      { success: false, message: "Lỗi server" },
      { status: 500 },
    );
  }
}
