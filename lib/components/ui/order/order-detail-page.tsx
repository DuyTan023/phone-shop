"use client";

import { useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  Clock,
  MapPin,
  Package,
  Phone,
  User,
} from "lucide-react";

import type { ApiResponse } from "@/lib/types/public/types";
import Image from "next/image";
import type { CheckoutItem } from "../product_manager/ProductDetail";

type OrderItem = {
  id: number;
  order_id: number;
  variant_id: number;
  product_name: string;
  sku: string;
  variant_info: string;
  price: number | string;
  quantity: number;
  total_price: number | string;
  image_url: string;
};

type Order = {
  id: number;
  user_id: number;

  recipient_name: string;
  recipient_phone: string;
  shipping_address: string;
  note: string | null;

  subtotal: number | string;
  shipping_fee: number | string;
  total_amount: number | string;

  payment_method: "COD" | "PAYOS";
  payment_status: "UNPAID" | "PENDING" | "PAID" | "REFUNDED";

  status: "PENDING" | "CONFIRMED" | "SHIPPING" | "COMPLETED" | "CANCELLED";

  payment_order_code: string | null;
  payment_link_id: string | null;
  payment_reference: string | null;
  paid_at: string | null;

  created_at: string;
  updated_at: string;

  order_items: OrderItem[];
};

type OrderDetailPageProps = {
  orderId: number;
  userId: number;
};

const formatPrice = (value: number | string) => {
  return `${Number(value).toLocaleString("vi-VN")}đ`;
};

