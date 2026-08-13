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
  LogOut,
  MapPin,
  PhoneCall,
  Search,
  ShoppingCart,
  Truck,
  User,
} from "lucide-react";
import Link from "next/link";

export default function Header() {
  console.log("HEADER RENDERED");
  const { user } = useUser();

  const { isLoaded, isSignedIn } = useAuth();

  console.log("CLERK STATUS:", {
    isLoaded,
    isSignedIn,
  });

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

        {/* Thanh tìm kiếm */}
        <div className="flex-1 max-w-lg relative">
          <input
            type="text"
            placeholder="Bạn tìm điện thoại gì? (iPhone 15, Galaxy S24...)"
            className="w-full pl-4 pr-10 py-2 bg-white text-slate-900 placeholder:text-slate-400 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-inner transition"
          />
          <button className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition">
            <Search className="w-4 h-4" />
          </button>
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
            href="/lookup"
            className="hidden md:flex items-center gap-1.5 text-white hover:bg-blue-700/60 px-2.5 py-1.5 rounded-xl transition text-xs font-semibold"
          >
            <Truck className="w-4 h-4 text-blue-200" />
            <span>Tra cứu đơn</span>
          </Link>

          {/* ================= PHẦN XÁC THỰC CLERK ================= */}

          {/* CHƯA ĐĂNG NHẬP: Hiển thị nút Đăng Nhập & Đăng Ký */}
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

          {/* ĐÃ ĐĂNG NHẬP: Hiển thị Profile + Nút Đăng xuất */}
          <Show when="signed-in">
            <div className="flex items-center gap-3 bg-blue-700/40 p-1 pl-3 rounded-2xl border border-blue-500/40">
              {/* Tên & Email người dùng */}
              <div className="hidden md:flex flex-col items-end leading-tight">
                <span className="text-xs font-bold text-white max-w-[120px] truncate">
                  {user?.firstName || user?.username || "Tài khoản"}
                </span>
                <span className="text-[10px] text-blue-200 max-w-[120px] truncate">
                  {user?.primaryEmailAddress?.emailAddress}
                </span>
              </div>

              {/* Avatar Clerk */}
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
                    href="/account/addresses"
                    labelIcon={<MapPin className="w-4 h-4" />}
                  />
                </UserButton.MenuItems>
              </UserButton>

              {/* Nút Đăng xuất trực tiếp */}
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

            {/* Badge số lượng - Đã tối ưu vị trí */}
            <span className="absolute top-0 right-0 translate-x-1/3 -translate-y-1/3 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-black shadow z-10 border border-white">
              2
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
