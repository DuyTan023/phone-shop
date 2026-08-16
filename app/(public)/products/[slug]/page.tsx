/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type { products } from "@/app/generated/prisma/client";
import ProductDetail from "@/lib/components/ui/product_manager/ProductDetail"; // Đường dẫn đến component ProductDetail của bạn
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProductPage() {
  const params = useParams();
  const slug = params.slug as string; // Lấy slug từ URL: /products/[slug]
  const variant = Number(params.variant);

  const [product, setProduct] = useState<products | null>(null);
  const [loadingId, setLoadingId] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Bước 1: Dùng slug để đi tìm productId thông qua API danh sách sản phẩm
  useEffect(() => {
    async function fetchProductIdBySlug() {
      if (!slug) return;

      try {
        setLoadingId(true);
        setError(null);

        const res = await fetch(`/api/product_manager/products`);
        const data = await res.json();

        // Cấu trúc JSON của bạn là data.data.data chứa mảng sản phẩm
        const listProducts = data.data?.data || data.data || [];

        // Tìm sản phẩm có slug trùng khớp với trên URL
        // (Dùng thêm .toLowerCase() để tránh lệch chữ hoa/thường như trường hợp "iPhone-16" và "iphone-16")
        const matchedProduct = Array.isArray(listProducts)
          ? listProducts.find(
              (p: products) => p.slug.toLowerCase() === slug.toLowerCase(),
            )
          : null;

        if (matchedProduct && matchedProduct.id) {
          setProduct(matchedProduct);
        } else {
          setError("Không tìm thấy sản phẩm tương ứng.");
        }
      } catch (err) {
        console.error("Lỗi tìm ID từ slug:", err);
        setError("Đã xảy ra lỗi khi tải thông tin sản phẩm.");
      } finally {
        setLoadingId(false);
      }
    }

    fetchProductIdBySlug();
  }, [slug]);

  if (loadingId) {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-slate-500">
        Đang tìm kiếm sản phẩm...
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-red-500">
        {error || "Sản phẩm không tồn tại."}
      </div>
    );
  }

  // Bước 2: Khi đã có productId, truyền xuống component ProductDetail của bạn
  return <ProductDetail product={product} variant_id={variant} />;
}
