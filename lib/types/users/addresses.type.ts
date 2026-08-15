export type CreateUserAddressesInput = {
  user_id: number;
  recipient_name: string;
  phone: string;
  province_id: number;
  commune_id: number;
  address_line: string;
  note?: string;
  is_default?: boolean;
};

export type UpdateUserAddressesInput = Partial<
  Omit<CreateUserAddressesInput, "user_id">
>;
