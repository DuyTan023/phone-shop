// app/checkout/page.tsx
// app/(public)/(user)/order/page.tsx

import { requireAuth } from "@/lib/clerk-auth/authorization";
import { CheckoutPage } from "@/lib/components/ui/checkout/checkout-page";

export default async function OrderPage() {
  // Lấy thông tin user hiện tại thông qua helper của bạn
  // Nếu chưa đăng nhập, nó sẽ tự động redirect tới /sign-in
  const currentUser = await requireAuth("/order");

  // Truyền user thật xuống Client Component CheckoutPage
  return <CheckoutPage initialUser={currentUser} />;
}
