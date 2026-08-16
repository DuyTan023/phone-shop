"use client";

import CartItem, { type CartItemData } from "@/lib/components/ui/cart/CartItem";
import { useState } from "react";

const initialItems: CartItemData[] = [
  {
    id: 1,
    name: "iPhone 15 Pro Max",
    slug: "iphone-15-pro-max",
    image: "/images/products/iphone-15-pro-max.jpg",
    color: "Titan Tự Nhiên",
    ram: "8GB",
    storage: "256GB",
    price: 29990000,
    quantity: 1,
    stock: 10,
  },
  {
    id: 2,
    name: "Samsung Galaxy S24 Ultra",
    slug: "samsung-galaxy-s24-ultra",
    image: "/images/products/s24-ultra.jpg",
    color: "Đen",
    ram: "12GB",
    storage: "256GB",
    price: 27990000,
    quantity: 1,
    stock: 5,
  },
];

export default function CartPage() {
  const [items, setItems] = useState<CartItemData[]>(initialItems);

  // State quản lý danh sách các id sản phẩm đang được chọn (Mặc định ban đầu chưa chọn gì)
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const handleQuantityChange = (id: number, quantity: number) => {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, quantity } : item)),
    );
  };

  const handleRemove = (id: number) => {
    setItems((current) => current.filter((item) => item.id !== id));
    // Đồng thời loại bỏ id khỏi danh sách đã chọn nếu có
    setSelectedIds((current) =>
      current.filter((selectedId) => selectedId !== id),
    );
  };

  // Xử lý chọn/bỏ chọn 1 sản phẩm
  const handleToggleSelect = (id: number) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((itemKey) => itemKey !== id)
        : [...current, id],
    );
  };

  // Xử lý chọn tất cả / bỏ chọn tất cả
  const handleToggleSelectAll = () => {
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map((item) => item.id));
    }
  };

  // Tính tổng tiền chỉ dựa trên các sản phẩm được chọn
  const total = items
    .filter((item) => selectedIds.includes(item.id))
    .reduce((sum, item) => sum + item.price * item.quantity, 0);

  const isAllSelected = items.length > 0 && selectedIds.length === items.length;

  return (
    <main className="min-h-screen bg-slate-50/50 py-10">
      <div className="mx-auto max-w-5xl px-4">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Giỏ hàng của bạn
          </h1>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600">
            {items.length} sản phẩm
          </span>
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-500">
              <svg
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
            <p className="text-lg font-medium text-slate-600">
              Giỏ hàng đang trống
            </p>
            <p className="mt-1 text-sm text-slate-400">
              Hãy dạo một vòng cửa hàng để chọn sản phẩm nhé!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Danh sách sản phẩm giỏ hàng (chiếm 2 cột trên màn hình lớn) */}
            <div className="lg:col-span-2 space-y-4">
              {/* Box chọn tất cả */}
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                <input
                  type="checkbox"
                  id="select-all"
                  checked={isAllSelected}
                  onChange={handleToggleSelectAll}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <label
                  htmlFor="select-all"
                  className="text-sm font-semibold text-slate-700 cursor-pointer select-none"
                >
                  Chọn tất cả ({items.length} sản phẩm)
                </label>
              </div>

              {/* Danh sách item */}
              <div className="rounded-2xl border border-slate-200 bg-white px-5 shadow-sm divide-y divide-slate-100">
                {items.map((item) => (
                  <div key={item.id} className="py-4 flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item.id)}
                      onChange={() => handleToggleSelect(item.id)}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <div className="flex-1">
                      <CartItem
                        item={item}
                        onQuantityChange={handleQuantityChange}
                        onRemove={handleRemove}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Phần tổng kết thanh toán (chiếm 1 cột) */}
            <div className="lg:col-span-1">
              <div className="sticky top-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">
                  Thanh toán đơn hàng
                </h2>

                <div className="space-y-3 py-4 text-sm text-slate-600">
                  <div className="flex justify-between">
                    <span>Đã chọn:</span>
                    <span className="font-semibold text-slate-900">
                      {selectedIds.length} sản phẩm
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tạm tính:</span>
                    <span className="font-semibold text-slate-900">
                      {total.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Phí vận chuyển:</span>
                    <span className="text-blue-600 font-medium">Miễn phí</span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 py-4">
                  <span className="font-bold text-slate-900">Tổng tiền</span>
                  <span className="text-2xl font-black text-blue-600">
                    {total.toLocaleString("vi-VN")}đ
                  </span>
                </div>

                <button
                  type="button"
                  disabled={selectedIds.length === 0}
                  className={`w-full rounded-xl py-3.5 font-bold transition-all shadow-md ${
                    selectedIds.length === 0
                      ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                      : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-200"
                  }`}
                >
                  Tiến hành đặt hàng
                </button>

                {selectedIds.length === 0 && (
                  <p className="mt-2 text-center text-xs text-rose-500">
                    Vui lòng chọn ít nhất một sản phẩm để thanh toán
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
