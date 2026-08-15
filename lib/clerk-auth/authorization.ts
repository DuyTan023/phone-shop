import { userService } from "@/lib/services/users/users.service";
import { auth } from "@clerk/nextjs/server";
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
  let user;

  try {
    // Chỉ bọc phần lấy thông tin và check lỗi xác thực/block vào try/catch
    user = await requireAuth();
  } catch (error) {
    // Ném lại lỗi UNAUTHORIZED hoặc USER_BLOCKED để layout/page bên ngoài xử lý
    throw error;
  }

  // Kiểm tra quyền ADMIN nằm NGOÀI try/catch để hàm redirect() hoạt động đúng
  if (user.role !== "ADMIN") {
    redirect("/access-denied");
  }

  return user;
}
