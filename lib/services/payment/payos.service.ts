import { payOS } from "@/lib/payos/payos";
import type { Webhook } from "@payos/node";

export type PayOSPaymentItem = {
  name: string;
  quantity: number;
  price: number;
};

export type CreatePayOSPaymentInput = {
  orderCode: number;
  amount: number;
  description: string;
  items: PayOSPaymentItem[];
};

export const payOSService = {
  // Tạo payment link PayOS
  createPaymentLink(input: CreatePayOSPaymentInput) {
    return payOS.paymentRequests.create({
      orderCode: input.orderCode,
      amount: input.amount,
      description: input.description,
      items: input.items,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel`,
      returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
    });
  },

  // Xác thực dữ liệu webhook PayOS
  verifyWebhook(data: Webhook) {
    return payOS.webhooks.verify(data);
  },
};
