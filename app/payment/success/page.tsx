// app/payment/success/page.tsx

import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center border border-gray-100">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-green-50 p-3">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          Thanh toán thành công!
        </h1>
        <p className="text-gray-600 text-sm mb-6">
          Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đã được thanh toán thành
          công.
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
