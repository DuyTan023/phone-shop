"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  BarChart3,
  Bell,
  ChevronDown,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Search,
  Settings,
  ShoppingBag,
  Smartphone,
  Tag,
  Users,
  Warehouse,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
        href: "/admin/catalogs",
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
        href: "/admin/customers",
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

// ─── Sidebar component ────────────────────────────────────────────────
// function AdminSidebar() {
//   return (
//     <Sidebar className="border-r border-slate-200">
//       {/* Header */}
//       <SidebarHeader className="border-b border-slate-200 px-4 py-4">
//         <div className="flex items-center gap-3">
//           <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 shadow-md">
//             <Smartphone className="h-5 w-5 text-white" />
//           </div>
//           <div>
//             <p className="text-sm font-bold leading-tight text-slate-900">
//               PhoneStore
//             </p>
//             <p className="text-[11px] text-slate-500">Admin Panel</p>
//           </div>
//         </div>
//       </SidebarHeader>

//       {/* Nav */}
//       <SidebarContent className="px-2 py-2">
//         {navMain.map((section) => (
//           <SidebarGroup key={section.label}>
//             <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 px-2 mb-1">
//               {section.label}
//             </SidebarGroupLabel>
//             <SidebarGroupContent>
//               <SidebarMenu>
//                 {section.items.map((item) => (
//                   <SidebarMenuItem key={item.title}>
//                     <SidebarMenuButton
//                       asChild
//                       isActive={item.active || false}
//                       className={`rounded-lg text-slate-600 hover:bg-blue-50 hover:text-blue-700 transition-colors ${
//                         item.active
//                           ? "bg-blue-600 text-white hover:bg-blue-700 hover:text-white font-medium"
//                           : ""
//                       }`}
//                     >
//                       <Link
//                         href={item.href}
//                         className="flex items-center gap-2.5 px-3 py-2"
//                       >
//                         <item.icon className="h-4 w-4 shrink-0" />
//                         <span className="text-sm">{item.title}</span>
//                       </Link>
//                     </SidebarMenuButton>
//                     {item.badge && (
//                       <SidebarMenuBadge
//                         className={
//                           item.active
//                             ? "bg-blue-400 text-white"
//                             : "bg-red-100 text-red-600"
//                         }
//                       >
//                         {item.badge}
//                       </SidebarMenuBadge>
//                     )}
//                   </SidebarMenuItem>
//                 ))}
//               </SidebarMenu>
//             </SidebarGroupContent>
//           </SidebarGroup>
//         ))}
//       </SidebarContent>

//       {/* Footer */}
//       <SidebarFooter className="border-t border-slate-200 p-3">
//         <DropdownMenu>
//           <DropdownMenuTrigger asChild>
//             <button className="flex w-full items-center gap-3 rounded-lg px-2 py-2 hover:bg-slate-100 transition-colors">
//               <Avatar className="h-8 w-8">
//                 <AvatarImage src="/avatar.png" />
//                 <AvatarFallback className="bg-blue-600 text-white text-xs font-bold">
//                   AD
//                 </AvatarFallback>
//               </Avatar>
//               <div className="flex-1 text-left">
//                 <p className="text-xs font-semibold text-slate-800">
//                   Admin PhoneStore
//                 </p>
//                 <p className="text-[10px] text-slate-500">
//                   admin@phonestore.vn
//                 </p>
//               </div>
//               <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
//             </button>
//           </DropdownMenuTrigger>
//           <DropdownMenuContent align="end" className="w-48">
//             <DropdownMenuItem>
//               <Settings className="mr-2 h-4 w-4" />
//               Cài đặt
//             </DropdownMenuItem>
//             <DropdownMenuSeparator />
//             <DropdownMenuItem className="text-red-600">
//               <LogOut className="mr-2 h-4 w-4" />
//               Đăng xuất
//             </DropdownMenuItem>
//           </DropdownMenuContent>
//         </DropdownMenu>
//       </SidebarFooter>
//     </Sidebar>
//   );
// }

function AdminSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar className="border-r border-slate-200">
      {/* Header */}
      <SidebarHeader className="border-b border-slate-200 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 shadow-md">
            <Smartphone className="h-5 w-5 text-white" />
          </div>

          <div>
            <p className="text-sm font-bold leading-tight text-slate-900">
              PhoneStore
            </p>
            <p className="text-[11px] text-slate-500">Admin Panel</p>
          </div>
        </div>
      </SidebarHeader>

      {/* Menu */}
      <SidebarContent className="px-2 py-2">
        {navMain.map((section) => (
          <SidebarGroup key={section.label}>
            <SidebarGroupLabel className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              {section.label}
            </SidebarGroupLabel>

            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/admin" && pathname.startsWith(item.href));

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        className={`rounded-lg transition-colors ${
                          isActive
                            ? "bg-blue-600 text-white hover:bg-blue-700 hover:text-white"
                            : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                        }`}
                      >
                        <Link
                          href={item.href}
                          className="flex items-center gap-2.5 px-3 py-2"
                        >
                          <item.icon className="h-4 w-4 shrink-0" />
                          <span className="text-sm font-medium">
                            {item.title}
                          </span>
                        </Link>
                      </SidebarMenuButton>

                      {item.badge && (
                        <SidebarMenuBadge
                          className={
                            isActive
                              ? "bg-blue-400 text-white"
                              : "bg-red-100 text-red-600"
                          }
                        >
                          {item.badge}
                        </SidebarMenuBadge>
                      )}
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t border-slate-200 p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-slate-100">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/avatar.png" />
                <AvatarFallback className="bg-blue-600 text-xs font-bold text-white">
                  AD
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 text-left">
                <p className="text-xs font-semibold text-slate-800">
                  Admin PhoneStore
                </p>

                <p className="text-[10px] text-slate-500">
                  admin@phonestore.vn
                </p>
              </div>

              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Cài đặt
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

// ─── Main Layout ──────────────────────────────────────────────
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-slate-50 font-sans">
        <AdminSidebar />

        {/* Main content wrapper */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Top header */}
          <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="text-slate-500 hover:text-slate-900" />
              <div>
                <h1 className="text-base font-bold text-slate-900">
                  Dashboard
                </h1>
                <p className="text-[11px] text-slate-500">
                  {new Date().toLocaleDateString("vi-VN", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative hidden sm:block">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm đơn hàng, sản phẩm..."
                  className="h-8 w-64 rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Notifications */}
              <button className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50">
                <Bell className="h-4 w-4" />
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                  7
                </span>
              </button>

              <Avatar className="h-8 w-8 cursor-pointer">
                <AvatarFallback className="bg-blue-600 text-white text-xs font-bold">
                  AD
                </AvatarFallback>
              </Avatar>
            </div>
          </header>

          {/* Children content */}
          <main className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
