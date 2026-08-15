import type { Metadata } from "next";
import { Inter as FontInter } from "next/font/google";

import { viVN } from "@clerk/localizations";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = FontInter({ subsets: ["vietnamese"] });

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
    <ClerkProvider localization={viVN}>
      <html lang="vi">
        <body
          className={`${inter.className} bg-slate-50 text-slate-900 flex flex-col min-h-screen`}
        >
          {/* <Header /> */}

          <main className="flex-grow">{children}</main>

          {/* <Footer /> */}
        </body>
      </html>
    </ClerkProvider>
  );
}
