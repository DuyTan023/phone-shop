"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart3,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  LayoutDashboard,
  MessageSquare,
  Package,
  Settings,
  ShoppingBag,
  Smartphone,
  Tag,
  TrendingUp,
  Users,
  Warehouse,
} from "lucide-react";

interface NavItem {
  title: string;
  icon: React.ElementType;
  href: string;
  active?: boolean;
  badge?: string | null;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

// ─── Sidebar nav items ───────────────────────────────────────────────
const navMain: NavSection[] = [
  {
    label: "Tổng quan",
    items: [
      {
        title: "Dashboard",
        icon: LayoutDashboard,
        href: "/admin",
        active: true,
      },
    ],
  },
  {
    label: "Quản lý sản phẩm",
    items: [
      {
        title: "Điện thoại",
        icon: Smartphone,
        href: "/admin/phones",
        badge: null,
      },
      {
        title: "Danh mục / Hãng",
        icon: Tag,
        href: "/admin/categories",
        badge: null,
      },
      {
        title: "Tồn kho",
        icon: Warehouse,
        href: "/admin/inventory",
        badge: "3",
      },
    ],
  },
  {
    label: "Bán hàng",
    items: [
      {
        title: "Đơn hàng",
        icon: ShoppingBag,
        href: "/admin/orders",
        badge: "12",
      },
      {
        title: "Khách hàng",
        icon: Users,
        href: "/admin/users",
        badge: null,
      },
    ],
  },
  {
    label: "Nội dung",
    items: [
      {
        title: "Bài viết trải nghiệm",
        icon: ClipboardList,
        href: "/admin/posts",
        badge: null,
      },
      {
        title: "Đánh giá sản phẩm",
        icon: MessageSquare,
        href: "/admin/reviews",
        badge: "5",
      },
    ],
  },
  {
    label: "Hệ thống",
    items: [
      {
        title: "Thống kê",
        icon: BarChart3,
        href: "/admin/analytics",
        badge: null,
      },
      {
        title: "Cài đặt",
        icon: Settings,
        href: "/admin/settings",
        badge: null,
      },
    ],
  },
];

// ─── Mock data ────────────────────────────────────────────────────────
const statsCards = [
  {
    title: "Doanh thu tháng",
    value: "847.2M",
    change: "+12.5%",
    up: true,
    sub: "So với tháng trước",
    color: "from-blue-500 to-blue-600",
    sparkline: [30, 45, 38, 55, 42, 68, 72, 65, 80, 74, 88, 95],
  },
  {
    title: "Đơn hàng hôm nay",
    value: "143",
    change: "+8.2%",
    up: true,
    sub: "So với hôm qua",
    color: "from-orange-500 to-orange-600",
    sparkline: [20, 35, 28, 45, 32, 58, 62, 55, 70, 64, 78, 85],
  },
  {
    title: "Sản phẩm bán chạy",
    value: "iPhone 16",
    change: "234 máy",
    up: true,
    sub: "Trong 30 ngày qua",
    color: "from-violet-500 to-violet-600",
    sparkline: [10, 25, 18, 35, 22, 48, 52, 45, 60, 54, 68, 75],
  },
  {
    title: "Tồn kho cảnh báo",
    value: "3",
    change: "-2 so sánh tuần",
    up: false,
    sub: "Sản phẩm sắp hết",
    color: "from-red-500 to-red-600",
    sparkline: [5, 8, 6, 9, 5, 3, 4, 6, 3, 2, 4, 3],
  },
];

const recentOrders = [
  {
    id: "#DH-20481",
    customer: "Nguyễn Văn An",
    product: "iPhone 16 Pro 256GB",
    amount: "₫31,990,000",
    status: "Đang giao",
    time: "10 phút trước",
  },
  {
    id: "#DH-20480",
    customer: "Trần Thị Bình",
    product: "Samsung Galaxy S25",
    amount: "₫22,490,000",
    status: "Đóng gói",
    time: "25 phút trước",
  },
  {
    id: "#DH-20479",
    customer: "Lê Minh Cường",
    product: "OPPO Reno 13",
    amount: "₫11,990,000",
    status: "Hoàn thành",
    time: "1 giờ trước",
  },
  {
    id: "#DH-20478",
    customer: "Phạm Thu Dung",
    product: "Xiaomi 15 Ultra",
    amount: "₫24,990,000",
    status: "Chờ xử lý",
    time: "2 giờ trước",
  },
  {
    id: "#DH-20477",
    customer: "Hoàng Anh Em",
    product: "Vivo V40 Pro",
    amount: "₫13,490,000",
    status: "Hủy đơn",
    time: "3 giờ trước",
  },
];

const topProducts = [
  {
    name: "iPhone 16 Pro Max 512GB",
    brand: "Apple",
    sold: 312,
    revenue: "₫374.4M",
    stock: 18,
  },
  {
    name: "Samsung Galaxy S25 Ultra",
    brand: "Samsung",
    sold: 278,
    revenue: "₫278M",
    stock: 24,
  },
  {
    name: "iPhone 15 Pro 256GB",
    brand: "Apple",
    sold: 241,
    revenue: "₫241M",
    stock: 5,
  },
  {
    name: "OPPO Find X8 Pro",
    brand: "OPPO",
    sold: 198,
    revenue: "₫178.2M",
    stock: 31,
  },
  {
    name: "Xiaomi 15 Ultra 256GB",
    brand: "Xiaomi",
    sold: 167,
    revenue: "₫150.3M",
    stock: 2,
  },
];

const statusConfig: Record<string, { label: string; class: string }> = {
  "Chờ xử lý": {
    label: "Chờ xử lý",
    class: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  "Đóng gói": {
    label: "Đóng gói",
    class: "bg-blue-100 text-blue-700 border-blue-200",
  },
  "Đang giao": {
    label: "Đang giao",
    class: "bg-indigo-100 text-indigo-700 border-indigo-200",
  },
  "Hoàn thành": {
    label: "Hoàn thành",
    class: "bg-green-100 text-green-700 border-green-200",
  },
  "Hủy đơn": {
    label: "Hủy đơn",
    class: "bg-red-100 text-red-700 border-red-200",
  },
};

// ─── Mini sparkline component ─────────────────────────────────────────
function Sparkline({ data, up }: { data: number[]; up: boolean }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const w = 80,
    h = 32;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * h;
    return `${x},${y}`;
  });
  const color = up ? "#86efac" : "#fca5a5";
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="opacity-80">
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ─── Revenue bar chart (pure SVG) ────────────────────────────────────
const monthlyRevenue = [
  { month: "T1", val: 420 },
  { month: "T2", val: 580 },
  { month: "T3", val: 510 },
  { month: "T4", val: 670 },
  { month: "T5", val: 590 },
  { month: "T6", val: 720 },
  { month: "T7", val: 800 },
  { month: "T8", val: 750 },
  { month: "T9", val: 840 },
  { month: "T10", val: 770 },
  { month: "T11", val: 910 },
  { month: "T12", val: 847 },
];
function RevenueBarChart() {
  const max = Math.max(...monthlyRevenue.map((d) => d.val));
  const chartH = 120,
    chartW = 400,
    barW = 22,
    gap = 12;
  const total = barW + gap;
  return (
    <svg
      viewBox={`0 0 ${chartW} ${chartH + 20}`}
      className="w-full"
      style={{ height: 148 }}
    >
      {monthlyRevenue.map((d, i) => {
        const barH = (d.val / max) * chartH;
        const x = i * total + 10;
        const y = chartH - barH;
        const isLast = i === monthlyRevenue.length - 1;
        return (
          <g key={d.month}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={barH}
              rx={4}
              fill={isLast ? "#3b82f6" : "#e2e8f0"}
            />
            <text
              x={x + barW / 2}
              y={chartH + 14}
              textAnchor="middle"
              fontSize={9}
              fill="#94a3b8"
            >
              {d.month}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function DashboardPage() {
  return (
    <div className="flex-1 overflow-y-auto space-y-6 py-2">
      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 p-5 text-white shadow-lg">
        <div className="relative z-10">
          <p className="text-sm font-medium text-blue-100">
            Xin chào, Admin 👋
          </p>
          <h2 className="mt-0.5 text-xl font-bold">Tổng quan hôm nay</h2>
          <p className="mt-1 text-sm text-blue-200">
            Có <strong className="text-white">12 đơn hàng</strong> mới và{" "}
            <strong className="text-white">3 sản phẩm</strong> sắp hết hàng cần
            xử lý.
          </p>
        </div>
        {/* Decorative circles */}
        <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-blue-500 opacity-30" />
        <div className="absolute -bottom-4 right-16 h-20 w-20 rounded-full bg-blue-400 opacity-20" />
        <Smartphone className="absolute right-6 bottom-4 h-12 w-12 text-blue-300 opacity-40" />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {statsCards.map((card) => (
          <Card
            key={card.title}
            className="overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <CardContent className="p-4">
              <div
                className={`mb-3 inline-flex rounded-lg bg-gradient-to-br ${card.color} p-2 shadow-sm`}
              >
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">{card.title}</p>
                  <p className="text-xl font-bold text-slate-900 font-mono tracking-tight">
                    {card.value}
                  </p>
                </div>
                <Sparkline data={card.sparkline} up={card.up} />
              </div>
              <div className="mt-2 flex items-center gap-1.5">
                {card.up ? (
                  <ChevronUp className="h-3.5 w-3.5 text-green-500" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5 text-red-500" />
                )}
                <span
                  className={`text-xs font-semibold ${card.up ? "text-green-600" : "text-red-600"}`}
                >
                  {card.change}
                </span>
                <span className="text-xs text-slate-400">{card.sub}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts + quick stats row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Revenue bar chart */}
        <Card className="col-span-2 border border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-5">
            <div>
              <CardTitle className="text-sm font-bold text-slate-800">
                Doanh thu theo tháng
              </CardTitle>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Năm 2025 • đơn vị: triệu đồng
              </p>
            </div>
            <NativeSelect>
              <NativeSelectOption value="2025">2025</NativeSelectOption>
              <NativeSelectOption value="2024">2024</NativeSelectOption>
            </NativeSelect>
          </CardHeader>
          <CardContent className="px-5 pb-4">
            <RevenueBarChart />
          </CardContent>
        </Card>

        {/* Order status donut-style summary */}
        <Card className="border border-slate-200 shadow-sm">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-sm font-bold text-slate-800">
              Trạng thái đơn hàng
            </CardTitle>
            <p className="text-[11px] text-slate-500">Tháng này</p>
          </CardHeader>
          <CardContent className="px-5 pb-4 space-y-3">
            {[
              {
                label: "Chờ xử lý",
                count: 28,
                pct: 19,
                color: "bg-yellow-400",
              },
              {
                label: "Đóng gói",
                count: 35,
                pct: 24,
                color: "bg-blue-400",
              },
              {
                label: "Đang giao",
                count: 52,
                pct: 36,
                color: "bg-indigo-500",
              },
              {
                label: "Hoàn thành",
                count: 24,
                pct: 17,
                color: "bg-green-500",
              },
              { label: "Hủy đơn", count: 6, pct: 4, color: "bg-red-400" },
            ].map((s) => (
              <div key={s.label} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">{s.label}</span>
                  <span className="font-semibold font-mono text-slate-800">
                    {s.count}
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-100">
                  <div
                    className={`h-1.5 rounded-full ${s.color}`}
                    style={{ width: `${s.pct}%` }}
                  />
                </div>
              </div>
            ))}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Tổng đơn</span>
              <span className="font-bold text-slate-900 font-mono">145</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tables row */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        {/* Recent orders */}
        <Card className="col-span-3 border border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3 pt-4 px-5">
            <div>
              <CardTitle className="text-sm font-bold text-slate-800">
                Đơn hàng gần đây
              </CardTitle>
              <p className="text-[11px] text-slate-500">Cập nhật realtime</p>
            </div>
            <Button variant="outline" size="sm" className="h-7 text-xs">
              Xem tất cả
            </Button>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-100 hover:bg-transparent">
                  <TableHead className="text-[11px] text-slate-500 font-semibold pl-5">
                    Mã ĐH
                  </TableHead>
                  <TableHead className="text-[11px] text-slate-500 font-semibold">
                    Khách hàng
                  </TableHead>
                  <TableHead className="text-[11px] text-slate-500 font-semibold hidden lg:table-cell">
                    Sản phẩm
                  </TableHead>
                  <TableHead className="text-[11px] text-slate-500 font-semibold">
                    Tiền
                  </TableHead>
                  <TableHead className="text-[11px] text-slate-500 font-semibold">
                    Trạng thái
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => {
                  const st = statusConfig[order.status];
                  return (
                    <TableRow
                      key={order.id}
                      className="border-slate-100 hover:bg-blue-50/40 cursor-pointer"
                    >
                      <TableCell className="pl-5 py-3">
                        <span className="text-xs font-mono font-semibold text-blue-600">
                          {order.id}
                        </span>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {order.time}
                        </p>
                      </TableCell>
                      <TableCell className="py-3">
                        <span className="text-xs font-medium text-slate-800">
                          {order.customer}
                        </span>
                      </TableCell>
                      <TableCell className="py-3 hidden lg:table-cell">
                        <span className="text-xs text-slate-600 max-w-[140px] truncate block">
                          {order.product}
                        </span>
                      </TableCell>
                      <TableCell className="py-3">
                        <span className="text-xs font-semibold font-mono text-slate-800">
                          {order.amount}
                        </span>
                      </TableCell>
                      <TableCell className="py-3 pr-5">
                        <span
                          className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold ${st.class}`}
                        >
                          {st.label}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Top products */}
        <Card className="col-span-2 border border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3 pt-4 px-5">
            <div>
              <CardTitle className="text-sm font-bold text-slate-800">
                Top sản phẩm
              </CardTitle>
              <p className="text-[11px] text-slate-500">30 ngày qua</p>
            </div>
            <Package className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent className="px-5 pb-4 space-y-3">
            {topProducts.map((p, i) => (
              <div key={p.name} className="flex items-center gap-3">
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                    i === 0
                      ? "bg-yellow-100 text-yellow-700"
                      : i === 1
                        ? "bg-slate-100 text-slate-600"
                        : i === 2
                          ? "bg-orange-100 text-orange-700"
                          : "bg-slate-50 text-slate-500"
                  }`}
                >
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate">
                    {p.name}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {p.brand} · {p.sold} máy
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold font-mono text-slate-800">
                    {p.revenue}
                  </p>
                  <p
                    className={`text-[10px] font-semibold ${p.stock <= 5 ? "text-red-500" : "text-slate-400"}`}
                  >
                    {p.stock <= 5 ? `⚠ ${p.stock} còn` : `${p.stock} còn`}
                  </p>
                </div>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-2 h-7 text-xs"
            >
              Xem toàn bộ sản phẩm
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Bottom spacer */}
      <div className="h-2" />
    </div>
  );
}
