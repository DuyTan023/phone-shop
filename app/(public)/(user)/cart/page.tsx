import { requireAuth } from "@/lib/clerk-auth/authorization";
import CartPage from "@/lib/components/ui/cart/CartPage";

export default async function Page() {
  await requireAuth("/cart");

  return <CartPage />;
}
