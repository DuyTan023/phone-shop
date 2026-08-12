import { auth } from "@clerk/nextjs/server";

import { userService } from "@/lib/services/users/users.service";
import { redirect } from "next/navigation";

export async function requireAuth() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("UNAUTHORIZED");
  }

  const user = await userService.getUserByClerkId(userId);

  if (user.status === "BLOCKED") {
    throw new Error("USER_BLOCKED");
  }

  return user;
}

export async function requireAdmin() {
  try {
    const user = await requireAuth();

    if (user.role !== "ADMIN") {
      redirect("/access-denied");
      return null; // Trả về null thay vì throw error
    }

    return user;
  } catch (error) {
    // Bắt lỗi từ requireAuth (UNAUTHORIZED hoặc USER_BLOCKED)
    throw error; // Ném lại để xử lý ở layout
  }
}
