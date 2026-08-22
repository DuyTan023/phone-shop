"use client";

import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Package,
  ShoppingCart,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type RequestType = "CREATE_ORDER" | "CANCEL_ORDER";

type RequestStatus = "PENDING" | "APPROVED" | "REJECTED";

type PaymentMethod = "COD" | "PAYOS";

type PaymentStatus = "UNPAID" | "PENDING" | "PAID" | "REFUNDED";

interface OrderItem {
  id: number;
  order_id: number;
  variant_id: number;
  product_name: string;
  sku: string;
  variant_info: string;
  price: string;
  quantity: number;
  total_price: string;
  image_url: string;
}

interface Order {
  id: number;
  user_id: number;
  recipient_name: string;
  recipient_phone: string;
  shipping_address: string;
  note: string | null;
  subtotal: string;
  shipping_fee: string;
  total_amount: string;
  status: string;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  payment_order_code: string | null;
  payment_link_id: string | null;
  payment_reference: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
  order_items: OrderItem[];
}

interface User {
  id: number;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: string;
}

export interface OrderRequest {
  id: number;
  order_id: number;
  user_id: number;
  type: RequestType;
  status: RequestStatus;
  reason: string | null;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
  orders: Order;
  users: User;
}

interface OrderRequestDetailDialogProps {
  request: OrderRequest | null;
  onClose: () => void;
  onSuccess: () => void;
}

const formatMoney = (value: string | number) => {
  return `${Number(value).toLocaleString("vi-VN")}đ`;
};

