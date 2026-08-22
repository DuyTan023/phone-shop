"use client";

import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  FileText,
  Search,
  ShoppingCart,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import OrderRequestDetailDialog from "@/lib/components/ui/order/OrderRequestDetailDialog";

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

interface OrderRequest {
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

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ApiResponse {
  data: OrderRequest[];
  pagination: Pagination;
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

export default function AdminOrderRequestPage() {
  const [requests, setRequests] = useState<OrderRequest[]>([]);

  const [loading, setLoading] = useState(true);

  const [keyword, setKeyword] = useState("");

  const [type, setType] = useState<string>("ALL");

  const [status, setStatus] = useState<string>("ALL");

  const [page, setPage] = useState(1);

  const limit = 10;

  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [selectedRequest, setSelectedRequest] = useState<OrderRequest | null>(
    null,
  );

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      if (keyword.trim()) {
        params.set("keyword", keyword.trim());
      }

      if (type !== "ALL") {
        params.set("type", type);
      }

      if (status !== "ALL") {
        params.set("status", status);
      }

      params.set("page", String(page));
      params.set("limit", String(limit));

      const response = await fetch(
        `/api/users/order/admin/order-requests?${params.toString()}`,
        {
          cache: "no-store",
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || "Không thể tải danh sách yêu cầu");
      }

      setRequests(result.data ?? []);

      setPagination(
        result.pagination ?? {
          page,
          limit,
          total: 0,
          totalPages: 1,
        },
      );
    } catch (error) {
      console.error("Lỗi tải order requests:", error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [keyword, type, status, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRequests();
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchRequests]);

  const stats = useMemo(() => {
    return {
      total: pagination.total,

      pending: requests.filter((item) => item.status === "PENDING").length,

      create: requests.filter(
        (item) => item.type === "CREATE_ORDER" && item.status === "PENDING",
      ).length,

      cancel: requests.filter(
        (item) => item.type === "CANCEL_ORDER" && item.status === "PENDING",
      ).length,
    };
  }, [requests, pagination.total]);

  const handleTypeChange = (value: string | null) => {
    if (value === null) return;

    setType(value);
    setPage(1);
  };

  const handleStatusChange = (value: string | null) => {
    if (value === null) return;

    setStatus(value);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-50/70 p-6 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* HEADER */}
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <FileText className="h-4 w-4" />

            <span>Quản trị đơn hàng</span>

            <span>/</span>

            <span className="font-medium text-slate-900">Yêu cầu xử lý</span>
          </div>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            Quản lý yêu cầu đơn hàng
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Theo dõi, kiểm tra và xử lý các yêu cầu từ khách hàng.
          </p>
        </div>

        {/* STATISTICS */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-slate-500">Tổng yêu cầu</p>

                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {stats.total}
                </p>
              </div>

              <div className="rounded-xl bg-slate-100 p-3">
                <FileText className="h-5 w-5 text-slate-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-slate-500">Đang chờ xử lý</p>

                <p className="mt-1 text-2xl font-bold text-amber-600">
                  {stats.pending}
                </p>
              </div>

              <div className="rounded-xl bg-amber-50 p-3">
                <Clock3 className="h-5 w-5 text-amber-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-slate-500">Chờ xác nhận đơn</p>

                <p className="mt-1 text-2xl font-bold text-blue-600">
                  {stats.create}
                </p>
              </div>

              <div className="rounded-xl bg-blue-50 p-3">
                <ShoppingCart className="h-5 w-5 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-slate-500">Chờ hủy đơn</p>

                <p className="mt-1 text-2xl font-bold text-orange-600">
                  {stats.cancel}
                </p>
              </div>

              <div className="rounded-xl bg-orange-50 p-3">
                <XCircle className="h-5 w-5 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FILTER */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Bộ lọc</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="grid gap-3 md:grid-cols-[1fr_220px_220px]">
              {/* SEARCH */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <Input
                  value={keyword}
                  onChange={(e) => {
                    setKeyword(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Tìm mã yêu cầu, mã đơn, tên, email..."
                  className="pl-9"
                />
              </div>

              {/* TYPE */}

              <Select value={type} onValueChange={handleTypeChange}>
                <SelectTrigger className="w-[220px] bg-white">
                  <SelectValue>
                    {type === "ALL"
                      ? "Tất cả loại yêu cầu"
                      : type === "CREATE_ORDER"
                        ? "Xác nhận đơn"
                        : "Hủy đơn"}
                  </SelectValue>
                </SelectTrigger>

                <SelectContent className="min-w-[220px] bg-white">
                  <SelectItem value="ALL">Tất cả loại yêu cầu</SelectItem>
                  <SelectItem value="CREATE_ORDER">Xác nhận đơn</SelectItem>
                  <SelectItem value="CANCEL_ORDER">Hủy đơn</SelectItem>
                </SelectContent>
              </Select>

              {/* STATUS */}
              <Select value={status} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-[220px] bg-white">
                  <SelectValue>
                    {status === "ALL"
                      ? "Tất cả trạng thái"
                      : status === "PENDING"
                        ? "Chờ xử lý"
                        : status === "APPROVED"
                          ? "Đã duyệt"
                          : "Đã từ chối"}
                  </SelectValue>
                </SelectTrigger>

                <SelectContent className="min-w-[220px] bg-white">
                  <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                  <SelectItem value="PENDING">Chờ xử lý</SelectItem>
                  <SelectItem value="APPROVED">Đã duyệt</SelectItem>
                  <SelectItem value="REJECTED">Đã từ chối</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* TABLE */}
        <Card className="overflow-hidden border-0 shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Yêu cầu</TableHead>
                    <TableHead>Đơn hàng</TableHead>
                    <TableHead>Khách hàng</TableHead>
                    <TableHead>Loại</TableHead>
                    <TableHead>Thanh toán</TableHead>
                    <TableHead>Tổng tiền</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Thời gian</TableHead>
                    <TableHead className="text-right">Xử lý</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {loading ? (
                    Array.from({ length: 6 }).map((_, index) => (
                      <TableRow key={index}>
                        {Array.from({ length: 9 }).map((_, cellIndex) => (
                          <TableCell key={cellIndex}>
                            <div className="h-4 animate-pulse rounded bg-slate-100" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : requests.length > 0 ? (
                    requests.map((item) => (
                      <TableRow
                        key={item.id}
                        className="transition-colors hover:bg-slate-50"
                      >
                        {/* REQUEST */}
                        <TableCell>
                          <div>
                            <p className="font-mono font-semibold text-slate-800">
                              #{item.id}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              User #{item.user_id}
                            </p>
                          </div>
                        </TableCell>

                        {/* ORDER */}
                        <TableCell>
                          <p className="font-semibold text-blue-600">
                            #{item.order_id}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {item.orders.order_items.length} sản phẩm
                          </p>
                        </TableCell>

                        {/* CUSTOMER */}
                        <TableCell>
                          <div className="max-w-[190px]">
                            <p className="truncate font-medium text-slate-900">
                              {item.users.full_name ||
                                item.orders.recipient_name}
                            </p>

                            <p className="truncate text-xs text-slate-500">
                              {item.users.email}
                            </p>
                          </div>
                        </TableCell>

                        {/* TYPE */}
                        <TableCell>
                          <RequestTypeBadge type={item.type} />
                        </TableCell>

                        {/* PAYMENT */}
                        <TableCell>
                          <PaymentBadge
                            method={item.orders.payment_method}
                            status={item.orders.payment_status}
                          />
                        </TableCell>

                        {/* TOTAL */}
                        <TableCell>
                          <span className="font-bold text-slate-900">
                            {formatMoney(item.orders.total_amount)}
                          </span>
                        </TableCell>

                        {/* STATUS */}
                        <TableCell>
                          <StatusBadge status={item.status} />
                        </TableCell>

                        {/* DATE */}
                        <TableCell>
                          <span className="whitespace-nowrap text-xs text-slate-500">
                            {formatDate(item.created_at)}
                          </span>
                        </TableCell>

                        {/* ACTION */}
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5"
                            onClick={() => setSelectedRequest(item)}
                          >
                            <Eye className="h-4 w-4" />
                            Chi tiết
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="h-40 text-center">
                        <div className="flex flex-col items-center">
                          <div className="rounded-full bg-slate-100 p-4">
                            <FileText className="h-6 w-6 text-slate-400" />
                          </div>

                          <p className="mt-3 font-medium text-slate-700">
                            Không có yêu cầu
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            Không tìm thấy dữ liệu phù hợp.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* PAGINATION */}
            <div className="flex flex-col gap-3 border-t bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Hiển thị{" "}
                <span className="font-semibold text-slate-900">
                  {requests.length}
                </span>{" "}
                /{" "}
                <span className="font-semibold text-slate-900">
                  {pagination.total}
                </span>{" "}
                yêu cầu
              </p>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((current) => current - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Trước
                </Button>

                <div className="min-w-24 text-center text-sm font-medium">
                  Trang {pagination.page} / {Math.max(1, pagination.totalPages)}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= pagination.totalPages || loading}
                  onClick={() => setPage((current) => current + 1)}
                >
                  Sau
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <OrderRequestDetailDialog
        request={selectedRequest}
        onClose={() => setSelectedRequest(null)}
        onSuccess={fetchRequests}
      />
    </div>
  );
}
