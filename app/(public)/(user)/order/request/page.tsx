"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Ban,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock3,
  CreditCard,
  Package,
  Phone,
  ShoppingBag,
  User,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type OrderItem = {
  id: number;
  product_name: string;
  quantity: number;
  price: string;
  image_url: string;
};

type Order = {
  id: number;
  recipient_name: string;
  recipient_phone: string;
  shipping_address: string;
  total_amount: string;
  status: string;
  payment_method: "COD" | "PAYOS";
  payment_status: string;
  order_items: OrderItem[];
};

type OrderRequest = {
  id: number;
  order_id: number;
  user_id: number;
  type: "CREATE_ORDER" | "CANCEL_ORDER";
  status: "PENDING" | "APPROVED" | "REJECTED";
  reason: string | null;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
  orders: Order;
};

const requestTypeConfig = {
  CREATE_ORDER: {
    label: "Xác nhận đơn hàng",
    icon: ShoppingBag,
    className: "bg-blue-50 text-blue-700 border border-blue-200",
  },
  CANCEL_ORDER: {
    label: "Yêu cầu hủy đơn",
    icon: Ban,
    className: "bg-orange-50 text-orange-700 border border-orange-200",
  },
};

const requestStatusConfig = {
  PENDING: {
    label: "Đang chờ xử lý",
    icon: Clock3,
    className: "bg-amber-50 text-amber-700 border border-amber-200",
  },
  APPROVED: {
    label: "Đã chấp nhận",
    icon: CheckCircle2,
    className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  },
  REJECTED: {
    label: "Đã từ chối",
    icon: XCircle,
    className: "bg-rose-50 text-rose-700 border border-rose-200",
  },
};

export default function OrderRequestList() {
  const [data, setData] = useState<OrderRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/users/order/request", {
          cache: "no-store",
        });

        const result = await res.json();

        if (!res.ok || !result.success) {
          throw new Error(result.message || "Không thể tải danh sách yêu cầu");
        }

        setData(result.data || []);
      } catch (error) {
        console.error("Lỗi khi fetch order requests:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const pendingCount = data.filter((item) => item.status === "PENDING").length;

  const approvedCount = data.filter(
    (item) => item.status === "APPROVED",
  ).length;

  const rejectedCount = data.filter(
    (item) => item.status === "REJECTED",
  ).length;

  const formatCurrency = (value: string) => {
    return Number(value).toLocaleString("vi-VN") + "₫";
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat("vi-VN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(date));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />

          <p className="text-sm text-slate-500">Đang tải yêu cầu...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col gap-2 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center shadow-sm">
              <ClipboardList className="w-5 h-5 text-white" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Yêu cầu đơn hàng
              </h1>

              <p className="text-sm text-slate-500 mt-0.5">
                Theo dõi trạng thái xác nhận và hủy đơn hàng của bạn
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <p className="text-sm text-slate-500">Tổng yêu cầu</p>

            <p className="text-2xl font-bold text-slate-900 mt-2">
              {data.length}
            </p>
          </div>

          <div className="bg-white border border-amber-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">Đang chờ</p>

              <Clock3 className="w-4 h-4 text-amber-500" />
            </div>

            <p className="text-2xl font-bold text-amber-600 mt-2">
              {pendingCount}
            </p>
          </div>

          <div className="bg-white border border-emerald-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">Đã chấp nhận</p>

              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>

            <p className="text-2xl font-bold text-emerald-600 mt-2">
              {approvedCount}
            </p>
          </div>

          <div className="bg-white border border-rose-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">Đã từ chối</p>

              <XCircle className="w-4 h-4 text-rose-500" />
            </div>

            <p className="text-2xl font-bold text-rose-600 mt-2">
              {rejectedCount}
            </p>
          </div>
        </div>

        {data.length > 0 ? (
          <div className="space-y-4">
            {data.map((item) => {
              const typeConfig = requestTypeConfig[item.type];

              const statusConfig = requestStatusConfig[item.status];

              const TypeIcon = typeConfig.icon;
              const StatusIcon = statusConfig.icon;

              return (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  {/* TOP */}

                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 border-b border-slate-100">
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                        <Package className="w-5 h-5 text-slate-600" />
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="font-bold text-slate-900">
                            Đơn hàng #{item.order_id}
                          </h2>

                          <Badge className={typeConfig.className}>
                            <TypeIcon className="w-3.5 h-3.5 mr-1" />

                            {typeConfig.label}
                          </Badge>

                          <Badge className={statusConfig.className}>
                            <StatusIcon className="w-3.5 h-3.5 mr-1" />

                            {statusConfig.label}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <CalendarDays className="w-3.5 h-3.5" />

                            {formatDate(item.created_at)}
                          </span>

                          <span className="flex items-center gap-1">
                            <ShoppingBag className="w-3.5 h-3.5" />
                            {item.orders.order_items.length} sản phẩm
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex lg:items-end gap-4 lg:flex-col">
                      <div>
                        <p className="text-xs text-slate-500">
                          Tổng thanh toán
                        </p>

                        <p className="text-lg font-bold text-blue-600">
                          {formatCurrency(item.orders.total_amount)}
                        </p>
                      </div>

                      <Link href={`/order/${item.order_id}`}>
                        <Button
                          size="sm"
                          className="rounded-xl bg-blue-600 hover:bg-blue-700"
                        >
                          Xem đơn hàng
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* BODY */}

                  <div className="grid md:grid-cols-3 gap-6 p-5">
                    {/* CUSTOMER */}

                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
                        Thông tin người nhận
                      </p>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-slate-700">
                          <User className="w-4 h-4 text-slate-400" />

                          <span>{item.orders.recipient_name}</span>
                        </div>

                        <div className="flex items-center gap-2 text-slate-700">
                          <Phone className="w-4 h-4 text-slate-400" />

                          <span>{item.orders.recipient_phone}</span>
                        </div>
                      </div>
                    </div>

                    {/* PAYMENT */}

                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
                        Thanh toán
                      </p>

                      <div className="flex items-center gap-2 text-sm text-slate-700">
                        <CreditCard className="w-4 h-4 text-slate-400" />

                        <div>
                          <p className="font-medium">
                            {item.orders.payment_method === "COD"
                              ? "Thanh toán khi nhận hàng"
                              : "Thanh toán PayOS"}
                          </p>

                          <p className="text-xs text-slate-500 mt-0.5">
                            Trạng thái: {item.orders.payment_status}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* REASON */}

                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
                        Nội dung yêu cầu
                      </p>

                      <p className="text-sm text-slate-600 leading-relaxed">
                        {item.reason ||
                          (item.type === "CREATE_ORDER"
                            ? "Yêu cầu xác nhận đơn hàng."
                            : "Yêu cầu hủy đơn hàng.")}
                      </p>
                    </div>
                  </div>

                  {/* ADMIN NOTE */}

                  {item.admin_note && (
                    <div className="mx-5 mb-5 rounded-xl bg-slate-50 border border-slate-200 p-4">
                      <p className="text-xs font-semibold text-slate-500 mb-1">
                        Phản hồi từ quản trị viên
                      </p>

                      <p className="text-sm text-slate-700">
                        {item.admin_note}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white border border-dashed border-slate-300 rounded-2xl py-20 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <ClipboardList className="w-6 h-6 text-slate-400" />
            </div>

            <h3 className="font-semibold text-slate-800">
              Chưa có yêu cầu nào
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              Các yêu cầu xác nhận hoặc hủy đơn hàng sẽ xuất hiện tại đây.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
