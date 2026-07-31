// lại bỏ các trường tự sinh (id)
export type CreateProductSpecInput = {
  product_id: number;
  spec_key_id: number;
  spec_value: string;
  unit_id: number;
};
export type UpdateProductSpecInput = Partial<
  Omit<CreateProductSpecInput, "product_id" | "spec_key_id">
>;
