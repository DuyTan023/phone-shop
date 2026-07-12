// lại bỏ các trường tự sinh (id)
export type CreateBrandInput = {
  name: string;
  slug: string;
  logo: string;
  description: string;
};

export type UpdateBrandInput = Partial<Omit<CreateBrandInput, "slug">>;
