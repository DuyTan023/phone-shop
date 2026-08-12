// app/admin/layout.tsx
import { requireAdmin } from "@/lib/clerk-auth/authorization";
import AdminLayoutClient from "@/lib/components/ui/public/home/admin/AdminLayoutClient";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Kiểm tra quyền admin ở server-side
  await requireAdmin();

  // Nếu có quyền, render client layout
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