const formatDate = (value: string) => {
  return new Date(value).toLocaleString("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  });
};

function RequestTypeBadge({ type }: { type: RequestType }) {
  if (type === "CREATE_ORDER") {
    return (
      <Badge
        variant="outline"
        className="gap-1.5 border-blue-200 bg-blue-50 text-blue-700"
      >
        <ShoppingCart className="h-3.5 w-3.5" />
        Xác nhận đơn
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="gap-1.5 border-orange-200 bg-orange-50 text-orange-700"
    >
      <XCircle className="h-3.5 w-3.5" />
      Yêu cầu hủy
    </Badge>
  );
}

function StatusBadge({ status }: { status: RequestStatus }) {
  if (status === "PENDING") {
    return (
      <Badge
        variant="outline"
        className="gap-1.5 border-amber-200 bg-amber-50 text-amber-700"
      >
        <Clock3 className="h-3.5 w-3.5" />
        Chờ xử lý
      </Badge>
    );
  }

  if (status === "APPROVED") {
    return (
      <Badge
        variant="outline"
        className="gap-1.5 border-emerald-200 bg-emerald-50 text-emerald-700"
      >
        <CheckCircle2 className="h-3.5 w-3.5" />
        Đã duyệt
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="gap-1.5 border-red-200 bg-red-50 text-red-700"
    >
      <XCircle className="h-3.5 w-3.5" />
      Đã từ chối
    </Badge>
  );
}

function PaymentBadge({
  method,
  status,
}: {
  method: PaymentMethod;
  status: PaymentStatus;
}) {
  if (method === "COD") {
    if (status === "PAID") {
      return (
        <Badge
          variant="outline"
          className="border-emerald-200 bg-emerald-50 text-emerald-700"
        >
          COD · Đã thanh toán
        </Badge>
      );
    }

    return (
      <Badge
        variant="outline"
        className="border-orange-200 bg-orange-50 text-orange-700"
      >
        COD · Chưa thanh toán
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="border-purple-200 bg-purple-50 text-purple-700"
    >
      PayOS · {status}
    </Badge>
  );
}

export default function OrderRequestDetailDialog({
  request,
  onClose,
  onSuccess,
}: OrderRequestDetailDialogProps) {
  const handleUpdateRequest = async (status: "APPROVED" | "REJECTED") => {
    if (!request) return;

    try {
      const response = await fetch(
        `/api/users/order/admin/order-requests/${request.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || "Không thể xử lý yêu cầu");
      }

      // Đóng dialog
      onClose();

      // Reload danh sách ở component cha
      onSuccess();
    } catch (error) {
      console.error("Lỗi xử lý yêu cầu:", error);
    }
  };

  return (
    <Dialog
      open={!!request}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent className="w-[95vw] !max-w-[1100px] max-h-[90vh] overflow-y-auto bg-white">
        {request && (
          <div className="space-y-6">
            {/* HEADER */}
            <DialogHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <DialogTitle className="text-xl">
                    Chi tiết yêu cầu #{request.id}
                  </DialogTitle>

                  <DialogDescription className="mt-1">
                    Yêu cầu liên quan đến đơn hàng #{request.order_id}
                  </DialogDescription>
                </div>

                <StatusBadge status={request.status} />
              </div>
            </DialogHeader>

            {/* REQUEST INFO */}
            <div className="grid gap-4 rounded-xl border bg-slate-50 p-4 md:grid-cols-3">
              <div>
                <p className="text-xs font-medium uppercase text-slate-500">
                  Loại yêu cầu
                </p>

                <div className="mt-2">
                  <RequestTypeBadge type={request.type} />
                </div>
              </div>

              <div>
                <p className="text-xs font-medium uppercase text-slate-500">
                  Tạo lúc
                </p>

                <p className="mt-2 text-sm font-semibold">
                  {formatDate(request.created_at)}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase text-slate-500">
                  Cập nhật
                </p>

                <p className="mt-2 text-sm font-semibold">
                  {formatDate(request.updated_at)}
                </p>
              </div>
            </div>

            {/* CUSTOMER */}
            <section>
              <h3 className="mb-3 flex items-center gap-2 font-semibold">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                Thông tin khách hàng
              </h3>

              <div className="grid gap-4 rounded-xl border p-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-slate-500">Họ tên</p>

                  <p className="mt-1 font-medium">
                    {request.users.full_name || request.orders.recipient_name}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">Email</p>

                  <p className="mt-1 font-medium">{request.users.email}</p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">Số điện thoại</p>

                  <p className="mt-1 font-medium">
                    {request.orders.recipient_phone}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">Địa chỉ nhận hàng</p>

                  <p className="mt-1 font-medium">
                    {request.orders.shipping_address}
                  </p>
                </div>
              </div>
            </section>

            {/* REASON */}
            {request.reason && (
              <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
                <p className="text-sm font-semibold text-orange-800">
                  Lý do yêu cầu
                </p>

                <p className="mt-1 text-sm text-orange-700">{request.reason}</p>
              </div>
            )}

            {/* ORDER ITEMS */}
            <section>
              <h3 className="mb-3 flex items-center gap-2 font-semibold">
                <Package className="h-4 w-4 text-blue-600" />
                Sản phẩm trong đơn
              </h3>

              <div className="overflow-x-auto rounded-xl border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead>Sản phẩm</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Đơn giá</TableHead>
                      <TableHead>SL</TableHead>
                      <TableHead className="text-right">Thành tiền</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {request.orders.order_items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{item.product_name}</p>

                            <p className="mt-1 text-xs text-slate-500">
                              {item.variant_info}
                            </p>
                          </div>
                        </TableCell>

                        <TableCell className="font-mono text-xs">
                          {item.sku}
                        </TableCell>

                        <TableCell>{formatMoney(item.price)}</TableCell>

                        <TableCell>{item.quantity}</TableCell>

                        <TableCell className="text-right font-semibold">
                          {formatMoney(item.total_price)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </section>

            {/* TOTAL */}
            <div className="ml-auto max-w-sm rounded-xl border bg-slate-50 p-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Tạm tính</span>

                <span>{formatMoney(request.orders.subtotal)}</span>
              </div>

              <div className="mt-2 flex justify-between text-sm">
                <span className="text-slate-500">Phí vận chuyển</span>

                <span>{formatMoney(request.orders.shipping_fee)}</span>
              </div>

              <div className="mt-3 flex justify-between border-t pt-3 text-base font-bold">
                <span>Tổng cộng</span>

                <span className="text-blue-600">
                  {formatMoney(request.orders.total_amount)}
                </span>
              </div>
            </div>

            {/* PAYMENT */}
            <section className="rounded-xl border p-4">
              <h3 className="mb-3 font-semibold">Thông tin thanh toán</h3>

              <div className="space-y-3">
                <PaymentBadge
                  method={request.orders.payment_method}
                  status={request.orders.payment_status}
                />

                {request.orders.payment_order_code && (
                  <p className="text-sm">
                    <span className="text-slate-500">Mã thanh toán:</span>{" "}
                    <span className="font-mono">
                      {request.orders.payment_order_code}
                    </span>
                  </p>
                )}

                {request.orders.payment_reference && (
                  <p className="text-sm">
                    <span className="text-slate-500">Mã tham chiếu:</span>{" "}
                    <span className="font-mono">
                      {request.orders.payment_reference}
                    </span>
                  </p>
                )}

                {request.orders.paid_at && (
                  <p className="text-sm">
                    <span className="text-slate-500">Thanh toán lúc:</span>{" "}
                    {formatDate(request.orders.paid_at)}
                  </p>
                )}
              </div>
            </section>

            {/* ADMIN ACTIONS */}
            {request.status === "PENDING" && (
              <div className="flex flex-col gap-3 border-t pt-5 sm:flex-row sm:justify-end">
                <Button
                  variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => handleUpdateRequest("REJECTED")}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Từ chối
                </Button>

                <Button
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => handleUpdateRequest("APPROVED")}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />

                  {request.type === "CREATE_ORDER"
                    ? "Xác nhận đơn"
                    : "Xác nhận hủy đơn"}
                </Button>
              </div>
            )}

            {/* COD PAYMENT */}
            {request.orders.payment_method === "COD" &&
              request.orders.payment_status !== "PAID" &&
              request.status === "APPROVED" && (
                <div className="flex justify-end border-t pt-5">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      console.log("CONFIRM COD PAYMENT:", request.order_id);
                    }}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Xác nhận thanh toán COD
                  </Button>
                </div>
              )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
