import { Prisma, type users } from "@/app/generated/prisma/client";
import {
  userRepository,
  type UserFilterParams,
} from "@/lib/repositories/users/user.repository";
import type { PaginationResult } from "@/lib/types/public/types";
import type {
  CreateUserInput,
  UpdateUserInput,
} from "@/lib/types/users/user.type";

export const userService = {
  getUserById: async (id: number) => {
    try {
      const user = await userRepository.findById(id);
      if (!user) throw new Error("NOT_FOUND");
      return user;
    } catch (err) {
      // Nếu lỗi là do chính mình chủ động quăng ra (NOT_FOUND), cứ thế đẩy thẳng lên tầng Route
      if (err instanceof Error && err.message === "NOT_FOUND") {
        throw err;
      }

      // Nếu là lỗi không mong muốn khác (ví dụ sập DB, lỗi kết nối Postgres), log lại rồi quăng lỗi chung
      throw new Error("SERVER_ERROR");
    }
  },

  getUserByClerkId: async (clerk_id: string) => {
    try {
      const user = await userRepository.findByClerkId(clerk_id);
      if (!user) throw new Error("NOT_FOUND");
      return user;
    } catch (err) {
      // Nếu lỗi là do chính mình chủ động quăng ra (NOT_FOUND), cứ thế đẩy thẳng lên tầng Route
      if (err instanceof Error && err.message === "NOT_FOUND") {
        throw err;
      }

      // Nếu là lỗi không mong muốn khác (ví dụ sập DB, lỗi kết nối Postgres), log lại rồi quăng lỗi chung
      throw new Error("SERVER_ERROR");
    }
  },

  getUserByEmail: async (email: string) => {
    try {
      const user = await userRepository.findByEmail(email);
      if (!user) throw new Error("NOT_FOUND");
      return user;
    } catch (err) {
      // Nếu lỗi là do chính mình chủ động quăng ra (NOT_FOUND), cứ thế đẩy thẳng lên tầng Route
      if (err instanceof Error && err.message === "NOT_FOUND") {
        throw err;
      }

      // Nếu là lỗi không mong muốn khác (ví dụ sập DB, lỗi kết nối Postgres), log lại rồi quăng lỗi chung
      throw new Error("SERVER_ERROR");
    }
  },

  getUsers: async ({
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
  }: UserFilterParams): Promise<PaginationResult<users>> => {
    try {
      const { users, total } = await userRepository.findMany({
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
      return {
        data: users,
        total: total,
        page: page,
        limit: limit,
        totalPage: Math.ceil(total / limit),
      };
    } catch (err) {
      throw new Error("SERVER_ERROR");
    }
  },

  createUser: async (input: CreateUserInput): Promise<users> => {
    try {
      if (input.clerk_id) {
        const existing = await userRepository.findByClerkId(input.clerk_id);
        if (existing) throw new Error("USER_EXISTS");
      }
      return await userRepository.create(input);
    } catch (err) {
      if (err instanceof Error && err.message === "USER_EXISTS") {
        throw err;
      }
      throw new Error("SERVER_ERROR");
    }
  },

  updateUser: async (id: number, input: UpdateUserInput): Promise<users> => {
    try {
      return await userRepository.update(id, input);
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2025"
      ) {
        throw new Error("NOT_FOUND");
      }

      throw new Error("SERVER_ERROR");
    }
  },

  deleteUser: async (id: number): Promise<users> => {
    try {
      return await userRepository.delete(id);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === "P2025") {
          throw new Error("NOT_FOUND");
        }

        if (err.code === "P2003") {
          throw new Error("IN_USE");
        }
      }
      throw new Error("SERVER_ERROR");
    }
  },
};
