export type CreateSerieInput = {
  brand_id: number;
  name: string;
  slug: string;
  release_year: number;
};

export type UpdateSerieInput = Partial<CreateSerieInput>;
