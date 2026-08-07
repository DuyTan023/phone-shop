import type { product_specs } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  Product_Spec,
  productSpecRepository,
} from "@/lib/repositories/product/product_spec.repository";
import type {
  CreateProductSpecInput,
  UpdateProductSpecInput,
} from "@/lib/types/products/product_spec.type";
import type { PaginationResult } from "@/lib/types/public/types";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";

type GetProductSpecParams = {
  page?: number;
  limit?: number;
  keyword?: string;
};

export interface GroupedProductSpec {
  groupId: number;
  groupName: string;
  specs: Product_Spec[];
}
export const productSpecService = {
  GetProductSpec: async ({
    page = 1,
    limit = 10,
    keyword,
  }: GetProductSpecParams): Promise<PaginationResult<Product_Spec>> => {
    try {
      const { product_specs, total } = await productSpecRepository.findMany({
        page,
        limit,
        keyword,
      });
      return {
        data: product_specs,
        total: total,
        page: page,
        limit,
        totalPage: Math.ceil(total / limit),
      };
    } catch (err) {
      throw new Error("Không thể lấy danh sách sản phẩm: " + err);
    }
  },

  getProductSpecById: async (id: number): Promise<Product_Spec> => {
    try {
      const product_spec = await productSpecRepository.findById(id);
      if (!product_spec) throw new Error("NOT_FOUND");
      return product_spec;
    } catch (err) {
      if (err instanceof Error && err.message === "NOT_FOUND") throw err;
      throw new Error("SERVER_ERROR");
    }
  },

  getProductSpec: async (product_id: number): Promise<Product_Spec> => {
    try {
      const product_spec =
        await productSpecRepository.findByProductId(product_id);
      if (!product_spec) throw new Error("NOT_FOUND");
      return product_spec;
    } catch (err) {
      if (err instanceof Error && err.message === "NOT_FOUND") throw err;
      throw new Error("SERVER_ERROR");
    }
  },

  getProductSpecsGrouped: async (
    product_Id: number,
  ): Promise<GroupedProductSpec[]> => {
    const productExists = await prisma.products.findUnique({
      where: { id: product_Id },
      select: { id: true },
    });

    if (!productExists) {
      throw new Error(`Sản phẩm với ID ${product_Id} không tồn tại.`);
    }

    // 2. Lấy dữ liệu gom nhóm từ Repository
    const groupedSpecs =
      await productSpecRepository.getProductSpecsGroupedByGroup(product_Id);

    return groupedSpecs;
  },

  createProductSpec: async (
    input: CreateProductSpecInput,
  ): Promise<product_specs> => {
    try {
      const existing = await productSpecRepository.findByProductSpec(
        input.product_id,
        input.spec_key_id,
      );
      if (existing) throw new Error("PRODUCT_SPEC_EXISTS");
      return await productSpecRepository.createProductSpec(input);
    } catch (err) {
      if (err instanceof Error && err.message === "PRODUCT_SPEC_EXISTS")
        throw err;
      if (err instanceof PrismaClientKnownRequestError && err.code === "P2003")
        throw new Error("RELATED_ENTITY_NOT_FOUND");
      throw new Error("SERVER_ERROR");
    }
  },
  updateProductSpec: async (
    id: number,
    input: UpdateProductSpecInput,
  ): Promise<product_specs> => {
    try {
      const currentProductSpec = await productSpecRepository.findById(id);
      if (!currentProductSpec) throw new Error("NOT_FOUND");
      return await productSpecRepository.updateProductSpec(id, input);
    } catch (err) {
      if (err instanceof Error && err.message === "NOT_FOUND") throw err;
      if (
        err instanceof PrismaClientKnownRequestError &&
        err.code === "P2003"
      ) {
        throw new Error("RELATED_ENTITY_NOT_FOUND");
      }
      throw new Error("SERVER_ERROR");
    }
  },

  deleteProductSpec: async (id: number): Promise<product_specs> => {
    try {
      return await productSpecRepository.deleteById(id);
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
