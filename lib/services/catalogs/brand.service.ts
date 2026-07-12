import { Prisma, type brands } from "@/app/generated/prisma/client";
import { brandRepository } from "@/lib/repositories/catalogs/brands.repository";
import type {
  CreateBrandInput,
  UpdateBrandInput,
} from "@/lib/types/catalogs/brands.type";
import { PaginationResult } from "./../../types/public/types";
type GetBrandParams = {
  page?: number;
  limit?: number;
};

export const brandService = {
  getBrand: async ({
    page = 1,
    limit = 10,
  }: GetBrandParams): Promise<PaginationResult<brands>> => {
    try {
      const { brands, total } = await brandRepository.findMany({ page, limit });
      return {
        data: brands,
        total: total,
        page: page,
        limit: limit,
        totalPage: Math.ceil(total / limit),
      };
    } catch (err) {
      throw new Error("Không thể lấy danh sách bài viết" + err);
    }
  },

  getBrandBySlug: async (slug: string): Promise<brands> => {
    try {
      const brand = await brandRepository.findBySlug(slug);
      if (!brand) throw new Error("NOT_FOUND");
      return brand;
    } catch (err) {
      // Nếu lỗi là do chính mình chủ động quăng ra (NOT_FOUND), cứ thế đẩy thẳng lên tầng Route
      if (err instanceof Error && err.message === "NOT_FOUND") {
        throw err;
      }

      // Nếu là lỗi không mong muốn khác (ví dụ sập DB, lỗi kết nối Postgres), log lại rồi quăng lỗi chung
      throw new Error("SERVER_ERROR");
    }
  },

  createBrand: async (input: CreateBrandInput): Promise<brands> => {
    try {
      if (input.slug) {
        const existing = await brandRepository.findBySlug(input.slug);
        if (existing) throw new Error("SLUG_EXISTS");
      }
      return await brandRepository.createBrand(input);
    } catch (err) {
      if (err instanceof Error && err.message === "SLUG_EXISTS") {
        throw err;
      }
      throw new Error("SERVER_ERROR");
    }
  },

  updateBrand: async (
    slug: string,
    input: UpdateBrandInput,
  ): Promise<brands> => {
    try {
      return await brandRepository.updateBrandBySlug(slug, input);
    } catch (err) {
      // Bắt mã lỗi của Prisma khi không tìm thấy bản ghi (P2025)
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2025"
      ) {
        throw new Error("NOT_FOUND");
      }

      throw new Error("SERVER_ERROR");
    }
  },

  deleteBrand: async (slug: string): Promise<brands> => {
    try {
      return await brandRepository.deleteBrandBySlug(slug);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        // Trường hợp 1: Slug không tồn tại trong DB
        if (err.code === "P2025") {
          throw new Error("NOT_FOUND");
        }

        // Trường hợp 2: Brand này đang có sản phẩm thuộc về nó, không được xóa bừa bãi
        if (err.code === "P2003") {
          throw new Error("BRAND_HAS_PRODUCTS");
        }
      }
      throw new Error("SERVER_ERROR");
    }
  },
};
