export type CreateOrderItemInput = {
  order_id: number;
  variant_id: number;
  product_name: string;
  sku: string;
  variant_info: string;
  price: number;
  quantity: number;
  total_price: number;
};

export type CreateOrderInput = {
  user_id: number;
  recipient_name: string;
  recipient_phone: string;
  shipping_address: string;
  note?: string;
  subtotal: number;
  shipping_fee: number;
  total_amount: number;
  payment_method: "COD" | "PAYOS";
};
