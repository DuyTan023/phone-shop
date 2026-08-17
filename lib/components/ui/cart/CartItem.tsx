"use client";

import type { Cart_Item } from "@/lib/repositories/cart/cart_item.repository";
import { Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";

type CartItemProps = {
  item: Cart_Item;
  onQuantityChange: (id: number, quantity: number) => void;
  onRemove: (id: number) => void;
};

export default function CartItem({
  item,
  onQuantityChange,
  onRemove,
}: CartItemProps) {
  const total = Number(item.product_variants.price) * item.quantity;

  return (
    <div className="flex gap-4 border-b py-5">
      {/* Hình ảnh */}
      <div className="relative size-24 shrink-0 overflow-hidden rounded-lg bg-muted">
        <Image
          src={
            item.product_variants.product_images[0]?.image_url ??
            "/placeholder.png"
          }
          alt={item.product_variants.products.name}
          fill
          className="object-contain p-2"
          sizes="96px"
        />
      </div>

      {/* Thông tin */}
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold">{item.product_variants.products.name}</h3>

        <div className="mt-1 space-y-1 text-sm text-muted-foreground">
          <p>Màu: {item.product_variants.colors.name}</p>
          <p>RAM: {item.product_variants.rams.value}</p>
          <p>ROM: {item.product_variants.storages.value}</p>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          {/* Giá */}
          <div>
            <p className="font-semibold">
              {Number(item.product_variants.price).toLocaleString("vi-VN")}đ
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
                disabled={item.quantity >= item.product_variants.stock}
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
