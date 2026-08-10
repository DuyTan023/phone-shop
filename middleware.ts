import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Định nghĩa các route công khai (không cần đăng nhập)
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  // Bảo vệ tất cả các route không nằm trong danh sách công khai
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Bỏ qua các file nội bộ và tĩnh của Next.js
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Luôn chạy cho API routes
    "/(api|trpc)(.*)",
  ],
};
