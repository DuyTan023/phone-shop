// components/checkout/payment-method.tsx

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Wallet } from "lucide-react";

type PaymentMethodValue = "COD" | "PAYOS";

type PaymentMethodProps = {
  value: PaymentMethodValue;
  onChange: (value: PaymentMethodValue) => void;
};

export function PaymentMethod({ value, onChange }: PaymentMethodProps) {
  const methods = [
    {
      value: "COD" as const,
      title: "Thanh toán khi nhận hàng (COD)",
      description: "Thanh toán bằng tiền mặt khi nhận hàng",
      icon: Wallet,
    },
    {
      value: "PAYOS" as const,
      title: "Thanh toán qua PayOS",
      description: "Thanh toán trực tuyến an toàn qua cổng PayOS",
      icon: CreditCard,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">4. Phương thức thanh toán</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {methods.map((method) => {
          const Icon = method.icon;
          const isSelected = value === method.value;

          return (
            <button
              key={method.value}
              type="button"
              onClick={() => {
                console.log("Đã chọn phương thức:", method.value); // Thêm log để kiểm tra F12
                onChange(method.value);
              }}
              className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all duration-200 cursor-pointer ${
                isSelected
                  ? "border-blue-600 bg-blue-50/60 shadow-sm ring-1 ring-blue-600"
                  : "border-slate-200 hover:bg-slate-50/80"
              }`}
            >
              {/* Icon container */}
              <span
                className={`flex size-11 shrink-0 items-center justify-center rounded-xl transition-colors ${
                  isSelected
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                <Icon className="size-5" />
              </span>

              {/* Title & Description */}
              <span className="min-w-0 flex-1">
                <span
                  className={`block text-sm font-semibold ${isSelected ? "text-blue-900" : "text-slate-800"}`}
                >
                  {method.title}
                </span>
                <span className="mt-0.5 block text-xs text-slate-500">
                  {method.description}
                </span>
              </span>

              {/* Radio Circle custom */}
              <span
                className={`flex size-5 items-center justify-center rounded-full border transition-all ${
                  isSelected
                    ? "border-blue-600 bg-blue-600"
                    : "border-slate-300 bg-white"
                }`}
              >
                {isSelected && (
                  <span className="size-2 rounded-full bg-white" />
                )}
              </span>
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}
