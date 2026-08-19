// app/payment/cancel/page.tsx

"use client";

import { XCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";

function PaymentCancelContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const hasCalledApi = useRef(false);

  useEffect(() => {
    if (!orderId || hasCalledApi.current) {
      return;
    }

    hasCalledApi.current = true;

    const cancelOrder = async () => {
      try {
        const response = await fetch(`/api/users/order/${orderId}/cancel`, {
          method: "PATCH",
        });

        const data = await response.json();

        if (!response.ok) {
          console.error("Hủy đơn thất bại:", data.message);
          return;
        }

        console.log("Đã hủy đơn:", data.data);
      } catch (error) {
        console.error("Lỗi khi hủy đơn:", error);
      }
    };

    cancelOrder();
  }, [orderId]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center border border-gray-100">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-red-50 p-3">
            <XCircle className="w-12 h-12 text-red-500" />
          </div>
        </div>

        <h1 className="text-xl font-bold text-gray-900 mb-2">
          Thanh toán đã bị hủy
        </h1>

        <p className="text-gray-600 text-sm mb-6">
          Giao dịch đã bị hủy hoặc không thành công. Bạn có thể thử lại sau.
        </p>

        <Link
          href="/"
          className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-xl transition-colors text-sm"
        >
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}

export default function PaymentCancelPage() {
  return (
    <Suspense fallback={null}>
      <PaymentCancelContent />
    </Suspense>
  );
}
