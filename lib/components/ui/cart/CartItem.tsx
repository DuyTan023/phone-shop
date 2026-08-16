"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";

export type CartItemData = {
  id: number;
  name: string;
  slug: string;
  image: string;
  color: string;
  ram: string;
  storage: string;
  price: number;
  quantity: number;
  stock: number;
};

type CartItemProps = {
  item: CartItemData;
  onQuantityChange: (id: number, quantity: number) => void;
  onRemove: (id: number) => void;
};

export default function CartItem({
  item,
  onQuantityChange,
  onRemove,
}: CartItemProps) {
  const total = item.price * item.quantity;

  return (
    <div className="flex gap-4 border-b py-5">
      {/* Hình ảnh */}
      <div className="relative size-24 shrink-0 overflow-hidden rounded-lg bg-muted">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-contain p-2"
          sizes="96px"
        />
      </div>

      {/* Thông tin */}
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold">{item.name}</h3>

        <div className="mt-1 space-y-1 text-sm text-muted-foreground">
          <p>Màu: {item.color}</p>
          <p>RAM: {item.ram}</p>
          <p>ROM: {item.storage}</p>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          {/* Giá */}
          <div>
            <p className="font-semibold">
              {item.price.toLocaleString("vi-VN")}đ
            </p>

            <p className="text-sm text-muted-foreground">
              Thành tiền: {total.toLocaleString("vi-VN")}đ
            </p>
          </div>

          {/* Số lượng + Xóa */}
          <div className="flex items-center gap-4">
            <div className="flex items-center rounded-md border">
              <button
                type="button"
                disabled={item.quantity <= 1}
                onClick={() => onQuantityChange(item.id, item.quantity - 1)}
                className="flex size-8 items-center justify-center hover:bg-muted disabled:opacity-40"
              >
                <Minus className="size-4" />
              </button>

              <span className="w-8 text-center text-sm">{item.quantity}</span>

              <button
                type="button"
                disabled={item.quantity >= item.stock}
                onClick={() => onQuantityChange(item.id, item.quantity + 1)}
                className="flex size-8 items-center justify-center hover:bg-muted disabled:opacity-40"
              >
                <Plus className="size-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => onRemove(item.id)}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
