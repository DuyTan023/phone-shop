import {
  Headphones,
  MapPin,
  PhoneCall,
  RotateCcw,
  ShieldCheck,
  Truck,
} from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-12 border-t border-slate-800">
      {/* 1. Lợi ích - Căn chuẩn max-w-7xl */}
      <div className="border-b border-slate-800 bg-slate-950/50">
        <div className="container mx-auto px-4 max-w-7xl py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <Truck className="w-8 h-8 text-blue-500 shrink-0" />
            <div>
              <h4 className="text-white font-semibold text-sm">
                Giao hàng nhanh chóng
              </h4>
              <p className="text-xs text-slate-400">Ship COD toàn quốc</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <RotateCcw className="w-8 h-8 text-blue-500 shrink-0" />
            <div>
              <h4 className="text-white font-semibold text-sm">
                Đổi trả dễ dàng
              </h4>
              <p className="text-xs text-slate-400">1 đổi 1 trong 30 ngày</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-blue-500 shrink-0" />
            <div>
              <h4 className="text-white font-semibold text-sm">
                Bảo hành chính hãng
              </h4>
              <p className="text-xs text-slate-400">Cam kết 100% chính hãng</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Headphones className="w-8 h-8 text-blue-500 shrink-0" />
            <div>
              <h4 className="text-white font-semibold text-sm">Hỗ trợ 24/7</h4>
              <p className="text-xs text-slate-400">Hotline: 1800.1234</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Cột thông tin Footer - Căn chuẩn max-w-7xl */}
      <div className="container mx-auto px-4 max-w-7xl py-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-sm">
        <div>
          <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
            <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-sm font-black">
              TP
            </span>{" "}
            TechPhone
          </h3>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            Hệ thống bán lẻ điện thoại di động, máy tính bảng, phụ kiện chính
            hãng giá tốt nhất thị trường.
          </p>
          <div className="space-y-2 text-xs">
            <p className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <span>123 Đường 3/2, Quận Ninh Kiều, TP. Cần Thơ</span>
            </p>
            <p className="flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-blue-500 shrink-0" />
              <span>1800.1234 (Miễn phí)</span>
            </p>
          </div>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">Thông Tin Hỗ Trợ</h4>
          <ul className="space-y-2 text-xs text-slate-400">
            <li>
              <Link href="#" className="hover:text-blue-400 transition">
                Chính sách bảo hành
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-blue-400 transition">
                Chính sách đổi trả
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-blue-400 transition">
                Chính sách giao hàng
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-blue-400 transition">
                Hướng dẫn mua hàng online
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-blue-400 transition">
                Hướng dẫn thanh toán
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">Danh Mục Hot</h4>
          <ul className="space-y-2 text-xs text-slate-400">
            <li>
              <Link href="#" className="hover:text-blue-400 transition">
                iPhone 15 Series
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-blue-400 transition">
                Samsung Galaxy S24 Ultra
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-blue-400 transition">
                Xiaomi Redmi Note 13
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-blue-400 transition">
                Điện thoại gập Flip / Fold
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-blue-400 transition">
                Sạc dự phòng chính hãng
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">
            Thanh Toán & Kết Nối
          </h4>
          <p className="text-xs text-slate-400 mb-3">
            Chấp nhận thanh toán qua:
          </p>
          <div className="flex flex-wrap gap-2 mb-6">
            {["Visa", "Mastercard", "Momo", "VNPay", "Trả góp 0%"].map(
              (pay, i) => (
                <span
                  key={i}
                  className="bg-slate-800 text-slate-300 text-[10px] px-2.5 py-1 rounded border border-slate-700 font-medium"
                >
                  {pay}
                </span>
              ),
            )}
          </div>
        </div>
      </div>

      {/* 3. Bản quyền - Căn chuẩn max-w-7xl */}
      <div className="border-t border-slate-800 py-4">
        <div className="container mx-auto px-4 max-w-7xl text-center text-xs text-slate-500">
          © {new Date().getFullYear()} TechPhone. Tất cả quyền được bảo lưu.
        </div>
      </div>
    </footer>
  );
}
