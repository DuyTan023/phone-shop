/* eslint-disable @typescript-eslint/no-explicit-any */
// OrderAdminList.tsx

"use client";

import { useEffect, useState } from "react";

import type {
  order_status,
  payment_status,
} from "@/app/generated/prisma/client";

import type { ApiResponse, PaginationResult } from "@/lib/types/public/types";

import { Button } from "@/components/ui/button";
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

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// Shadcn Dialog components (Đảm bảo bạn đã cài đặt dialog component)
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type OrderItemDetail = {
  id: number;
  product_name?: string;
  quantity: number;
  price: number | string;
  [key: string]: any;
};

type OrderItem = {
  id: number;
  user_id: number;
  recipient_name: string;
  recipient_phone: string;
  shipping_address: string;
  subtotal: string | number;
  shipping_fee: string | number;
  total_amount: string | number;
  status: order_status;
  payment_method: "COD" | "PAYOS";
  payment_status: payment_status;
  payment_order_code?: string | null;
  created_at: string | Date;
  order_items?: OrderItemDetail[];
  users?: {
    id: number;
    name?: string;
    email?: string;
    phone?: string;
    [key: string]: any;
  };
};

export default function OrderAdminList() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [keyword, setKeyword] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [status, setStatus] = useState<order_status | "ALL">("ALL");
  const [paymentStatus, setPaymentStatus] = useState<payment_status | "ALL">(
    "ALL",
  );
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPage, setTotalPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // State quản lý Dialog chi tiết đơn hàng
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [modalEditingStatus, setModalEditingStatus] =
    useState<order_status>("PENDING");

  // =====================================================
  // FETCH ORDERS
  // =====================================================
  useEffect(() => {
    const controller = new AbortController();

    const fetchOrders = async () => {
      try {
        await Promise.resolve();
        setLoading(true);

        const params = new URLSearchParams();
        if (searchKeyword) params.set("keyword", searchKeyword);
        if (status !== "ALL") params.set("status", status);
        if (paymentStatus !== "ALL")
          params.set("payment_status", paymentStatus);
        params.set("page", String(page));
        params.set("limit", String(limit));

        const response = await fetch(
          `/api/users/order/admin/order?${params.toString()}`,
          { signal: controller.signal },
        );

        const result: ApiResponse<
          PaginationResult<OrderItem> & {
            orders?: OrderItem[];
            pagination?: any;
          }
        > = await response.json();

        if (!response.ok || !result.success || !result.data) {
          throw new Error(result.message || "Không thể lấy danh sách đơn hàng");
        }

        const listData = result.data.orders || result.data.data || [];
        const totalPages =
          result.data.pagination?.totalPages || result.data.totalPage || 1;

        setOrders(listData);
        setTotalPage(totalPages > 0 ? totalPages : 1);
      } catch (error: any) {
        if (error.name === "AbortError") return;
        console.error("Fetch orders error:", error);
        setTotalPage(1);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchOrders();

    return () => {
      controller.abort();
    };
  }, [page, status, paymentStatus, searchKeyword, limit]);

  const handleSearch = () => {
    setSearchKeyword(keyword.trim());
    setPage(1);
  };

  const handleReset = () => {
    setKeyword("");
    setSearchKeyword("");
    setStatus("ALL");
    setPaymentStatus("ALL");
    setPage(1);
  };

  // Mở Dialog xem và cập nhật chi tiết
  const handleOpenDetail = (order: OrderItem) => {
    setSelectedOrder(order);
    setModalEditingStatus(order.status);
    setIsDialogOpen(true);
  };

  // =====================================================
  // ACTIONS (UPDATE STATUS & CONFIRM COD)
  // =====================================================
  const handleSaveStatus = async (orderId: number) => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/users/order/admin/order/${orderId}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: modalEditingStatus }),
        },
      );

      const result: ApiResponse<any> = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Cập nhật trạng thái thất bại");
      }

      // Cập nhật lại UI danh sách chính và order đang chọn
      setOrders((prev) =>
        prev.map((item) =>
          item.id === orderId ? { ...item, status: modalEditingStatus } : item,
        ),
      );
      if (selectedOrder) {
        setSelectedOrder({ ...selectedOrder, status: modalEditingStatus });
      }

      alert("Cập nhật trạng thái thành công!");
    } catch (error: any) {
      console.error("Update status error:", error);
      alert(error instanceof Error ? error.message : "Cập nhật thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCOD = async (orderId: number) => {
    if (
      !confirm(
        "Bạn có chắc chắn muốn xác nhận thanh toán COD cho đơn hàng này?",
      )
    )
      return;

    try {
      setLoading(true);
      const response = await fetch(
        `/api/users/order/admin/order/${orderId}/confirm-cod`,
        { method: "PATCH" },
      );

      const result: ApiResponse<any> = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Xác nhận thanh toán COD thất bại");
      }

      setOrders((prev) =>
        prev.map((item) =>
          item.id === orderId ? { ...item, payment_status: "PAID" } : item,
        ),
      );
      if (selectedOrder) {
        setSelectedOrder({ ...selectedOrder, payment_status: "PAID" });
      }

      alert("Xác nhận thanh toán COD thành công!");
    } catch (error: any) {
      console.error("Confirm COD error:", error);
      alert(error instanceof Error ? error.message : "Xác nhận thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* FILTER */}
      <div className="flex flex-col gap-3 md:flex-row flex-wrap">
        <Input
          placeholder="Tìm kiếm theo mã đơn hoặc tên..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
          }}
          className="md:w-[300px]"
        />

        <Select
          value={status}
          onValueChange={(value) => {
            setStatus(value as order_status | "ALL");
            setPage(1);
          }}
        >
          <SelectTrigger className="md:w-[180px]">
            <SelectValue placeholder="Trạng thái đơn" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
            <SelectItem value="SHIPPING">Shipping</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={paymentStatus}
          onValueChange={(value) => {
            setPaymentStatus(value as payment_status | "ALL");
            setPage(1);
          }}
        >
          <SelectTrigger className="md:w-[180px]">
            <SelectValue placeholder="Trạng thái thanh toán" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="ALL">Tất cả thanh toán</SelectItem>
            <SelectItem value="UNPAID">Unpaid</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="PAID">Paid</SelectItem>
            <SelectItem value="REFUNDED">Refunded</SelectItem>
          </SelectContent>
        </Select>

        <Button
          onClick={handleSearch}
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          Tìm kiếm
        </Button>
        <Button
          onClick={handleReset}
          className="bg-gray-500 text-white hover:bg-gray-600"
        >
          Đặt lại
        </Button>
      </div>

      {/* TABLE GỌN GÀNG */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã đơn</TableHead>
              <TableHead>Người đặt</TableHead>
              <TableHead>Số lượng SP</TableHead>
              <TableHead>Tổng tiền</TableHead>
              <TableHead>Thanh toán</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày đặt</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  Đang tải...
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  Không tìm thấy đơn hàng nào
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => {
                const totalItemsCount =
                  order.order_items?.reduce(
                    (sum, item) => sum + (item.quantity || 0),
                    0,
                  ) || 0;

                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.id}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold">
                          {order.recipient_name || "-"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {order.recipient_phone || "-"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{totalItemsCount} sản phẩm</TableCell>
                    <TableCell className="font-semibold text-blue-600">
                      {Number(order.total_amount).toLocaleString("vi-VN")} đ
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 w-fit">
                          {order.payment_method}
                        </span>
                        <span
                          className={`text-xs font-medium ${order.payment_status === "PAID" ? "text-green-600" : "text-orange-600"}`}
                        >
                          {order.payment_status}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-gray-100">
                        {order.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(order.created_at).toLocaleDateString("vi-VN")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenDetail(order)}
                        className="bg-blue-50 text-blue-600 hover:bg-blue-100"
                      >
                        Chi tiết & Cập nhật
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* DIALOG HIỂN THỊ TẤT CẢ THÔNG TIN CHI TIẾT VÀ CẬP NHẬT */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-full sm:max-w-4xl max-h-[90vh] overflow-y-auto bg-white p-6 !w-[90vw] md:!w-[800px]">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-xl font-bold">
              Chi tiết đơn hàng #{selectedOrder?.id}
            </DialogTitle>
            <DialogDescription>
              Xem toàn bộ thông tin đơn hàng, sản phẩm và thực hiện cập nhật
              trạng thái bên dưới.
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6 pt-4 text-sm">
              {/* Thông tin người nhận & Thông tin hệ thống (Chia 2 cột cân đối) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-lg border space-y-1.5">
                  <h4 className="font-semibold text-gray-800 mb-2 border-b pb-1">
                    Thông tin người nhận
                  </h4>
                  <p>
                    <span className="text-gray-500 font-medium">Họ tên:</span>{" "}
                    {selectedOrder.recipient_name}
                  </p>
                  <p>
                    <span className="text-gray-500 font-medium">
                      Số điện thoại:
                    </span>{" "}
                    {selectedOrder.recipient_phone}
                  </p>
                  <p>
                    <span className="text-gray-500 font-medium">
                      Địa chỉ giao:
                    </span>{" "}
                    {selectedOrder.shipping_address}
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg border space-y-1.5">
                  <h4 className="font-semibold text-gray-800 mb-2 border-b pb-1">
                    Thông tin thanh toán & hệ thống
                  </h4>
                  <p>
                    <span className="text-gray-500 font-medium">
                      Tài khoản đặt:
                    </span>{" "}
                    {selectedOrder.users?.name ||
                      selectedOrder.users?.email ||
                      `User ID: ${selectedOrder.user_id}`}
                  </p>
                  <p>
                    <span className="text-gray-500 font-medium">Ngày đặt:</span>{" "}
                    {new Date(selectedOrder.created_at).toLocaleString("vi-VN")}
                  </p>
                  <p>
                    <span className="text-gray-500 font-medium">
                      Phương thức:
                    </span>{" "}
                    <span className="font-semibold px-1.5 py-0.5 rounded bg-white border text-xs">
                      {selectedOrder.payment_method}
                    </span>
                  </p>
                  <p>
                    <span className="text-gray-500 font-medium">
                      Trạng thái thanh toán:
                    </span>{" "}
                    <span
                      className={`font-semibold ${selectedOrder.payment_status === "PAID" ? "text-green-600" : "text-orange-600"}`}
                    >
                      {selectedOrder.payment_status}
                    </span>
                  </p>
                </div>
              </div>

              {/* Danh sách sản phẩm kèm hình ảnh (image_url) */}
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-800">
                  Danh sách sản phẩm
                </h4>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-100">
                        <TableHead className="w-[80px]">Ảnh</TableHead>
                        <TableHead>Tên sản phẩm</TableHead>
                        <TableHead className="text-center">Số lượng</TableHead>
                        <TableHead className="text-right">Đơn giá</TableHead>
                        <TableHead className="text-right">Thành tiền</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.order_items &&
                      selectedOrder.order_items.length > 0 ? (
                        selectedOrder.order_items.map((item, idx) => {
                          const itemTotal =
                            Number(item.price || 0) *
                            Number(item.quantity || 0);
                          return (
                            <TableRow key={idx}>
                              <TableCell>
                                {item.image_url ? (
                                  <img
                                    src={item.image_url}
                                    alt={item.product_name || "Product image"}
                                    className="w-12 h-12 object-cover rounded-md border"
                                  />
                                ) : (
                                  <div className="w-12 h-12 bg-gray-100 rounded-md border flex items-center justify-center text-xs text-gray-400">
                                    No image
                                  </div>
                                )}
                              </TableCell>
                              <TableCell className="font-medium text-gray-900">
                                {item.product_name ||
                                  `Sản phẩm #${item.product_id || idx}`}
                              </TableCell>
                              <TableCell className="text-center">
                                {item.quantity}
                              </TableCell>
                              <TableCell className="text-right">
                                {Number(item.price || 0).toLocaleString(
                                  "vi-VN",
                                )}{" "}
                                đ
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                {itemTotal.toLocaleString("vi-VN")} đ
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="text-center text-gray-400 py-6"
                          >
                            Không có thông tin sản phẩm
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Tổng kết tiền */}
              <div className="flex flex-col items-end space-y-1 bg-gray-50 p-4 rounded-lg border text-sm">
                <div className="flex justify-between w-64">
                  <span className="text-gray-500">Tạm tính:</span>
                  <span>
                    {Number(selectedOrder.subtotal || 0).toLocaleString(
                      "vi-VN",
                    )}{" "}
                    đ
                  </span>
                </div>
                <div className="flex justify-between w-64">
                  <span className="text-gray-500">Phí vận chuyển:</span>
                  <span>
                    {Number(selectedOrder.shipping_fee || 0).toLocaleString(
                      "vi-VN",
                    )}{" "}
                    đ
                  </span>
                </div>
                <div className="flex justify-between w-64 border-t pt-1 font-bold text-base text-blue-600">
                  <span>Tổng thanh toán:</span>
                  <span>
                    {Number(selectedOrder.total_amount || 0).toLocaleString(
                      "vi-VN",
                    )}{" "}
                    đ
                  </span>
                </div>
              </div>

              {/* KHU VỰC HÀNH ĐỘNG CỦA ADMIN */}
              <div className="border-t pt-4 space-y-3 bg-blue-50/50 p-4 rounded-lg border">
                <h4 className="font-semibold text-gray-800">
                  Thao tác quản trị đơn hàng
                </h4>

                <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
                  {/* Đổi trạng thái đơn hàng */}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-gray-600 font-medium whitespace-nowrap">
                      Trạng thái mới:
                    </span>
                    <Select
                      value={modalEditingStatus}
                      onValueChange={(val) =>
                        setModalEditingStatus(val as order_status)
                      }
                    >
                      <SelectTrigger className="w-[160px] bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="PENDING">PENDING</SelectItem>
                        <SelectItem value="CONFIRMED">CONFIRMED</SelectItem>
                        <SelectItem value="SHIPPING">SHIPPING</SelectItem>
                        <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      onClick={() => handleSaveStatus(selectedOrder.id)}
                      className="bg-blue-600 text-white hover:bg-blue-700 font-medium"
                    >
                      Cập nhật
                    </Button>
                  </div>

                  {/* Nút xác nhận thanh toán COD nếu thỏa mãn */}
                  {selectedOrder.payment_method === "COD" &&
                    selectedOrder.payment_status === "UNPAID" && (
                      <Button
                        size="sm"
                        onClick={() => handleConfirmCOD(selectedOrder.id)}
                        className="bg-emerald-600 text-white hover:bg-emerald-700 w-full sm:w-auto font-medium"
                      >
                        Xác nhận thanh toán COD
                      </Button>
                    )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="border-t pt-3 mt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PAGINATION */}
      {totalPage > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (page > 1) setPage(page - 1);
                }}
              />
            </PaginationItem>

            {Array.from({ length: totalPage }, (_, index) => {
              const pageNumber = index + 1;
              return (
                <PaginationItem key={pageNumber}>
                  <PaginationLink
                    href="#"
                    isActive={page === pageNumber}
                    onClick={(e) => {
                      e.preventDefault();
                      setPage(pageNumber);
                    }}
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              );
            })}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (page < totalPage) setPage(page + 1);
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
