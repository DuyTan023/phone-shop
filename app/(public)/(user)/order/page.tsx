import { requireAuth } from "@/lib/clerk-auth/authorization";
import { OrderListPage } from "@/lib/components/ui/order/order-list-page";

export default async function OrderPage() {
  await requireAuth("/order");

  return <OrderListPage />;
}
