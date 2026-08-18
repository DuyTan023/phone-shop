// components/checkout/order-summary.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ReceiptText, ShieldCheck, Truck } from "lucide-react";

type OrderSummaryProps = {
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  onPlaceOrder: () => void;
  isLoading?: boolean; // Thêm trạng thái loading nếu cần
};

const formatPrice = (price: number) => {
  return `${price.toLocaleString("vi-VN")}đ`;
};

export function OrderSummary({
  subtotal,
  shippingFee,
  totalAmount,
  onPlaceOrder,
  isLoading = false,
}: OrderSummaryProps) {
  return (
    <Card className="lg:sticky lg:top-6 overflow-hidden rounded-2xl border-slate-200/80 shadow-md transition-all">
      {/* Header với điểm nhấn màu sắc nhẹ nhàng */}
      <CardHeader className="bg-slate-50/70 border-b border-slate-100 py-4 px-6">
        <CardTitle className="flex items-center gap-2.5 text-base font-bold text-slate-900">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <ReceiptText className="size-4" />
          </div>
          Tóm tắt đơn hàng
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6 space-y-5">
        {/* Nhóm thông tin chi phí */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between gap-4 text-sm text-slate-600">
            <span>Tạm tính sản phẩm</span>
            <span className="font-semibold text-slate-800">
              {formatPrice(subtotal)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 text-sm text-slate-600">
            <span className="flex items-center gap-1.5">
              <Truck className="size-4 text-slate-400" />
              Phí vận chuyển
            </span>
            <span
              className={`font-semibold ${shippingFee === 0 ? "text-emerald-600" : "text-slate-800"}`}
            >
              {shippingFee === 0 ? "Miễn phí" : formatPrice(shippingFee)}
            </span>
          </div>
        </div>

        <Separator className="bg-slate-100" />

        {/* Tổng tiền nổi bật */}
        <div className="rounded-xl bg-blue-50/50 p-4 border border-blue-100/60 flex items-center justify-between gap-4">
          <div>
            <span className="block text-xs font-medium text-slate-500 uppercase tracking-wide">
              Tổng thanh toán
            </span>
            <span className="text-xs text-slate-400">
              (Đã bao gồm VAT nếu có)
            </span>
          </div>
          <span className="text-2xl font-black text-blue-600 tracking-tight">
            {formatPrice(totalAmount)}
          </span>
        </div>

        {/* Nút đặt hàng thiết kế mạnh mẽ */}
        <Button
          type="button"
          size="lg"
          disabled={isLoading || totalAmount <= 0}
          className="w-full h-12 rounded-xl text-base text-white font-bold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all duration-200 cursor-pointer active:scale-[0.98]"
          onClick={onPlaceOrder}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Đang xử lý đơn hàng...
            </div>
          ) : (
            `Đặt hàng ngay · ${formatPrice(totalAmount)}`
          )}
        </Button>

        {/* Cam kết / Chính sách bảo mật nhỏ bên dưới */}
        <div className="flex items-center justify-center gap-2 pt-1 text-xs text-slate-400">
          <ShieldCheck className="size-4 text-emerald-500 shrink-0" />
          <span>Thanh toán an toàn & bảo mật tuyệt đối</span>
        </div>
      </CardContent>
    </Card>
  );
}
