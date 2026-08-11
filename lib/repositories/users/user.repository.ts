import type {
  Prisma,
  user_role,
  user_status,
  users,
} from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type {
  CreateUserInput,
  UpdateUserInput,
} from "@/lib/types/users/user.type";

export type UserFilterParams = {
  keyword?: string;

  clerk_id?: string;
  email?: string;
  full_name?: string;
  phone?: string;

  role?: user_role;
  status?: user_status;

  page?: number;
  limit?: number;

  sortBy?: "id" | "full_name" | "email" | "created_at" | "updated_at";
  sortOrder?: "asc" | "desc";
};

type FindManyResultUser = {
  users: users[];
  total: number;
};

export const userRepository = {
  // tìm user theo id
  findById: async (id: number): Promise<users | null> => {
    return prisma.users.findUnique({
      where: { id },
    });
  },

  // Tìm user theo clerk_id
  findByClerkId: async (clerk_id: string): Promise<users | null> => {
    return prisma.users.findUnique({
      where: { clerk_id },
    });
  },

  // Tìm user theo email
  findByEmail: async (email: string): Promise<users | null> => {
    return prisma.users.findUnique({
      where: { email },
    });
  },

  /**
   * Lấy danh sách user có:
   *
   * - keyword
   * - clerk_id
   * - email
   * - full_name
   * - phone
   * - role
   * - status
   * - pagination
   * - sorting
   */

  findMany: async ({
    keyword,
    clerk_id,
    email,
    full_name,
    phone,
    role,
    status,
    page = 1,
    limit = 10,
    sortBy = "created_at",
    sortOrder = "desc",
  }: UserFilterParams): Promise<FindManyResultUser> => {
    const skip = (page - 1) * limit;
    const where: Prisma.usersWhereInput = {};
    if (keyword?.trim()) {
      const search = keyword.trim();
      where.OR = [
        {
          clerk_id: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          email: {
            contains: search,
            mode: "insensitive",
          },
        },

        {
          full_name: {
            contains: search,
            mode: "insensitive",
          },
        },

        {
          phone: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    if (clerk_id?.trim()) {
      where.clerk_id = {
        contains: clerk_id.trim(),
        mode: "insensitive",
      };
    }

    if (email?.trim()) {
      where.email = {
        contains: email.trim(),
        mode: "insensitive",
      };
    }

    if (full_name?.trim()) {
      where.full_name = {
        contains: full_name.trim(),
        mode: "insensitive",
      };
    }

    if (phone?.trim()) {
      where.phone = {
        contains: phone.trim(),
        mode: "insensitive",
      };
    }

    if (role) {
      where.role = role;
    }

    if (status) {
      where.status = status;
    }
    const orderBy: Prisma.usersOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };
    const [users, total] = await prisma.$transaction([
      prisma.users.findMany({
        where: where,
        skip,
        take: limit,
        orderBy: orderBy,
      }),
      prisma.users.count({
        where: where,
      }),
    ]);

    return { users, total };
  },

  // tạo mới user
  create: async (input: CreateUserInput): Promise<users> => {
    return prisma.users.create({
      data: input,
    });
  },

  // Cập nhật user
  update: async (id: number, input: UpdateUserInput): Promise<users> => {
    return prisma.users.update({
      where: { id },
      data: input,
    });
  },

  // Xóa user
  delete: async (id: number): Promise<users> => {
    return prisma.users.delete({
      where: { id },
    });
  },
};
