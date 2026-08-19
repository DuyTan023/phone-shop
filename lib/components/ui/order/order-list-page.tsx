// lib/components/ui/order/order-list-page.tsx

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { CalendarDays, ChevronRight, Clock, Home, Package } from "lucide-react";

import type { ApiResponse } from "@/lib/types/public/types";
import Image from "next/image";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

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

type OrderFilter =
  | "ALL"
  | "PENDING"
  | "CONFIRMED"
  | "SHIPPING"
  | "COMPLETED"
  | "CANCELLED";

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
        label: "Thanh toán thất bại",
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

export function OrderListPage() {
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedFilter, setSelectedFilter] = useState<OrderFilter>("PENDING");

  // =========================
  // LOAD ORDERS
  // =========================

  useEffect(() => {
    let isMounted = true;

    async function fetchOrders() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/users/order");

        const result: ApiResponse<Order[]> = await response.json();

        if (!response.ok || !result.success || !result.data) {
          throw new Error(result.message || "Không thể tải danh sách đơn hàng");
        }

        if (isMounted) {
          setOrders(result.data);
        }
      } catch (error) {
        if (isMounted) {
          setError(
            error instanceof Error
              ? error.message
              : "Không thể tải danh sách đơn hàng",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchOrders();

    return () => {
      isMounted = false;
    };
  }, []);

  // =========================
  // FILTER ORDERS
  // =========================

  const filteredOrders = useMemo(() => {
    if (selectedFilter === "ALL") {
      return orders;
    }

    return orders.filter((order) => order.status === selectedFilter);
  }, [orders, selectedFilter]);

  const orderCounts = useMemo(() => {
    return {
      ALL: orders.length,
      PENDING: orders.filter((order) => order.status === "PENDING").length,
      CONFIRMED: orders.filter((order) => order.status === "CONFIRMED").length,
      SHIPPING: orders.filter((order) => order.status === "SHIPPING").length,
      COMPLETED: orders.filter((order) => order.status === "COMPLETED").length,
      CANCELLED: orders.filter((order) => order.status === "CANCELLED").length,
    };
  }, [orders]);

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <main className="min-h-screen bg-muted/30">
        <div className="mx-auto flex min-h-[60vh] max-w-5xl items-center justify-center">
          <div className="text-sm text-muted-foreground">
            Đang tải đơn hàng...
          </div>
        </div>
      </main>
    );
  }

  // =========================
  // ERROR
  // =========================

  if (error) {
    return (
      <main className="min-h-screen bg-muted/30">
        <div className="mx-auto flex min-h-[60vh] max-w-5xl items-center justify-center px-4">
          <Card className="w-full max-w-md">
            <CardContent className="py-10 text-center">
              <Package className="mx-auto mb-4 size-10 text-muted-foreground" />

              <h2 className="text-lg font-semibold">Không thể tải đơn hàng</h2>

              <p className="mt-2 text-sm text-muted-foreground">{error}</p>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  // =========================
  // RENDER
  // =========================

  return (
    <main className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Breadcrumb>
            <BreadcrumbList className="flex items-center gap-1.5 sm:gap-2.5 text-sm font-medium">
              {/* Trang chủ kèm Icon Home */}
              <BreadcrumbItem>
                <BreadcrumbLink
                  href="/"
                  className="group flex items-center gap-1.5 text-slate-500 hover:text-blue-600 transition-colors bg-slate-100/70 hover:bg-blue-50 px-3 py-1.5 rounded-xl border border-slate-200/60"
                >
                  <Home className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                  <span>Trang chủ</span>
                </BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbSeparator>
                <ChevronRight className="w-4 h-4 text-slate-300" />
              </BreadcrumbSeparator>

              {/* Tên sản phẩm ở cuối */}
              <BreadcrumbItem>
                <BreadcrumbPage className="max-w-[200px] sm:max-w-xs md:max-w-md truncate font-bold text-blue-600 bg-blue-50/80 border border-blue-100 px-3 py-1.5 rounded-xl">
                  Đơn hàng
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">
            Đơn hàng của tôi
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Quản lý và theo dõi các đơn hàng của bạn
          </p>
        </div>

        {/* Filter */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex min-w-max gap-2">
            {[
              { value: "ALL", label: "Tất cả" },
              { value: "PENDING", label: "Chờ xử lý" },
              { value: "CONFIRMED", label: "Đã xác nhận" },
              { value: "SHIPPING", label: "Đang giao" },
              { value: "COMPLETED", label: "Đã giao" },
              { value: "CANCELLED", label: "Đã hủy" },
            ].map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setSelectedFilter(filter.value as OrderFilter)}
                className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition ${
                  selectedFilter === filter.value
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "bg-background text-muted-foreground hover:bg-muted"
                }`}
              >
                <span>{filter.label}</span>

                <span
                  className={`min-w-5 rounded-full px-1.5 py-0.5 text-center text-xs font-bold ${
                    selectedFilter === filter.value
                      ? "bg-white text-blue-600"
                      : "bg-red-500 text-white"
                  }`}
                >
                  {orderCounts[filter.value as OrderFilter]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Empty */}
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="flex min-h-[300px] flex-col items-center justify-center text-center">
              <Package className="mb-4 size-12 text-muted-foreground" />

              <h2 className="text-lg font-semibold">
                {orders.length === 0
                  ? "Bạn chưa có đơn hàng nào"
                  : "Không có đơn hàng phù hợp"}
              </h2>

              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                {orders.length === 0
                  ? "Các đơn hàng bạn đặt sẽ được hiển thị tại đây."
                  : "Thử chọn một trạng thái khác để xem đơn hàng."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order, index) => {
              const orderStatus = getOrderStatus(order.status);
              const paymentStatus = getPaymentStatus(order.payment_status);

              const totalQuantity = order.order_items.reduce(
                (sum, item) => sum + item.quantity,
                0,
              );

              return (
                <Card key={order.id} className="overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <CardTitle className="text-base">
                          Đơn hàng #{index + 1}
                        </CardTitle>

                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <CalendarDays className="size-3.5" />
                            {formatDate(order.created_at)}
                          </span>

                          <span>•</span>

                          <span>{totalQuantity} sản phẩm</span>
                        </div>
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
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Products */}
                    <div className="space-y-3">
                      {order.order_items.slice(0, 3).map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-4"
                        >
                          {/* LEFT: Ảnh + thông tin */}
                          <div className="flex min-w-0 items-center gap-3">
                            {/* Image */}
                            <div className="relative size-16 shrink-0 overflow-hidden rounded-lg border bg-white">
                              {item.image_url ? (
                                <Image
                                  src={item.image_url}
                                  alt={item.product_name}
                                  fill
                                  className="object-contain p-1"
                                  sizes="64px"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <Package className="size-6 text-muted-foreground" />
                                </div>
                              )}
                            </div>

                            {/* Product info */}
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold">
                                {item.product_name}
                              </p>

                              <p className="mt-1 truncate text-xs text-muted-foreground">
                                {item.variant_info}
                              </p>

                              <p className="mt-1 text-xs text-muted-foreground">
                                {formatPrice(item.price)} × {item.quantity}
                              </p>
                            </div>
                          </div>

                          {/* Total */}
                          <span className="shrink-0 text-sm font-semibold">
                            {formatPrice(item.total_price)}
                          </span>
                        </div>
                      ))}

                      {order.order_items.length > 3 && (
                        <p className="text-xs text-muted-foreground">
                          + {order.order_items.length - 3} sản phẩm khác
                        </p>
                      )}
                    </div>

                    <Separator />

                    {/* Bottom */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">
                          Tổng thanh toán
                        </p>

                        <p className="text-lg font-bold text-blue-600">
                          {formatPrice(order.total_amount)}
                        </p>

                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="size-3.5" />

                          {order.payment_method === "COD"
                            ? "Thanh toán khi nhận hàng"
                            : "Thanh toán PayOS"}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => router.push(`/order/${order.id}`)}
                        className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                      >
                        Xem chi tiết
                        <ChevronRight className="size-4" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
