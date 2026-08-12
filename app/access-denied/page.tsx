// app/access-denied/page.tsx
"use client";

import { ArrowLeft, Home, ShieldX } from "lucide-react";
import Link from "next/link";

export default function AccessDeniedPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-grid-slate-200/20 bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_at_center,white,transparent)]"></div>
      <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-red-100/30 blur-3xl"></div>
      <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-blue-100/30 blur-3xl"></div>

      <div className="relative z-10 text-center">
        {/* Animated icon */}
        <div className="mx-auto mb-8 flex h-28 w-28 animate-bounce items-center justify-center rounded-full bg-gradient-to-br from-red-100 to-red-200 shadow-lg shadow-red-200/50">
          <ShieldX className="h-14 w-14 text-red-600" strokeWidth={1.5} />
        </div>

        {/* Status code */}
        <div className="mb-4 text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-400 select-none">
          403
        </div>

        {/* Title */}
        <h1 className="mb-3 text-3xl font-bold text-slate-900 md:text-4xl">
          Bạn không có quyền truy cập
        </h1>

        {/* Description */}
        <p className="mx-auto max-w-md text-base text-slate-600 md:text-lg">
          Trang này chỉ dành cho quản trị viên. Vui lòng quay lại trang chủ để
          tiếp tục sử dụng.
        </p>

        {/* Action buttons */}
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/"
            className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-600/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
          >
            <Home className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
            Về trang chủ
          </Link>

          <Link
            href="/"
            className="group inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-8 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
            Quay lại
          </Link>
        </div>

        {/* Additional info */}
        <div className="mt-8 rounded-lg border border-slate-200 bg-white/50 px-4 py-3 backdrop-blur-sm">
          <p className="text-xs text-slate-500">
            <span className="font-medium text-slate-700">Lưu ý:</span> Nếu bạn
            nghĩ đây là lỗi, vui lòng liên hệ quản trị viên để được hỗ trợ.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 left-0 right-0 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} - Bạn không có quyền truy cập trang này
      </div>
    </div>
  );
}
