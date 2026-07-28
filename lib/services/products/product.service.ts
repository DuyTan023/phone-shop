import type { products } from "@/app/generated/prisma/client";
import {
  productRepository,
  type ProductWithSerie,
} from "@/lib/repositories/product/product.repository";
import type {
  CreateProductInput,
  UpdateProductInput,
} from "@/lib/types/products/product.type";
import { PaginationResult } from "@/lib/types/public/types";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";

type GetProductParams = {
  page?: number;
  limit?: number;
  keyword?: string;
};

export const productService = {
  GetProduct: async ({
    page = 1,
    limit = 10,
    keyword,
  }: GetProductParams): Promise<PaginationResult<ProductWithSerie>> => {
    try {
      const { products, total } = await productRepository.findMany({
        page,
        limit,
        keyword,
      });
      return {
        data: products,
        total: total,
        page: page,
        limit,
        totalPage: Math.ceil(total / limit),
      };
    } catch (err) {
      throw new Error("Không thể lấy danh sách sản phẩm: " + err);
    }
  },

  getProductById: async (id: number): Promise<ProductWithSerie> => {
    try {
      const product = await productRepository.findById(id);
      if (!product) throw new Error("NOT_FOUND");
      return product;
    } catch (err) {
      if (err instanceof Error && err.message === "NOT_FOUND") throw err;
      throw new Error("SERVER_ERROR");
    }
  },

  getProductBySlug: async (slug: string): Promise<ProductWithSerie> => {
    try {
      const product = await productRepository.findBySlug(slug);
      if (!product) throw new Error("NOT_FOUND");
      return product;
    } catch (err) {
      if (err instanceof Error && err.message === "NOT_FOUND") throw err;
      throw new Error("SERVER_ERROR");
    }
  },

  createProduct: async (input: CreateProductInput): Promise<products> => {
    try {
      const [existing, existingSlug] = await Promise.all([
        productRepository.findByNameSerieId(input.name, input.serie_id),
        productRepository.findBySlug(input.slug),
      ]);
      if (existing) throw new Error("PRODUCT_EXISTS");
      if (existingSlug) throw new Error("SLUG_EXISTS");
      return await productRepository.createProduct(input);
    } catch (err) {
      if (err instanceof Error && err.message === "PRODUCT_EXISTS") throw err;
      if (err instanceof Error && err.message === "SLUG_EXISTS") throw err;
      if (err instanceof PrismaClientKnownRequestError && err.code === "P2003")
        throw new Error("SERIE_NOT_FOUND");
      throw new Error("SERVER_ERROR");
    }
  },

  updateProduct: async (
    id: number,
    input: UpdateProductInput,
  ): Promise<products> => {
    try {
      const currentProduct = await productRepository.findById(id);
      if (!currentProduct) throw new Error("NOT_FOUND");

      // lấy dữ liêu khi cập nhật
      const name = input.name ?? currentProduct.name;
      const serie_id = input.serie_id ?? currentProduct.serie_id;
      const slug = input.slug ?? currentProduct.slug;

      // kiểm tra trùng
      const [existing, existingSlug] = await Promise.all([
        productRepository.findByNameSerieIdExceptId(id, name, serie_id),
        productRepository.findBySlugExceptId(id, slug),
      ]);

      if (existing) throw new Error("PRODUCT_EXISTS");
      if (existingSlug) throw new Error("SLUG_EXISTS");

      return await productRepository.updateProductById(id, input);
    } catch (err) {
      if (
        err instanceof Error &&
        ["NOT_FOUND", "PRODUCT_EXISTS", "SLUG_EXISTS"].includes(err.message)
      ) {
        throw err;
      }

      if (
        err instanceof PrismaClientKnownRequestError &&
        err.code === "P2003"
      ) {
        throw new Error("SERIE_NOT_FOUND");
      }

      throw new Error("SERVER_ERROR");
    }
  },
  deleteProduct: async (id: number): Promise<products> => {
    try {
      return await productRepository.deleteProductById(id);
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        if (err.code === "P2025") {
          throw new Error("NOT_FOUND");
        }
        if (err.code === "P2003") {
          throw new Error("PRODUCT_HAS_VARIANT");
        }
      }
      throw new Error("SERVER_ERROR");
    }
  },
};
