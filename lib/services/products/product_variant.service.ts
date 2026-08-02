import { type product_variants } from "@/app/generated/prisma/client";
import type {
  CreateProductVariantInput,
  UpdateProductVariantInput,
} from "@/lib/types/products/product_variant.type";
import type { PaginationResult } from "@/lib/types/public/types";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import {
  ProductVariant,
  productVariantRepository,
} from "./../../repositories/product/products_variant.repository";
type GetProductVariantParams = {
  page?: number;
  limit?: number;
  keyword?: string;
};

export const productVariantService = {
  GetProductVariant: async ({
    page = 1,
    limit = 10,
    keyword,
  }: GetProductVariantParams): Promise<PaginationResult<ProductVariant>> => {
    try {
      const { product_variants, total } =
        await productVariantRepository.findMany({
          page,
          limit,
          keyword,
        });
      return {
        data: product_variants,
        total: total,
        page: page,
        limit,
        totalPage: Math.ceil(total / limit),
      };
    } catch (err) {
      throw new Error("Không thể lấy danh sách sản phẩm: " + err);
    }
  },

  getProductVariantById: async (id: number): Promise<ProductVariant> => {
    try {
      const product_variant = await productVariantRepository.findById(id);
      if (!product_variant) throw new Error("NOT_FOUND");
      return product_variant;
    } catch (err) {
      if (err instanceof Error && err.message === "NOT_FOUND") throw err;
      throw new Error("SERVER_ERROR");
    }
  },

  getProductVariantByProductId: async (
    product_id: number,
  ): Promise<ProductVariant[]> => {
    try {
      const product_variants =
        await productVariantRepository.findByProductId(product_id);
      if (!product_variants) throw new Error("NOT_FOUND");
      return product_variants;
    } catch (err) {
      if (err instanceof Error && err.message === "NOT_FOUND") throw err;
      throw new Error("SERVER_ERROR");
    }
  },

  getProductVariantBySku: async (sku: string): Promise<ProductVariant> => {
    try {
      const product_variant = await productVariantRepository.findBySku(sku);
      if (!product_variant) throw new Error("NOT_FOUND");
      return product_variant;
    } catch (err) {
      if (err instanceof Error && err.message === "NOT_FOUND") throw err;
      throw new Error("SERVER_ERROR");
    }
  },
  createProductVariant: async (
    input: CreateProductVariantInput,
  ): Promise<product_variants> => {
    if (input.price < 0 || (input.cost_price && input.cost_price < 0)) {
      throw new Error("INVALID_PRICE");
    }
    if (input.stock < 0) {
      throw new Error("INVALID_STOCK");
    }

    try {
      const existing = await productVariantRepository.findProductVariantunique(
        input.product_id,
        input.color_id,
        input.storage_id,
        input.ram_id,
      );

      if (existing) {
        throw new Error("PRODUCT_VARIANT_EXISTS");
      }

      return await productVariantRepository.create(input);
    } catch (err) {
      if (err instanceof Error) {
        if (
          ["PRODUCT_VARIANT_EXISTS", "INVALID_PRICE", "INVALID_STOCK"].includes(
            err.message,
          )
        ) {
          throw err;
        }
      }

      if (err instanceof PrismaClientKnownRequestError) {
        if (err.code === "P2003") {
          throw new Error("RELATED_ENTITY_NOT_FOUND");
        }
      }

      throw new Error("SERVER_ERROR");
    }
  },

  updateProductVariant: async (
    id: number,
    input: UpdateProductVariantInput,
  ): Promise<product_variants> => {
    // Validate giá bán & tồn kho nếu có truyền vào
    if (input.price !== undefined && input.price < 0) {
      throw new Error("INVALID_PRICE");
    }
    if (input.stock !== undefined && input.stock < 0) {
      throw new Error("INVALID_STOCK");
    }

    try {
      // Kiểm tra biến thể có tồn tại không
      const currentProduct = await productVariantRepository.findById(id);
      if (!currentProduct) throw new Error("NOT_FOUND");

      const product_id = input.product_id ?? currentProduct.product_id;
      const color_id = input.color_id ?? currentProduct.color_id;
      const storage_id = input.storage_id ?? currentProduct.storage_id;
      const ram_id = input.ram_id ?? currentProduct.ram_id;

      const existing =
        await productVariantRepository.findProductVariantuniqueExceptId(
          id,
          product_id,
          color_id,
          storage_id,
          ram_id,
        );

      if (existing) throw new Error("PRODUCT_VARIANT_EXISTS");

      return await productVariantRepository.update(id, input);
    } catch (err) {
      if (
        err instanceof Error &&
        [
          "NOT_FOUND",
          "PRODUCT_VARIANT_EXISTS", // Sửa từ PRODUCT_EXISTS thành PRODUCT_VARIANT_EXISTS
          "INVALID_PRICE",
          "INVALID_STOCK",
        ].includes(err.message)
      ) {
        throw err;
      }

      if (
        err instanceof PrismaClientKnownRequestError &&
        err.code === "P2003"
      ) {
        throw new Error("RELATED_ENTITY_NOT_FOUND");
      }

      throw new Error("SERVER_ERROR");
    }
  },
  deleteProduct: async (id: number): Promise<product_variants> => {
    try {
      return await productVariantRepository.deleteById(id);
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
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
