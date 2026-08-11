import { auth } from "@clerk/nextjs/server";

import { userService } from "@/lib/services/users/users.service";

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
  const user = await requireAuth();

  if (user.role !== "ADMIN") {
    throw new Error("FORBIDDEN");
  }

  return user;
}
