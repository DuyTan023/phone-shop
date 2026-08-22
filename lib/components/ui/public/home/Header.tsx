"use client";

import {
  Show,
  SignInButton,
  SignOutButton,
  SignUpButton,
  useAuth,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import {
  Bell,
  Loader2,
  LogOut,
  MapPin,
  PhoneCall,
  Search,
  ShoppingCart,
  Truck,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface ProductVariant {
  id: number;
  price: string;
  products: {
    name: string;
    slug: string;
  };
  storages?: {
    value: string;
  };
  rams?: {
    value: string;
  };
  colors?: {
    name: string;
  };
  product_images?: {
    image_url: string;
    is_featured: boolean;
  }[];
}

export default function Header() {
  const { user } = useUser();
  const { isLoaded, isSignedIn } = useAuth();

  const [keyword, setKeyword] = useState("");
  const [suggestions, setSuggestions] = useState<ProductVariant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);

  const [cartItemCount, setCartItemCount] = useState(0);

  const [pendingRequestCount, setPendingRequestCount] = useState(0);

  const fetchCartItemCount = async () => {
    try {
      const res = await fetch("/api/users/cart/items", {
        cache: "no-store",
      });

      const json = await res.json();

      if (json.success) {
        const items = json.data || [];

        // Số item trong giỏ = số dòng cart_items
        setCartItemCount(items.length);
      }
    } catch (error) {
      console.error("Lỗi lấy số lượng giỏ hàng:", error);
    }
  };

  const fetchPendingRequestCount = async () => {
    try {
      const res = await fetch("/api/users/order/request", {
        cache: "no-store",
      });

      const json = await res.json();

      if (res.ok && json.success) {
        const requests = json.data || [];

        const pendingCount = requests.filter(
          (item: { status: string }) => item.status === "PENDING",
        ).length;

        setPendingRequestCount(pendingCount);
      }
    } catch (error) {
      console.error("Lỗi lấy số lượng yêu cầu:", error);
    }
  };

  // Xử lý ẩn popup khi click ra ngoài ô tìm kiếm
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowPopup(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Chỉ dùng useEffect để gọi API khi người dùng thực sự nhập từ khóa hợp lệ
  useEffect(() => {
    const trimmedKeyword = keyword.trim();

    if (!trimmedKeyword) {
      return; // Không gọi API nếu từ khóa trống
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `/api/product_manager/product_variants/default?keyword=${encodeURIComponent(trimmedKeyword)}`,
        );
        const data = await res.json();
        if (data.success) {
          setSuggestions(data.data || []);
          setShowPopup(true);
        }
      } catch (error) {
        console.error("Lỗi khi tìm kiếm sản phẩm:", error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [keyword]);

  // useEffect(() => {
  //   if (!isSignedIn) return;

  //   const timer = setTimeout(() => {
  //     fetchCartItemCount();
  //   }, 0);

  //   const handleCartUpdated = () => {
  //     fetchCartItemCount();
  //   };

  //   window.addEventListener("cart-updated", handleCartUpdated);

  //   return () => {
  //     clearTimeout(timer);
  //     window.removeEventListener("cart-updated", handleCartUpdated);
  //   };
  // }, [isSignedIn]);
  useEffect(() => {
    if (!isSignedIn) return;

    const timer = setTimeout(() => {
      fetchCartItemCount();
      fetchPendingRequestCount();
    }, 0);

    const handleCartUpdated = () => {
      fetchCartItemCount();
    };

    const handleOrderRequestUpdated = () => {
      fetchPendingRequestCount();
    };

    window.addEventListener("cart-updated", handleCartUpdated);
    window.addEventListener("order-request-updated", handleOrderRequestUpdated);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("cart-updated", handleCartUpdated);
      window.removeEventListener(
        "order-request-updated",
        handleOrderRequestUpdated,
      );
    };
  }, [isSignedIn]);

  // Xử lý thay đổi input đồng thời reset state ngay tại đây nếu input trống
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setKeyword(value);
    if (!value.trim()) {
      setSuggestions([]);
      setShowPopup(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-blue-600 text-white shadow-md">
      {/* 1. Topbar Thông báo */}
      <div className="bg-blue-700/80 text-blue-100 text-[11px] font-medium py-1 text-center tracking-wide border-b border-blue-500/50">
        Miễn phí giao hàng toàn quốc cho đơn từ 500.000đ • Đổi trả trong 30 ngày
      </div>

      {/* 2. Main Header */}
      <div className="container mx-auto px-4 max-w-7xl py-3 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="bg-white text-blue-600 px-2.5 py-1 rounded-lg font-black text-xl tracking-wider shadow-sm group-hover:bg-blue-50 transition">
            TP
          </div>
          <span className="text-xl font-black tracking-tight text-white">
            Tech<span className="text-blue-200">Phone</span>
          </span>
        </Link>

        {/* Thanh tìm kiếm kèm Popup Gợi ý */}
        <div className="flex-1 max-w-lg relative" ref={searchRef}>
          <div className="relative">
            <input
              type="text"
              value={keyword}
              onChange={handleSearchChange}
              onFocus={() => {
                if (suggestions.length > 0) setShowPopup(true);
              }}
              placeholder="Bạn tìm điện thoại gì? (iPhone 15, Galaxy S24...)"
              className="w-full pl-4 pr-10 py-2 bg-white text-slate-900 placeholder:text-slate-400 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-inner transition"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition">
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Popup Gợi ý sản phẩm */}
          {showPopup && (
            <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 text-slate-800 max-h-[420px] overflow-y-auto">
              <div className="p-3 bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-600">
                Sản phẩm gợi ý
              </div>

              {suggestions.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {suggestions.map((item) => {
                    const featuredImage =
                      item.product_images?.find((img) => img.is_featured)
                        ?.image_url || item.product_images?.[0]?.image_url;
                    const formattedPrice = new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(Number(item.price));

                    return (
                      <Link
                        key={item.id}
                        href={`/products/${item.products.slug}`}
                        onClick={() => setShowPopup(false)}
                        className="flex items-center gap-3 p-3 hover:bg-blue-50/60 transition group"
                      >
                        {/* Hình ảnh sản phẩm */}
                        <div className="w-12 h-12 relative shrink-0 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                          {featuredImage ? (
                            <Image
                              src={featuredImage}
                              alt={item.products.name}
                              fill
                              className="object-cover group-hover:scale-105 transition"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400">
                              No img
                            </div>
                          )}
                        </div>

                        {/* Thông tin tên và cấu hình */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-600 transition">
                            {item.products.name}{" "}
                            {item.storages?.value
                              ? `- ${item.storages.value}`
                              : ""}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                            {item.rams?.value && (
                              <span>RAM: {item.rams.value}</span>
                            )}
                            {item.colors?.name && (
                              <span>• Màu: {item.colors.name}</span>
                            )}
                          </div>
                          <div className="text-xs font-black text-rose-600 mt-1">
                            {formattedPrice}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-slate-500">
                  Không tìm thấy sản phẩm phù hợp với từ khóa &ldquo;{keyword}
                  &rdquo;
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions / Utilities */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Hotline */}
          <a
            href="tel:18001234"
            className="hidden lg:flex items-center gap-2 text-white hover:bg-blue-700/60 px-2.5 py-1.5 rounded-xl transition"
          >
            <PhoneCall className="w-4 h-4 text-blue-200" />
            <div className="text-left leading-tight">
              <span className="block text-[10px] text-blue-100 font-normal">
                Gọi mua hàng
              </span>
              <span className="font-bold text-xs text-white">1800.1234</span>
            </div>
          </a>

          {/* Tra cứu đơn hàng */}
          <Link
            href="/order"
            className="hidden md:flex items-center gap-1.5 text-white hover:bg-blue-700/60 px-2.5 py-1.5 rounded-xl transition text-xs font-semibold"
          >
            <Truck className="w-4 h-4 text-blue-200" />
            <span>Tra cứu đơn</span>
          </Link>

          {/* ================= PHẦN XÁC THỰC CLERK ================= */}
          <Show when="signed-out">
            <div className="flex items-center gap-1.5">
              <SignInButton mode="modal">
                <button className="flex items-center gap-1.5 bg-blue-700/60 hover:bg-blue-700 px-3 py-1.5 rounded-xl transition text-xs font-bold border border-blue-500/60">
                  <User className="w-4 h-4 text-blue-200" />
                  <span>Đăng nhập</span>
                </button>
              </SignInButton>

              <SignUpButton mode="modal">
                <button className="hidden md:flex items-center gap-1.5 bg-white text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-xl transition text-xs font-bold shadow-sm">
                  Đăng ký
                </button>
              </SignUpButton>
            </div>
          </Show>

          <Show when="signed-in">
            <div className="flex items-center gap-3 bg-blue-700/40 p-1 pl-3 rounded-2xl border border-blue-500/40">
              <div className="hidden md:flex flex-col items-end leading-tight">
                <span className="text-xs font-bold text-white max-w-[120px] truncate">
                  {user?.firstName || user?.username || "Tài khoản"}
                </span>
                <span className="text-[10px] text-blue-200 max-w-[120px] truncate">
                  {user?.primaryEmailAddress?.emailAddress}
                </span>
              </div>

              <UserButton
                appearance={{
                  elements: {
                    userButtonAvatarBox:
                      "w-8 h-8 rounded-full border-2 border-white/40 hover:border-white transition shadow-sm",
                  },
                }}
              >
                <UserButton.MenuItems>
                  <UserButton.Link
                    label="Địa chỉ giao hàng"
                    href="/addresses"
                    labelIcon={<MapPin className="w-4 h-4" />}
                  />
                </UserButton.MenuItems>
              </UserButton>

              <SignOutButton>
                <button
                  title="Đăng xuất"
                  className="p-1.5 text-blue-200 hover:text-white hover:bg-rose-600/80 rounded-xl transition-all"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </SignOutButton>
            </div>
          </Show>

          {/* Giỏ hàng */}
          <Link
            href="/cart"
            className="relative flex items-center gap-2 bg-white text-blue-600 hover:bg-blue-50 px-3.5 py-1.5 rounded-xl font-bold text-xs shadow-sm transition ml-1 shrink-0"
          >
            <ShoppingCart className="w-4 h-4 text-blue-600" />
            <span className="hidden sm:inline">Giỏ hàng</span>
            {isSignedIn && (
              <span className="absolute top-0 right-0 translate-x-1/3 -translate-y-1/3 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-black shadow z-10 border border-white">
                {cartItemCount}
              </span>
            )}
          </Link>

          {/* Thông báo */}
          {/* Thông báo yêu cầu đơn hàng */}
          {isSignedIn && (
            <Link
              href="/order/request"
              className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-blue-700/50 hover:bg-blue-700 border border-blue-500/50 text-white transition"
              title="Yêu cầu đơn hàng"
            >
              <Bell className="w-4 h-4" />

              {pendingRequestCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-black border-2 border-blue-600 shadow">
                  {pendingRequestCount > 99 ? "99+" : pendingRequestCount}
                </span>
              )}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
