import type { user_role, user_status } from "@/app/generated/prisma/enums";

export type CreateUserInput = {
  clerk_id: string;
  email: string;
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  role?: user_role;
  status?: user_status;
};

export type UpdateUserInput = Partial<
  Omit<CreateUserInput, "clerk_id" | "email">
>;
