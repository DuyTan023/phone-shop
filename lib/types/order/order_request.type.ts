export type CreateOrderRequestInput = {
  order_id: number;
  user_id: number;
  type: "CREATE_ORDER" | "CANCEL_ORDER";
  reason?: string;
};

export type UpdateOrderRequestInput = {
  status: "APPROVED" | "REJECTED";
  admin_note?: string;
};
