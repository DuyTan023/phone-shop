import type { Decimal } from "@prisma/client/runtime/client";

export type CreateProductVariantInput = {
  product_id: number;
  color_id: number;
  storage_id: number;
  ram_id: number;
  price: Decimal; // Giá bán
  cost_price: Decimal; // Giá nhập
  stock: number; // Số lượng tồn kho (đã sửa từ srock)
  status?: boolean; // Mặc định true nếu không truyền
  is_default?: boolean; // Biến thể mặc định (Boolean? trong Prisma nên để optional)
};

export type UpdateProductVariantInput = Partial<CreateProductVariantInput>;