const formatDate = (value: string) => {
  return new Date(value).toLocaleString("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const getOrderStatus = (status: Order["status"]) => {
  switch (status) {
    case "PENDING":
      return {
        label: "Chờ xử lý",
        className: "bg-yellow-100 text-yellow-700",
      };

    case "CONFIRMED":
      return {
        label: "Đã xác nhận",
        className: "bg-blue-100 text-blue-700",
      };

    case "SHIPPING":
      return {
        label: "Đang giao hàng",
        className: "bg-purple-100 text-purple-700",
      };

    case "COMPLETED":
      return {
        label: "Đã giao hàng",
        className: "bg-green-100 text-green-700",
      };

    case "CANCELLED":
      return {
        label: "Đã hủy",
        className: "bg-red-100 text-red-700",
      };

    default:
      return {
        label: status,
        className: "bg-slate-100 text-slate-700",
      };
  }
};

const getPaymentStatus = (status: Order["payment_status"]) => {
  switch (status) {
    case "UNPAID":
      return {
        label: "Chưa thanh toán",
        className: "bg-yellow-100 text-yellow-700",
      };

    case "PENDING":
      return {
        label: "Đang chờ thanh toán",
        className: "bg-orange-100 text-orange-700",
      };

    case "PAID":
      return {
        label: "Đã thanh toán",
        className: "bg-green-100 text-green-700",
      };

    case "REFUNDED":
      return {
        label: "Đã hoàn tiền",
        className: "bg-purple-100 text-purple-700",
      };

    default:
      return {
        label: status,
        className: "bg-slate-100 text-slate-700",
      };
  }
};

export function OrderDetailPage({ orderId, userId }: OrderDetailPageProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchOrder() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`/api/users/order/${orderId}`);

        const result: ApiResponse<Order> = await response.json();

        if (!response.ok || !result.success || !result.data) {
          throw new Error(result.message || "Không thể tải thông tin đơn hàng");
        }

        if (isMounted) {
          setOrder(result.data);
        }
      } catch (error) {
        if (isMounted) {
          setError(
            error instanceof Error
              ? error.message
              : "Không thể tải thông tin đơn hàng",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchOrder();

    return () => {
      isMounted = false;
    };
  }, [orderId]);

  const handleCancelOrder = async () => {
    if (!order) return;
    const confirmed = window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này?");
    if (!confirmed) return;
    try {
      setIsCancelling(true);
      const response = await fetch(`/api/users/order/${order.id}/cancel`, {
        method: "PATCH",
      });
      const result: ApiResponse<Order> = await response.json();
      if (!response.ok || !result.success || !result.data) {
        throw new Error(result.message || "Không thể hủy đơn hàng");
      }
      setOrder(result.data);
      alert("Hủy đơn hàng thành công");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Không thể hủy đơn hàng");
    } finally {
      setIsCancelling(false);
    }
  };

  const handleReorder = () => {
    if (!order) return;

    try {
      if (order.order_items.length === 0) {
        alert("Đơn hàng không có sản phẩm để mua lại");
        return;
      }

      const checkoutItems: CheckoutItem[] = order.order_items.map((item) => ({
        variant_id: item.variant_id,
        product_name: item.product_name,
        sku: item.sku,
        variant_info: item.variant_info,
        price: Number(item.price),
        quantity: item.quantity,
        total_price: Number(item.total_price),
        image_url: item.image_url,
      }));

      console.log(
        "Dữ liệu Mua lại chuẩn bị lưu vào sessionStorage:",
        checkoutItems,
      );

      sessionStorage.setItem("checkout_items", JSON.stringify(checkoutItems));

      window.location.href = "/checkout";
    } catch (error) {
      console.error("Lỗi khi thực hiện Mua lại:", error);
      alert("Không thể tiến hành mua lại. Vui lòng thử lại!");
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-muted/30">
        <div className="mx-auto flex min-h-[60vh] max-w-5xl items-center justify-center">
          <div className="text-sm text-muted-foreground">
            Đang tải thông tin đơn hàng...
          </div>
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="min-h-screen bg-muted/30">
        <div className="mx-auto flex min-h-[60vh] max-w-5xl items-center justify-center px-4">
          <Card className="w-full max-w-md">
            <CardContent className="py-10 text-center">
              <Package className="mx-auto mb-4 size-10 text-muted-foreground" />

              <h2 className="text-lg font-semibold">Không tìm thấy đơn hàng</h2>

              <p className="mt-2 text-sm text-muted-foreground">
                {error || "Đơn hàng không tồn tại hoặc đã bị xóa."}
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  const orderStatus = getOrderStatus(order.status);
  const paymentStatus = getPaymentStatus(order.payment_status);

  const canCancel =
    order.status === "PENDING" && order.payment_status !== "PAID";

  const canReorder = order.status === "CANCELLED";

  return (
    <main className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Chi tiết đơn hàng
              </h1>

              <p className="mt-1 text-sm text-muted-foreground">
                Mã đơn hàng: #{order.id}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${orderStatus.className}`}
              >
                {orderStatus.label}
              </span>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${paymentStatus.className}`}
              >
                {paymentStatus.label}
              </span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          {/* LEFT */}
          <div className="space-y-6">
            {/* Thông tin người nhận */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <MapPin className="size-4" />
                  Thông tin nhận hàng
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

                  <div>
                    <p className="text-xs text-muted-foreground">Người nhận</p>

                    <p className="text-sm font-semibold">
                      {order.recipient_name}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Số điện thoại
                    </p>

                    <p className="text-sm font-medium">
                      {order.recipient_phone}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

                  <div>
                    <p className="text-xs text-muted-foreground">Địa chỉ</p>

                    <p className="text-sm font-medium">
                      {order.shipping_address}
                    </p>
                  </div>
                </div>

                {order.note && (
                  <>
                    <Separator />

                    <div>
                      <p className="text-xs text-muted-foreground">Ghi chú</p>

                      <p className="mt-1 text-sm">{order.note}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Sản phẩm */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Package className="size-4" />
                  Sản phẩm
                </CardTitle>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {order.order_items.map((item, index) => (
                    <div key={item.id}>
                      <div className="flex items-start justify-between gap-4">
                        {/* Ảnh + thông tin sản phẩm */}
                        <div className="flex min-w-0 flex-1 items-start gap-3">
                          {/* Image */}
                          <div className="relative size-20 shrink-0 overflow-hidden rounded-lg border bg-white">
                            {item.image_url ? (
                              <Image
                                src={item.image_url}
                                alt={item.product_name}
                                fill
                                className="object-contain p-1"
                                sizes="80px"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <Package className="size-7 text-muted-foreground" />
                              </div>
                            )}
                          </div>

                          {/* Product info */}
                          <div className="min-w-0">
                            <h3 className="text-sm font-semibold">
                              {item.product_name}
                            </h3>

                            <p className="mt-1 text-xs text-muted-foreground">
                              {item.variant_info}
                            </p>

                            <p className="mt-1 text-xs text-muted-foreground">
                              SKU: {item.sku}
                            </p>

                            <p className="mt-2 text-xs text-muted-foreground">
                              {formatPrice(item.price)} × {item.quantity}
                            </p>
                          </div>
                        </div>

                        {/* Tổng tiền item */}
                        <span className="shrink-0 text-sm font-semibold">
                          {formatPrice(item.total_price)}
                        </span>
                      </div>

                      {index < order.order_items.length - 1 && (
                        <Separator className="mt-4" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Thông tin thanh toán */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CheckCircle2 className="size-4" />
                  Thanh toán
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-muted-foreground">Phương thức</span>

                  <span className="font-medium">
                    {order.payment_method === "COD"
                      ? "Thanh toán khi nhận hàng"
                      : "PayOS"}
                  </span>
                </div>

                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-muted-foreground">
                    Trạng thái thanh toán
                  </span>

                  <span className="font-medium">{paymentStatus.label}</span>
                </div>

                {order.paid_at && (
                  <div className="flex justify-between gap-4 text-sm">
                    <span className="text-muted-foreground">
                      Thanh toán lúc
                    </span>

                    <span className="font-medium">
                      {formatDate(order.paid_at)}
                    </span>
                  </div>
                )}

                {order.payment_reference && (
                  <div className="flex justify-between gap-4 text-sm">
                    <span className="text-muted-foreground">Mã giao dịch</span>

                    <span className="font-medium">
                      {order.payment_reference}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* RIGHT */}
          <div className="space-y-6">
            <Card className="lg:sticky lg:top-6">
              <CardHeader>
                <CardTitle className="text-base">Tóm tắt đơn hàng</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tạm tính</span>

                  <span className="font-medium">
                    {formatPrice(order.subtotal)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Phí vận chuyển</span>

                  <span className="font-medium">
                    {Number(order.shipping_fee) === 0
                      ? "Miễn phí"
                      : formatPrice(order.shipping_fee)}
                  </span>
                </div>

                <Separator />

                <div className="flex items-center justify-between gap-4">
                  <span className="font-semibold">Tổng thanh toán</span>

                  <span className="text-xl font-black text-blue-600">
                    {formatPrice(order.total_amount)}
                  </span>
                </div>

                <Separator />

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="size-4 shrink-0" />

                  <span>Đặt lúc: {formatDate(order.created_at)}</span>
                </div>

                {canCancel && (
                  <button
                    type="button"
                    disabled={isCancelling}
                    onClick={handleCancelOrder}
                    className="w-full rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isCancelling ? "Đang hủy đơn..." : "Hủy đơn hàng"}
                  </button>
                )}

                {canReorder && (
                  <button
                    type="button"
                    onClick={handleReorder}
                    className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    Mua lại
                  </button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
