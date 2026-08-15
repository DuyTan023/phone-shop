// app/admin/layout.tsx
import Header from "@/lib/components/ui/public/home/Header";

import Footer from "@/lib/components/ui/public/home/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TechPhone - Cửa hàng điện thoại uy tín",
  description: "Chuyên cung cấp các dòng điện thoại chính hãng giá tốt nhất",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Header />

      <div className="flex-grow">{children}</div>

      <Footer />
    </div>
  );
}
