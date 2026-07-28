export type CreateProductInput = {
  serie_id: number;
  name: string;
  slug: string;
  description: string;
};

export type UpdateProductInput = Partial<CreateProductInput>;
