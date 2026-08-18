// components/checkout/order-items.tsx

import { Package } from "lucide-react";
import Image from "next/image";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type OrderItem = {
  id: number;
  variant_id: number;
  product_name: string;
  sku: string;
  variant_info: string;
  image_url: string;
  price: number;
  quantity: number;
  total_price: number;
};

type OrderItemsProps = {
  items: OrderItem[];
};

const formatPrice = (price: number) => {
  return `${price.toLocaleString("vi-VN")}đ`;
};

export function OrderItems({ items }: OrderItemsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Package className="size-4" />
          3. Sản phẩm
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={item.id}>
              <div className="flex gap-4">
                <div className="relative size-20 shrink-0 overflow-hidden rounded-lg border bg-muted">
                  <Image
                    src={
                      typeof item.image_url === "string" &&
                      item.image_url.trim() !== ""
                        ? item.image_url
                        : "/placeholder-product.png"
                    }
                    alt={item.product_name || "Sản phẩm"}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="line-clamp-2 text-sm font-medium">
                    {item.product_name}
                  </h3>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.variant_info}
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    SKU: {item.sku}
                  </p>

                  <div className="mt-2 flex items-center justify-between gap-4">
                    <span className="text-sm text-muted-foreground">
                      {formatPrice(item.price)} × {item.quantity}
                    </span>

                    <span className="text-sm font-semibold">
                      {formatPrice(item.total_price)}
                    </span>
                  </div>
                </div>
              </div>

              {index < items.length - 1 && <Separator className="mt-4" />}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
